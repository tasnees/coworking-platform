import { MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb';

// Enable debug logging in development only
const DEBUG = process.env.NODE_ENV === 'development';

// Log function that only logs in development
function debugLog(...args: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[MongoDB]', new Date().toISOString(), ...args);
  }
}

if (!process.env.MONGODB_URI) {
  const errorMsg = 'Invalid/Missing environment variable: "MONGODB_URI"';
  debugLog('❌', errorMsg);
  throw new Error(errorMsg);
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  // Use the new Server API version
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Enable command monitoring for debugging
  monitorCommands: DEBUG,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Log connection details (without sensitive data)
try {
  const url = new URL(uri);
  debugLog(`Connecting to MongoDB at ${url.protocol}//${url.hostname}${url.pathname ? ` (database: ${url.pathname.split('/').pop()})` : ''}`);
} catch (error) {
  debugLog('Error parsing MONGODB_URI:', error instanceof Error ? error.message : 'Unknown error');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection across module reloads
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    debugLog('Creating new MongoDB client instance (development mode)');
    client = new MongoClient(uri, options);
    
    // Add event listeners for connection monitoring
    client.on('serverOpening', () => debugLog('Server opening...'));
    client.on('serverClosed', () => debugLog('Server closed'));
    client.on('serverHeartbeatSucceeded', (event) => debugLog('Heartbeat succeeded:', event.reply));
    client.on('serverHeartbeatFailed', (event) => debugLog('Heartbeat failed:', event.failure));
    
    globalWithMongo._mongoClientPromise = (async () => {
      try {
        debugLog('Connecting to MongoDB...');
        await client.connect();
        debugLog('Successfully connected to MongoDB');
        
        // Verify the connection
        const db = client.db();
        await db.command({ ping: 1 });
        debugLog('Database ping successful');
        
        return client;
      } catch (error) {
        debugLog('❌ Failed to connect to MongoDB:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    })();
  } else {
    debugLog('Using existing MongoDB client from global (development mode)');
  }
  
  clientPromise = globalWithMongo._mongoClientPromise!;
} else {
  // In production mode, avoid using a global variable
  debugLog('Creating new MongoDB client instance (production mode)');
  client = new MongoClient(uri, options);
  
  // Add event listeners for connection monitoring
  client.on('serverOpening', () => debugLog('Server opening...'));
  client.on('serverClosed', () => debugLog('Server closed'));
  
  clientPromise = (async () => {
    try {
      debugLog('Connecting to MongoDB...');
      await client.connect();
      debugLog('Successfully connected to MongoDB');
      
      // Verify the connection
      const db = client.db();
      await db.command({ ping: 1 });
      debugLog('Database ping successful');
      
      return client;
    } catch (error) {
      debugLog('❌ Failed to connect to MongoDB:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  })();
}

// Export a module-scoped MongoClient promise to ensure the client is connected only once
export default clientPromise;
