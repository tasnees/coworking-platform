// Simple file I/O test
const fs = require('fs');
const path = require('path');

// Test file path
const testFilePath = path.join(__dirname, 'test-io.txt');
const testContent = 'This is a test at ' + new Date().toISOString();

// Write to file
fs.writeFileSync(testFilePath, testContent);
console.log(`Wrote to file: ${testFilePath}`);

// Read from file
const readContent = fs.readFileSync(testFilePath, 'utf8');
console.log(`Read from file: ${readContent}`);

// Verify content
if (readContent === testContent) {
  console.log('✅ Test passed: Content matches');
} else {
  console.error('❌ Test failed: Content does not match');
}

// Clean up
fs.unlinkSync(testFilePath);
console.log('Cleaned up test file');
