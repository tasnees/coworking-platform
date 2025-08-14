// scripts/test-env.js
require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Variables Test ===');
console.log('Current NODE_ENV:', process.env.NODE_ENV || 'development (default)');

// List all environment variables that start with MONGODB_ or NEXT_
const envVars = Object.entries(process.env)
  .filter(([key]) => key.startsWith('MONGODB_') || key.startsWith('NEXT_') || key.startsWith('NEXTAUTH_'))
  .sort(([a], [b]) => a.localeCompare(b));

console.log('\nRelevant environment variables:');
if (envVars.length > 0) {
  envVars.forEach(([key, value]) => {
    const displayValue = key.includes('SECRET') || key.includes('PASSWORD') || key.includes('TOKEN') || key.includes('KEY')
      ? '*** (hidden for security)'
      : value;
    console.log(`- ${key} = ${displayValue}`);
  });
} else {
  console.log('No relevant environment variables found. Make sure .env.local exists and contains the required variables.');
}

// Check required variables
console.log('\nChecking required variables:');
const requiredVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

let allVarsPresent = true;
requiredVars.forEach(varName => {
  const isPresent = process.env[varName] !== undefined && process.env[varName] !== '';
  console.log(`- ${varName}: ${isPresent ? '✅ Found' : '❌ Missing'}`);
  allVarsPresent = allVarsPresent && isPresent;
});

if (!allVarsPresent) {
  console.log('\n❌ Some required environment variables are missing. Please check your .env.local file.');
} else {
  console.log('\n✅ All required environment variables are present.');
  
  // Test MongoDB connection string format
  const mongoUri = process.env.MONGODB_URI || '';
  console.log('\nTesting MongoDB URI format...');
  
  try {
    const url = new URL(mongoUri);
    console.log('✅ MongoDB URI format is valid');
    console.log(`- Protocol: ${url.protocol.replace(':', '')}`);
    console.log(`- Hostname: ${url.hostname}`);
    console.log(`- Database: ${url.pathname.replace(/^\/+|\/+$/g, '') || 'default'}`);
    
    // Check if it's a MongoDB Atlas connection string
    if (url.hostname.includes('mongodb.net')) {
      console.log('🔗 Detected MongoDB Atlas connection');
      console.log('   Make sure your IP is whitelisted in MongoDB Atlas if using IP whitelisting.');
    }
    
  } catch (error) {
    console.error('❌ Invalid MongoDB URI format:', error.message);
  }
}

// Test NextAuth URL
if (process.env.NEXTAUTH_URL) {
  console.log('\nTesting NEXTAUTH_URL...');
  try {
    const url = new URL(process.env.NEXTAUTH_URL);
    console.log(`✅ NEXTAUTH_URL is valid: ${url.protocol}//${url.host}`);
  } catch (error) {
    console.error('❌ Invalid NEXTAUTH_URL format:', error.message);
  }
}

console.log('\n=== Test completed ===');
