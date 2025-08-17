// Simple test script to verify basic JavaScript execution
console.log('=== Hello World Test ===');
console.log('If you see this message, the script is running!');
console.log('Current directory:', __dirname);
console.log('Current working directory:', process.cwd());
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'not set');
console.log('=== End of Test ===');
