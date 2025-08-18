// Test if environment variables are accessible
console.log('Testing environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '*** (set)' : 'not set');

// Try to load .env file
require('dotenv').config();
console.log('\nAfter loading .env:');
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI ? '*** (set)' : 'not set');

// Simple test to see if we can access any environment variables
console.log('\nEnvironment variables available:');
console.log(Object.keys(process.env).filter(k => k.startsWith('NODE_') || k.startsWith('MONGODB_')).join(', ') || 'No relevant environment variables found');
