const fs = require('fs');
const path = require('path');

console.log('=== Starting File System Test ===');

const testFilePath = path.join(__dirname, 'test-output.txt');
const testContent = 'This is a test file created at ' + new Date().toISOString();

try {
  console.log('1. Attempting to write test file...');
  fs.writeFileSync(testFilePath, testContent);
  console.log('✅ Successfully wrote to:', testFilePath);
  
  console.log('2. Verifying file contents...');
  const content = fs.readFileSync(testFilePath, 'utf8');
  console.log('✅ File contents verified:', content);
  
  console.log('3. Cleaning up test file...');
  fs.unlinkSync(testFilePath);
  console.log('✅ Test file cleaned up');
  
} catch (error) {
  console.error('❌ Error during file operations:', error);
  console.error('This might indicate a permission issue or that the filesystem is read-only');
  process.exit(1);
}

console.log('=== File System Test Completed ===');
