import { MongoClient, MongoClientOptions, Db, Collection, Document } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!process.env.MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

// Export types for convenience
export type { Db, Collection, Document, MongoClient, MongoClientOptions } from 'mongodb';

// Type for our database connection
export type DatabaseConnection = {
  client: MongoClient;
  db: Db;
};

// In development mode, use a global variable to preserve the connection across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<DatabaseConnection> | undefined;
  // For backward compatibility
  // eslint-disable-next-line no-var
  var _mongoClient: Promise<MongoClient> | undefined;
}

const options: MongoClientOptions = {
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
  tls: MONGODB_URI.startsWith('mongodb+srv'),
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

// Create a new MongoClient
const createClient = (): MongoClient => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  return new MongoClient(MONGODB_URI, options);
};

// Connect to the database
const connectToDatabase = async (): Promise<DatabaseConnection> => {
  const client = createClient();
  
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    
    // Test the connection
    await db.command({ ping: 1 });
    
    return { client, db };
  } catch (error) {
    await client.close();
    throw error;
  }
};

// Initialize the client promise
let clientPromise: Promise<DatabaseConnection>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connectToDatabase();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = connectToDatabase();
}

// For backward compatibility
export const getDatabase = async (): Promise<Db> => {
  const { db } = await clientPromise;
  return db;
};

export const getClient = async (): Promise<MongoClient> => {
  const { client } = await clientPromise;
  return client;
};

export const getCollection = async <T extends Document>(
  collectionName: string
): Promise<Collection<T>> => {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
};

// Clean up the connection when the Node process ends
const cleanup = async () => {
  try {
    const { client } = await clientPromise;
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

process.on('beforeExit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

export { clientPromise };

// Export the database connection promise
export default clientPromise;
