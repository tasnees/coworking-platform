import { MongoClient, Db, ClientSession } from 'mongodb';
import clientPromise from './mongodb';

// Enable debug logging in development only
const DEBUG = process.env.NODE_ENV === 'development';

// Log function that only logs in development
function debugLog(...args: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB Utils]', new Date().toISOString(), ...args);
  }
}

/**
 * Gets a database connection with proper error handling
 */
export async function getDb(): Promise<{ client: MongoClient; db: Db }> {
  try {
    debugLog('Creating MongoDB client...');
    const client = await clientPromise;
    const dbName = process.env.DATABASE_NAME || 'coworking-platform';
    const db = client.db(dbName);
    debugLog('Successfully connected to database:', dbName);
    return { client, db };
  } catch (error) {
    debugLog('Error getting MongoDB client:', error);
    throw new Error('Failed to connect to database');
  }
}

/**
 * Helper function to execute database operations with proper error handling
 */
export async function withDb<T>(
  operation: (db: Db) => Promise<T>,
  client?: MongoClient
): Promise<T> {
  let localClient: MongoClient | null = null;
  
  try {
    if (!client) {
      const dbResult = await getDb();
      client = dbResult.client;
      localClient = client;
    }
    
    const db = client.db(process.env.DATABASE_NAME || 'coworking-platform');
    return await operation(db);
  } catch (error) {
    debugLog('Database operation failed:', error);
    throw error;
  } finally {
    // Only close the client if we created it in this function
    if (localClient) {
      await localClient.close().catch(error => {
        debugLog('Error closing database connection:', error);
      });
    }
  }
}

/**
 * Helper function to execute database operations within a transaction
 */
export async function withTransaction<T>(
  operation: (session: ClientSession) => Promise<T>,
  client?: MongoClient
): Promise<T> {
  let localClient: MongoClient | null = null;
  let session: ClientSession | null = null;
  let result: T | null = null;
  
  try {
    if (!client) {
      const dbResult = await getDb();
      client = dbResult.client;
      localClient = client;
    }
    
    // Start a new session
    const newSession = client.startSession();
    session = newSession;
    
    // Execute the operation within a transaction
    await newSession.withTransaction(async (transactionSession) => {
      result = await operation(transactionSession);
    });
    
    if (result === null) {
      throw new Error('Transaction completed but no result was returned');
    }
    
    return result;
  } catch (error) {
    debugLog('Transaction failed:', error);
    throw error;
  } finally {
    if (session) {
      await session.endSession().catch(error => {
        debugLog('Error ending session:', error);
      });
    } else {
      debugLog('No active session to end');
    }
    
    if (localClient) {
      await localClient.close().catch(error => {
        debugLog('Error closing database connection:', error);
      });
    }
  }
}
