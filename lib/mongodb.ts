// lib/mongodb.ts
import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI;

// Parse the database name from the connection string
const dbNameMatch = uri.match(/\/([^/?]+)(?:\?|$)/);
const dbName = dbNameMatch ? dbNameMatch[1] : 'coworking-platform';

console.log('MongoDB URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
console.log('Database name:', dbName);

// Check if we're in build time
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
                   (process.env.NODE_ENV === 'production' && process.env.BUILDING);

console.log('🔧 Build time detected:', isBuildTime);

// Create mock client for build time
const mockClient = {
  connect: () => Promise.resolve(mockClient),
  db: () => ({
    collection: () => ({
      find: () => ({ toArray: () => Promise.resolve([]) }),
      findOne: () => Promise.resolve(null),
      insertOne: () => Promise.resolve({ insertedId: 'mock-id' }),
      updateOne: () => Promise.resolve({ modifiedCount: 1 }),
      deleteOne: () => Promise.resolve({ deletedCount: 1 })
    }),
    command: () => Promise.resolve({ ok: 1 })
  }),
  close: () => Promise.resolve(),
  on: () => mockClient
} as any;

// Production/development connection
const options: MongoClientOptions = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority',
  tls: uri.startsWith('mongodb+srv'),
  serverApi: {
    version: '1' as const,
    strict: false,
    deprecationErrors: true,
  }
};

const client = new MongoClient(uri, options);

client.on('serverOpening', () => {
  console.log('MongoDB connection opened');
});

client.on('serverClosed', () => {
  console.log('MongoDB connection closed');
});

client.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

// Conditionally create client promise based on environment
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection across hot reloads
  if (!(global as any)._mongoClientPromise) {
    (global as any)._mongoClientPromise = isBuildTime ? Promise.resolve(mockClient) : client.connect();
    console.log('Created new MongoDB connection in development mode');
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production mode, avoid using a global variable
  clientPromise = isBuildTime ? Promise.resolve(mockClient) : client.connect();
  console.log('Created new MongoDB connection in production mode');
}

// Export at the top level
export default clientPromise;
export { client };

// Function to get the database instance
export function getDatabase() {
  return clientPromise.then(client => client.db(dbName));
}
