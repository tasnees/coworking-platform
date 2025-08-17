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

// Simple MongoDB client options
const options: MongoClientOptions = {
  // Connection settings
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000,
  heartbeatFrequencyMS: 10000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
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
  }
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

// Handle process termination
process.on('SIGINT', async () => {
  debugLog('SIGINT received - closing MongoDB connection');
  try {
    const client = await clientPromise;
    await client.close();
    debugLog('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

// Export a module-scoped MongoClient promise to ensure the client is connected only once
export default clientPromise;
