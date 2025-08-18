// Basic Node.js functionality test
console.log('=== Basic Node.js Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current directory:', process.cwd());

// Test basic functionality
try {
  // Test module loading
  console.log('\n=== Testing module loading ===');
  const fs = require('fs');
  const path = require('path');
  console.log('✅ Core modules load successfully');
  
  // Test file system access
  console.log('\n=== Testing file system access ===');
  const testFile = path.join(process.cwd(), 'test-file.txt');
  fs.writeFileSync(testFile, 'test content');
  console.log('✅ Successfully wrote to file');
  
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('✅ Successfully read from file');
  console.log('File content:', content);
  
  fs.unlinkSync(testFile);
  console.log('✅ Successfully deleted file');
  
  // Test environment variables
  console.log('\n=== Testing environment variables ===');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '*** (set)' : 'not set');
  
  // Test network connectivity
  console.log('\n=== Testing network connectivity ===');
  const https = require('https');
  https.get('https://www.google.com', (res) => {
    console.log('✅ Successfully connected to google.com');
    console.log('Status Code:', res.statusCode);
  }).on('error', (e) => {
    console.error('❌ Network connectivity test failed:', e.message);
  });
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  console.error('Error stack:', error.stack);
}
