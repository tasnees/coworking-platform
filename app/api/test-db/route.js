import { MongoClient } from 'mongodb';

export async function GET() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    return Response.json(
      { error: 'MONGODB_URI is not defined in environment variables' },
      { status: 500 }
    );
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });

  try {
    await client.connect();
    const db = client.db('coworking-platform');
    
    // Test the connection with a ping
    const ping = await db.command({ ping: 1 });
    
    // Get some basic stats
    const stats = await db.stats();
    const userCount = await db.collection('users').countDocuments();
    
    return Response.json({
      success: true,
      ping,
      dbStats: {
        name: stats.db,
        collections: stats.collections,
        dataSize: stats.dataSize,
        userCount
      }
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return Response.json(
      { 
        error: 'Failed to connect to MongoDB',
        details: error.message,
        code: error.code,
        name: error.name
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
