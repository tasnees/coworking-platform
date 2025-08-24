// Simple test to verify Node.js execution and output
console.log('=== Node.js Test Script ===');
console.log('1. Testing console output');
console.error('2. Testing error output');

// Test basic operations
const result = 2 + 2;
console.log(`3. 2 + 2 = ${result}`);

// Test file system access
const fs = require('fs');
const path = require('path');
const testFile = path.join(__dirname, 'test-output.txt');
fs.writeFileSync(testFile, 'Test content');
console.log(`4. Created test file: ${testFile}`);

// Test environment variables
console.log('5. Environment Variables:');
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   - USER: ${process.env.USERNAME || 'unknown'}`);

// Test complete
console.log('=== Test Complete ===');
