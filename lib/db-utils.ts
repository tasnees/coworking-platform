import { MongoClient, Db, ClientSession } from 'mongodb';
import clientPromise from './mongodb';

// Enable debug logging
const DEBUG = true;

// Enhanced log function with consistent formatting
function debugLog(message: string, ...args: any[]) {
  const timestamp = new Date().toISOString();
  const logMessage = `[DB Utils][${timestamp}] ${message}`;
  
  if (args.length > 0) {
    console.log(logMessage, ...args);
  } else {
    console.log(logMessage);
  }
}

// Global variable to track connection state
let isDbInitialized = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

/**
 * Gets a database connection with comprehensive error handling and diagnostics
 */
export async function getDb(): Promise<{ client: MongoClient; db: Db }> {
  const dbName = process.env.DATABASE_NAME || 'coworking-platform';

  // Check if we're in build time - if so, return a mock connection
  if (process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NODE_ENV === 'production' && process.env.BUILDING) {
    debugLog('🔧 Build time detected, skipping database connection');

    // Return a mock client and db that won't cause errors
    const mockClient = {} as MongoClient;
    const mockDb = {
      collection: () => ({
        find: () => ({ toArray: () => Promise.resolve([]) }),
        findOne: () => Promise.resolve(null),
        insertOne: () => Promise.resolve({ insertedId: 'mock-id' }),
        updateOne: () => Promise.resolve({ modifiedCount: 1 }),
        deleteOne: () => Promise.resolve({ deletedCount: 1 })
      }),
      command: () => Promise.resolve({ ok: 1 })
    } as Db;

    return { client: mockClient, db: mockDb };
  }

  async function attemptConnection(): Promise<{ client: MongoClient; db: Db }> {
    connectionAttempts++;
    debugLog(`🔌 Connection attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}...`);
    
    try {
      // Get the client from the promise
      const client = await clientPromise;
      
      // Ensure we have a fresh connection
      try {
        // Try to ping the database to check if the connection is alive
        await client.db().command({ ping: 1 });
        debugLog('✅ Connection is alive');
      } catch (error) {
        debugLog('🔁 No active connection or ping failed, attempting to connect...');
        await client.connect();
      }
      
      const db = client.db(dbName);
      
      // Test the connection with a ping
      debugLog('🏓 Testing database connection with ping...');
      await db.command({ ping: 1 });
      
      debugLog('✅ Ping successful');
      isDbInitialized = true;
      connectionAttempts = 0; // Reset attempts on success
      
      return { client, db };
      
    } catch (error: any) {
      debugLog(`❌ Connection attempt ${connectionAttempts} failed:`, error.message);
      
      if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return attemptConnection();
      }
      
      throw error;
    }
  }
  
  try {
    debugLog('🌐 Establishing database connection...');
    const result = await attemptConnection();
    debugLog(`✅ Successfully connected to database: ${dbName}`);
    return result;
    
  } catch (error: any) {
    const errorMessage = `Failed to connect to database after ${MAX_CONNECTION_ATTEMPTS} attempts: ${error.message}`;
    debugLog('❌', errorMessage);
    debugLog('Error details:', {
      name: error.name,
      code: error.code,
      errorResponse: error.errorResponse,
      stack: error.stack
    });
    
    throw new Error(errorMessage);
  }
}

/**
 * Helper function to execute database operations with proper error handling
 */
export async function withDb<T>(
  operation: (db: Db) => Promise<T>,
  existingClient?: MongoClient
): Promise<T> {
  let client: MongoClient | null = null;
  
  try {
    // Use existing client if provided, otherwise get a new one
    if (!existingClient) {
      const dbResult = await getDb();
      client = dbResult.client;
    } else {
      client = existingClient;
    }
    
    if (!client) {
      throw new Error('Failed to get MongoDB client');
    }
    
    const db = client.db(process.env.DATABASE_NAME || 'coworking-platform');
    return await operation(db);
  } catch (error) {
    debugLog('Database operation failed:', error);
    throw error;
  }
  // Note: We don't close the client here to maintain the connection pool
}

/**
 * Helper function to execute database operations within a transaction
 */
export async function withTransaction<T>(
  operation: (session: ClientSession) => Promise<T>,
  existingClient?: MongoClient
): Promise<T> {
  let client: MongoClient | null = null;
  let session: ClientSession | null = null;
  let result: T | null = null;
  
  try {
    // Use existing client if provided, otherwise get a new one
    if (!existingClient) {
      const dbResult = await getDb();
      client = dbResult.client;
    } else {
      client = existingClient;
    }
    
    if (!client) {
      throw new Error('Failed to get MongoDB client');
    }
    
    // Start a new session
    session = client.startSession();
    
    // Execute the operation within a transaction
    await session.withTransaction(async (transactionSession) => {
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
    // Always end the session but don't close the client
    if (session) {
      await session.endSession().catch((error: Error) => {
        debugLog('Error ending session:', error);
      });
    }
    
    // Don't close the client here - let it be managed by the connection pool
    if (client) {
      await client.close().catch((error: Error) => {
        debugLog('Error closing database connection:', error);
      });
    }
  }
}
