import { MongoClient, MongoClientOptions, ServerApiVersion } from 'mongodb';
import { hash } from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Enable detailed logging
const log = (...args: any[]) => console.log(`[${new Date().toISOString()}]`, ...args);
const error = (...args: any[]) => console.error(`[${new Date().toISOString()}] ❌`, ...args);

// Load environment variables from .env.local
log('Loading environment variables...');
const envPath = path.resolve(process.cwd(), '.env.local');
log(`Looking for .env file at: ${envPath}`);

// Check if file exists
const fs = require('fs');
if (!fs.existsSync(envPath)) {
  error(`.env file not found at: ${envPath}`);
  error('Current working directory:', process.cwd());
  error('Directory contents:', fs.readdirSync(process.cwd()));
  process.exit(1);
}

try {
  log('Reading .env file...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  log('Environment file content (with sensitive values redacted):', 
    envContent.replace(/=(.*?)(\n|$)/g, '=***$2'));
  
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    error('Error loading .env file:', result.error);
  } else {
    log('Environment variables loaded successfully');
    log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    log('MONGODB_URI starts with:', process.env.MONGODB_URI ? 'mongodb+srv://...' : 'undefined');
    log('DATABASE_NAME:', process.env.DATABASE_NAME || 'default');
  }
} catch (err) {
  error('Failed to load .env file:', err);
  process.exit(1);
}

async function testDbInsertion() {
  if (!process.env.MONGODB_URI) {
    error('MONGODB_URI is not defined in environment variables');
    error('Current environment variables:', Object.keys(process.env).join(', '));
    process.exit(1);
  }

  log('Creating test user...');
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testUser = {
    email: testEmail,
    name: 'Test User',
    password: await hash('testpassword123', 12),
    role: 'member',
    emailVerified: null,
    image: null,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  log('Test user created with email:', testEmail);

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');

    const db = client.db(process.env.DATABASE_NAME || 'coworking-platform');
    
    // Check if users collection exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      console.log('ℹ️ Users collection does not exist, creating...');
      await db.createCollection('users');
    }

    // Insert test user
    console.log('📝 Inserting test user...');
    const result = await db.collection('users').insertOne(testUser);
    console.log('✅ Successfully inserted test user with ID:', result.insertedId);

    // Verify the user was inserted
    const insertedUser = await db.collection('users').findOne({ _id: result.insertedId });
    if (insertedUser) {
      console.log('✅ Successfully retrieved test user from database');
      console.log('User details:', {
        _id: insertedUser._id,
        email: insertedUser.email,
        name: insertedUser.name,
        role: insertedUser.role,
        status: insertedUser.status,
        createdAt: insertedUser.createdAt,
      });
    } else {
      console.error('❌ Failed to retrieve test user after insertion');
    }
  } catch (error) {
    console.error('❌ Error during database operation:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testDbInsertion().catch(console.error);
