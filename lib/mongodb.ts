import { MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb';

// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

// Log function with consistent formatting
function debugLog(message: string, ...args: any[]) {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    if (args.length > 0) {
      console.log(`[MongoDB][${timestamp}] ${message}`, ...args);
    } else {
      console.log(`[MongoDB][${timestamp}] ${message}`);
    }
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

// MongoDB client options
const options: MongoClientOptions = {
  // Connection pool settings
  maxPoolSize: 10,  // Maximum number of connections in the connection pool
  minPoolSize: 1,   // Minimum number of connections in the connection pool
  maxIdleTimeMS: 30000, // Max time a connection can be idle before being removed
  waitQueueTimeoutMS: 10000, // Max time to wait for a connection to become available
  
  // Connection timeouts
  connectTimeoutMS: 30000, // Time to wait for a new connection to be established
  socketTimeoutMS: 45000,  // Time to wait for a response from the server
  serverSelectionTimeoutMS: 30000, // Time to wait for server selection
  heartbeatFrequencyMS: 10000,  // Check server status every 10 seconds
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  maxConnecting: 5, // Maximum number of connections to create in parallel when establishing connections
  
  // Replica set and high availability
  replicaSet: 'atlas-14a9qh-shard-0', // If using a replica set
  readPreference: 'primaryPreferred',  // Prefer primary, but can read from secondaries
  w: 'majority', // Write concern: wait for write to propagate to majority of nodes
  
  // TLS/SSL
  ssl: true, // Enable SSL/TLS
  tlsAllowInvalidCertificates: false, // Don't allow invalid certificates
  tlsAllowInvalidHostnames: false, // Don't allow invalid hostnames
  
  // Monitoring and events
  monitorCommands: true, // Enable command monitoring for debugging
  
  // Authentication and security
  authMechanism: 'SCRAM-SHA-1', // Default authentication mechanism
  authSource: 'admin', // Default authentication database
  
  // TLS/SSL configuration for Atlas
  tls: process.env.MONGODB_URI?.includes('mongodb+srv://'),
  tlsInsecure: false,
  
  // Use the new Server API version
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

// Extend NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoDbPromise: Promise<any> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let dbPromise: Promise<any>;

// Create a new MongoClient instance
client = new MongoClient(uri, options);

// Add event listeners for connection monitoring
client.on('serverOpening', () => {
  debugLog('MongoDB server opening connection');
});

client.on('serverClosed', () => {
  console.warn('⚠️ MongoDB server connection closed');
});

client.on('topologyOpening', () => {
  debugLog('MongoDB topology opening');
});

client.on('topologyClosed', () => {
  console.warn('⚠️ MongoDB topology closed');
});

client.on('serverHeartbeatSucceeded', (event) => {
  debugLog(`MongoDB server heartbeat succeeded (${event.awaited}ms)`);
});

client.on('serverHeartbeatFailed', (event) => {
  const duration = event.duration || 0;
  const errorMessage = event.failure?.message || 'Unknown error';
  console.error(`❌ MongoDB server heartbeat failed after ${duration}ms:`, errorMessage);
});

// Add event listeners for debugging
if (DEBUG) {
  client.on('commandStarted', (event) => {
    debugLog(`Command started: ${event.commandName}`, {
      database: event.databaseName,
      collection: event.command.collection,
      command: event.command,
    });
  });

  client.on('commandSucceeded', (event) => {
    debugLog(`Command succeeded: ${event.commandName} (${event.duration}ms)`);
  });

  client.on('commandFailed', (event) => {
    console.error(`❌ Command failed: ${event.commandName} (${event.duration}ms)`, {
      failure: event.failure,
    });
  });

  client.on('serverOpening', () => {
    console.log('[MongoDB] Server opening...');
  });

  client.on('serverClosed', () => {
    console.log('[MongoDB] Server closed');
  });
}

// Get the database name from the connection string or use a default
const getDatabaseName = (): string => {
  try {
    const url = new URL(process.env.MONGODB_URI || '');
    return url.pathname.split('/').filter(Boolean).pop() || 'coworking-platform';
  } catch (error) {
    return 'coworking-platform';
  }
};

const DATABASE_NAME = getDatabaseName();

debugLog(`Using database: ${DATABASE_NAME}`);

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    debugLog('Creating new MongoDB client instance (development mode)');
    global._mongoClientPromise = (async () => {
      try {
        debugLog('Connecting to MongoDB...');
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
        console.error('Failed to connect to MongoDB:', error);
        throw error;
      }
    })();
    
    // Create a database promise
    global._mongoDbPromise = global._mongoClientPromise.then(client => {
      return client.db(DATABASE_NAME);
    });
  }
  
  clientPromise = global._mongoClientPromise;
  dbPromise = global._mongoDbPromise!;
} else {
  // In production mode, create new instances
  clientPromise = (async () => {
    debugLog('Creating new MongoDB client instance (production mode)');
    try {
      await client.connect();
      debugLog(`Successfully connected to MongoDB (${DATABASE_NAME})`);
      
      // Verify the connection in production as well
      const db = client.db(DATABASE_NAME);
      await db.command({ ping: 1 });
      debugLog('Database ping successful in production');
      
      // List collections in production for debugging
      const collections = await db.listCollections().toArray();
      debugLog('Available collections in production:', collections.map(c => c.name));
      
      return client;
      return client;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      console.error('❌ Failed to connect to MongoDB:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  })();
}

// Export a module-scoped MongoClient promise to ensure the client is connected only once
export default clientPromise;
