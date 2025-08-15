import { MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb';

// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

// Log function
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[MongoDB]', new Date().toISOString(), ...args);
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
  debugLog(`Connecting to MongoDB at ${url.protocol}//${url.hostname}${url.pathname ? ` (database: ${url.pathname.split('/').pop()})` : ''}`);
} catch (error) {
  console.error('Error parsing MONGODB_URI:', error instanceof Error ? error.message : 'Unknown error');
}

// MongoDB client options
const options: MongoClientOptions = {
  // Connection timeouts
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 10000,
  
  // TLS/SSL configuration for Atlas
  tls: process.env.MONGODB_URI?.includes('mongodb+srv://'),
  tlsInsecure: false,
  
  // Use the new Server API version
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  
  // Authentication
  authMechanism: 'DEFAULT',
  authSource: 'admin',
  
  // Enable command monitoring for debugging
  monitorCommands: DEBUG,
};

// Extend NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Create a new MongoClient instance
client = new MongoClient(uri, options);

// Add event listeners for debugging
if (DEBUG) {
  client.on('commandStarted', (event) => {
    console.log(`[MongoDB] Command started: ${event.commandName}`, {
      database: event.databaseName,
      collection: event.command.collection,
      command: event.command,
    });
  });

  client.on('commandSucceeded', (event) => {
    console.log(`[MongoDB] Command succeeded: ${event.commandName}`, {
      duration: event.duration,
      reply: event.reply,
    });
  });

  client.on('commandFailed', (event) => {
    console.error(`[MongoDB] Command failed: ${event.commandName}`, {
      duration: event.duration,
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

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection across module reloads
  if (!global._mongoClientPromise) {
    debugLog('Creating new MongoDB client instance (development mode)');
    global._mongoClientPromise = (async () => {
      try {
        debugLog('Connecting to MongoDB...');
        await client.connect();
        debugLog('Successfully connected to MongoDB');
        
        // Verify the connection
        const db = client.db('users');
        await db.command({ ping: 1 });
        debugLog('Database ping successful');
        
        // List all collections for debugging
        const collections = await db.listCollections().toArray();
        debugLog('Available collections:', collections.map(c => c.name).join(', '));
        
        return client;
      } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    })();
  } else {
    debugLog('Using existing MongoDB client from global (development mode)');
  }
  
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, avoid using a global variable
  debugLog('Creating new MongoDB client instance (production mode)');
  
  clientPromise = (async () => {
    try {
      debugLog('Connecting to MongoDB...');
      await client.connect();
      debugLog('Successfully connected to MongoDB');
      
      // Verify the connection
      const db = client.db('users');
      await db.command({ ping: 1 });
      debugLog('Database ping successful');
      
      return client;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  })();
}

// Export a module-scoped MongoClient promise to ensure the client is connected only once
export default clientPromise;
