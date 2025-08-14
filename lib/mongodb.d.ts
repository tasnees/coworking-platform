import { MongoClient } from 'mongodb';

// Extend the global namespace to include our MongoDB client promise
declare global {
  // This allows us to extend the global namespace
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Export the client promise type
declare const clientPromise: Promise<MongoClient>;
export default clientPromise;
