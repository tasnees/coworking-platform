import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  console.log('🔌 Starting test-db endpoint...');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set in environment variables');
    return NextResponse.json(
      { error: 'MONGODB_URI is not configured' },
      { status: 500 }
    );
  }

  console.log('🔗 MONGODB_URI found, creating client...');
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');

    const db = client.db('coworking-platform');
    console.log('🏓 Sending ping command...');
    
    const pingResult = await db.command({ ping: 1 });
    console.log('✅ Ping successful. Server response:', pingResult);
    
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections in database:');
    console.log(collections.map(c => `- ${c.name}`).join('\n') || 'No collections found');
    
    return NextResponse.json({
      status: 'success',
      ping: pingResult,
      collections: collections.map(c => c.name)
    });
    
  } catch (error: any) {
    console.error('❌ Error in test-db endpoint:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Error Details:', error.errorResponse || 'No additional details');
    
    if (error.stack) {
      console.error('Stack Trace:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: {
          name: error.name,
          message: error.message,
          code: error.code,
          errorResponse: error.errorResponse
        }
      },
      { status: 500 }
    );
    
  } finally {
    console.log('🔌 Closing MongoDB connection...');
    await client.close().catch(console.error);
    console.log('✅ Connection closed');
  }
}
