import { MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb';

// Enable debug logging
const DEBUG = true; // Always enable debug logging for now

// Log function with consistent formatting
function debugLog(message: string, ...args: any[]) {
  const timestamp = new Date().toISOString();
  const logMessage = `[MongoDB][${timestamp}] ${message}`;
  
  if (args.length > 0) {
    console.log(logMessage, ...args);
  } else {
    console.log(logMessage);
  }
}

// Check for required environment variable
if (!process.env.MONGODB_URI) {
  const errorMsg = 'Invalid/Missing environment variable: "MONGODB_URI"';
  console.error('❌', errorMsg);
  throw new Error(errorMsg);
}

const uri = process.env.MONGODB_URI;

// Log connection details (without sensitive data)
try {
  const url = new URL(uri);
  const host = url.hostname;
  const port = url.port ? `:${url.port}` : '';
  const dbName = url.pathname ? url.pathname.split('/').filter(Boolean).pop() : 'default';
  
  debugLog(`Connecting to MongoDB at ${url.protocol}//${host}${port} (database: ${dbName})`);
} catch (error) {
  console.error('❌ Error parsing MONGODB_URI:', error instanceof Error ? error.message : 'Unknown error');
  throw error;
}

// MongoDB client options optimized for serverless and containerized environments
const options: MongoClientOptions = {
  // Connection pooling
  maxPoolSize: 10, // Reduced for Render's free tier
  minPoolSize: 1, // Keep at least 1 connection alive
  maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
  waitQueueTimeoutMS: 10000, // Max time to wait for a connection from the pool
  
  // Timeouts and connection settings
  connectTimeoutMS: 10000, // 10 seconds to establish initial connection
  socketTimeoutMS: 30000,  // Close sockets after 30s of inactivity
  heartbeatFrequencyMS: 10000, // Send a heartbeat every 10 seconds
  serverSelectionTimeoutMS: 10000, // Time to select a server for operations
  
  // Retry settings - important for serverless environments
  retryWrites: true,
  retryReads: true,
  maxConnecting: 5, // Maximum number of simultaneous connection attempts
  
  // TLS/SSL - simplified for Atlas
  tls: uri.startsWith('mongodb+srv'),
  tlsAllowInvalidCertificates: false,
  
  // Monitoring
  monitorCommands: true,
  
  // Server API version
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true
  },
  
  // Compression
  compressors: ['zlib', 'snappy', 'zstd'], // Enable compression for better performance
  zlibCompressionLevel: 3 // Compression level (1-9, where 9 is highest compression)
};

// Extend NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoDbPromise: Promise<any> | undefined;
  // eslint-disable-next-line no-var
  var _mongoConnectionAttempts: number;
}

// Initialize global connection attempts counter
if (!global._mongoConnectionAttempts) {
  global._mongoConnectionAttempts = 0;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let dbPromise: Promise<any>;

// Create a new MongoClient instance with enhanced error handling
const createMongoClient = () => {
  debugLog('Creating new MongoDB client instance');
  const newClient = new MongoClient(uri, options);

  // Add event listeners for connection monitoring
  newClient.on('serverOpening', () => {
    debugLog('MongoDB server opening connection');
  });

  newClient.on('serverClosed', () => {
    console.warn('⚠️ MongoDB server connection closed');
  });

  newClient.on('topologyOpening', () => {
    debugLog('MongoDB topology opening');
  });

  newClient.on('topologyClosed', () => {
    console.warn('⚠️ MongoDB topology closed');
  });

  newClient.on('serverHeartbeatSucceeded', (event) => {
    debugLog(`MongoDB server heartbeat succeeded (${event.awaited}ms)`);
  });

  newClient.on('serverHeartbeatFailed', (event) => {
    const duration = event.duration || 0;
    const errorMessage = event.failure?.message || 'Unknown error';
    console.error(`❌ MongoDB server heartbeat failed after ${duration}ms:`, errorMessage);
    
    // Attempt to reconnect on heartbeat failure
    if (global._mongoConnectionAttempts < 3) {
      global._mongoConnectionAttempts++;
      debugLog(`Attempting to reconnect (attempt ${global._mongoConnectionAttempts}/3)`);
      setTimeout(async () => {
        try {
          await newClient.connect();
          debugLog('Successfully reconnected to MongoDB');
        } catch (err) {
          console.error('❌ Failed to reconnect to MongoDB:', (err as Error).message);
        }
      }, 1000 * global._mongoConnectionAttempts); // Exponential backoff
    }
  });

  // Add command monitoring for debugging
  newClient.on('commandStarted', (event) => {
    debugLog(`Command started: ${event.commandName}`, {
      database: event.databaseName,
      collection: event.command.collection,
    });
  });

  newClient.on('commandSucceeded', (event) => {
    debugLog(`Command succeeded: ${event.commandName} (${event.duration}ms)`);
  });

  newClient.on('commandFailed', (event) => {
    console.error(`❌ Command failed: ${event.commandName} (${event.duration}ms)`, {
      failure: event.failure?.message || 'Unknown error',
    });
  });

  return newClient;
};

// Initialize the client
client = createMongoClient();

// Always use 'coworking-platform' as the database name
const getDatabaseName = (): string => {
  return 'coworking-platform';
};

const DATABASE_NAME = getDatabaseName();

// Create a function to get the database with the correct name
export const getDb = async () => {
  const client = await clientPromise;
  return client.db(DATABASE_NAME);
};

debugLog(`Using database: ${DATABASE_NAME}`);

// Function to establish MongoDB connection with retry logic
const connectWithRetry = async (maxRetries = 3, retryDelay = 1000) => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      debugLog(`Connection attempt ${attempt} of ${maxRetries}`);
      await client.connect();
      debugLog('Successfully connected to MongoDB');
      
      // Verify the connection
      const db = client.db(DATABASE_NAME);
      await db.command({ ping: 1 });
      debugLog('Database ping successful');
      
      // List all collections for debugging
      const collections = await db.listCollections().toArray();
      debugLog('Available collections:', collections.map(c => c.name));
      
      return client;
    } catch (error) {
      lastError = error as Error;
      console.error(`Connection attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        debugLog(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        // Create a new client for the retry
        client = createMongoClient();
      }
    }
  }
  
  throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts: ${lastError?.message}`);
};

