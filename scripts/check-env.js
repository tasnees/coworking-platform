// scripts/check-env.js
require('dotenv').config({ path: '.env.local' });

console.log('Checking environment configuration...\n');

// List of required environment variables
const requiredVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

// Check each required variable
console.log('=== Environment Variables ===');
let allVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isPresent = value !== undefined && value !== '';
  
  console.log(
    `${isPresent ? '✅' : '❌'} ${varName}:`,
    isPresent 
      ? varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('TOKEN')
        ? '*** (hidden) ***'
        : value
      : 'Not set',
    isPresent && varName === 'MONGODB_URI' && !value.startsWith('mongodb')
      ? '\n   ⚠️  MONGODB_URI should start with mongodb:// or mongodb+srv://'
      : ''
  );
  
  if (!isPresent) {
    allVarsPresent = false;
  }
});

// Check for development environment
console.log('\n=== Environment ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development (default)');
console.log('APP_ENV:', process.env.APP_ENV || 'Not set');

// Check .env.local exists
const fs = require('fs');
const path = require('path');
const envFilePath = path.join(__dirname, '..', '.env.local');
const envFileExists = fs.existsSync(envFilePath);

console.log('\n=== Files ===');
console.log(`.env.local: ${envFileExists ? '✅ Found' : '❌ Not found'}`);

if (envFileExists) {
  try {
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    const hasMongoDBUri = envContent.includes('MONGODB_URI=');
    console.log('MONGODB_URI in .env.local:', hasMongoDBUri ? '✅ Found' : '❌ Not found');
    
    if (hasMongoDBUri) {
      const mongoLine = envContent.split('\n').find(line => line.startsWith('MONGODB_URI='));
      const isCommented = mongoLine && mongoLine.trim().startsWith('#');
      console.log('MONGODB_URI is commented out:', isCommented ? '❌ Yes' : '✅ No');
    }
  } catch (error) {
    console.error('Error reading .env.local:', error.message);
  }
}

// Check if we can access MongoDB URI
if (process.env.MONGODB_URI) {
  console.log('\n=== MongoDB URI Analysis ===');
  const uri = process.env.MONGODB_URI;
  
  try {
    const url = new URL(uri);
    console.log('Protocol:', url.protocol);
    console.log('Hostname:', url.hostname);
    console.log('Port:', url.port || 'default');
    
    if (url.username) {
      console.log('Username:', url.username);
      console.log('Password:', url.password ? '*** (hidden) ***' : 'Not set');
    }
    
    console.log('Database:', url.pathname ? url.pathname.replace(/^\/+/, '') : 'Not specified');
    
    // Check for common issues
    if (uri.includes('<password>')) {
      console.log('\n⚠️  WARNING: MONGODB_URI contains <password> placeholder. Did you forget to replace it with your actual password?');
    }
    
    if (uri.includes('@localhost') || uri.includes('@127.0.0.1')) {
      console.log('\nℹ️  INFO: Using local MongoDB instance. Make sure MongoDB is running locally.');
    }
    
  } catch (error) {
    console.error('Error parsing MONGODB_URI:', error.message);
  }
}

console.log('\n=== Summary ===');
if (allVarsPresent) {
  console.log('✅ All required environment variables are set');
  
  // Additional checks for MongoDB connection
  if (process.env.MONGODB_URI) {
    console.log('\nTo test the MongoDB connection, run:');
    console.log('node scripts/test-connection.js');
  }
} else {
  console.log('❌ Some required environment variables are missing');
  console.log('\nPlease make sure all required variables are set in your .env.local file:');
  requiredVars.forEach(varName => {
    console.log(`- ${varName}${!process.env[varName] ? ' (MISSING)' : ''}`);
  });
  
  console.log('.env.local');
  console.log('MONGODB_URI=mongodb+srv://grabatassnim:pvsd8mdXyqXKHgiT@cluster0.av4bvfl.mongodb.net/coworking-platform?retryWrites=true&w=majority');
  console.log('NEXTAUTH_SECRET=s+JYLbbzVaJoBeaQawj42O1QGAAxMR8VL/W0oee9IEo=');
  console.log('NEXTAUTH_URL=https://coworking-platform.onrender.com');
}

console.log('\nCheck completed.');
