// app/api/test-env/route.ts
import { NextResponse } from 'next/server';
import { Collection, MongoClient } from 'mongodb';

interface CollectionInfo {
  name: string;
  [key: string]: unknown;
}

export async function GET() {
  // Check if environment variables are loaded
  const envVars = {
    MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Not set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Not set',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Not set',
    DATABASE_NAME: process.env.DATABASE_NAME || '❌ Not set',
    NODE_ENV: process.env.NODE_ENV || 'development',
  };

  // Check MongoDB connection
  let mongoStatus = 'Not tested';
  let collections: CollectionInfo[] = [];
  let errorDetails: string | null = null;
  
  try {
    if (process.env.MONGODB_URI) {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db(process.env.DATABASE_NAME || 'coworking-platform');
      collections = await db.listCollections().toArray();
      await client.close();
      mongoStatus = '✅ Connected successfully';
    } else {
      mongoStatus = '❌ MONGODB_URI not set';
    }
  } catch (error: unknown) {
    mongoStatus = '❌ Connection failed';
    errorDetails = error instanceof Error ? error.message : String(error);
    console.error('MongoDB connection error:', error);
  }

  return NextResponse.json({
    status: 'success',
    environment: process.env.NODE_ENV,
    environmentVariables: envVars,
    mongoDB: {
      status: mongoStatus,
      error: errorDetails || null,
      collections: collections.map((c: CollectionInfo) => c.name),
      collectionCount: collections.length,
      collectionsDetails: collections.map(({ name, ...rest }) => ({
        name,
        ...rest
      }))
    }
  });
}