// In development mode, use a global variable to preserve the connection across HMR
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    debugLog('Initializing MongoDB client (development mode)');
    global._mongoClientPromise = connectWithRetry().catch(error => {
      console.error('Failed to initialize MongoDB client:', error);
      console.error('❌ Failed to connect to MongoDB:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    });
    
    // Set up database promise
    global._mongoDbPromise = global._mongoClientPromise.then(client => {
      return client.db(DATABASE_NAME);
    });
  }
  
  clientPromise = global._mongoClientPromise;
  dbPromise = global._mongoDbPromise!;
} else {
  // In production, don't use global variable
  debugLog('Initializing MongoDB client (production mode)');
  clientPromise = connectWithRetry().catch(error => {
    console.error('Failed to initialize MongoDB client:', error);
    throw error;
  });
  
  dbPromise = clientPromise.then(client => client.db(DATABASE_NAME));
}

// Handle process termination with platform-aware cleanup
const cleanup = async (signal?: string) => {
  try {
    if (signal) {
      debugLog(`${signal} received - cleaning up MongoDB connection...`);
    } else {
      debugLog('Cleaning up MongoDB connection...');
    }
    
    const client = await clientPromise;
    
    // Only close if we're not in a serverless environment
    // In serverless, the connection will be automatically cleaned up when the function ends
    if (process.env.NODE_ENV !== 'production' || !process.env.IS_SERVERLESS) {
      await client.close();
      debugLog('MongoDB connection closed');
    } else {
      debugLog('Skipping explicit close in serverless environment');
    }
  } catch (error) {
    // In production, don't crash the app if cleanup fails
    console.error('Error during MongoDB connection cleanup:', error);
  }
};

// Handle different termination signals with platform awareness
const handleShutdown = async (signal: string) => {
  debugLog(`${signal} received - initiating graceful shutdown...`);
  
  // Set a timeout to force exit if cleanup takes too long
  const forceShutdown = setTimeout(() => {
    console.warn('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000); // 10 second timeout
  
  try {
    await cleanup(signal);
    clearTimeout(forceShutdown);
    
    // Exit with success code for normal termination signals
    if (['SIGINT', 'SIGTERM'].includes(signal)) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Register signal handlers for different environments
if (!process.env.IS_SERVERLESS) {
  // Standard process signals
  ['SIGINT', 'SIGTERM', 'SIGUSR2'].forEach((signal) => {
    process.on(signal, () => handleShutdown(signal));
  });
  
  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await cleanup('uncaughtException');
    process.exit(1);
  });
  
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    await cleanup('unhandledRejection');
    process.exit(1);
  });
  
  // Handle process exit (for platforms that don't send signals)
  process.on('exit', (code) => {
    debugLog(`Process exiting with code ${code}`);
  });
  
  // Handle platform-specific events
  if (process.env.RENDER) {
    debugLog('Running on Render platform - enabling platform-specific optimizations');
    // Render sends SIGTERM on shutdown
  }
  
  // Add a keep-alive interval for platforms that need it
  if (process.env.ENABLE_KEEP_ALIVE) {
    debugLog('Enabling keep-alive for platform compatibility');
    setInterval(() => {
      debugLog('Keep-alive ping');
    }, 30000); // 30 seconds
  }
}

// Export a module-scoped MongoClient promise to ensure the client is connected only once
export default clientPromise;
