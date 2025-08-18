// Simple script to test file system access
const fs = require('fs');
const path = require('path');

// Test file path
const testFilePath = path.join(process.cwd(), 'test-fs-output.txt');

console.log(`Testing file system access at: ${testFilePath}`);

// Try to write to a file
try {
  // Write to file
  fs.writeFileSync(testFilePath, 'Test content ' + new Date().toISOString());
  console.log('✅ Successfully wrote to file');
  
  // Read from file
  const content = fs.readFileSync(testFilePath, 'utf8');
  console.log('✅ Successfully read from file');
  console.log('File content:', content);
  
  // Delete the test file
  fs.unlinkSync(testFilePath);
  console.log('✅ Successfully deleted test file');
  
  // List current directory
  console.log('\nCurrent directory contents:');
  const files = fs.readdirSync(process.cwd());
  console.log(files.join('\n'));
  
  // Check if .env.local exists
  const envLocalPath = path.join(process.cwd(), '.env.local');
  console.log(`\nChecking for .env.local at: ${envLocalPath}`);
  console.log('File exists:', fs.existsSync(envLocalPath));
  
  if (fs.existsSync(envLocalPath)) {
    console.log('File size:', fs.statSync(envLocalPath).size, 'bytes');
    // Show first 3 lines
    const content = fs.readFileSync(envLocalPath, 'utf8');
    console.log('First 3 lines:');
    content.split('\n').slice(0, 3).forEach((line, i) => {
      console.log(`${i + 1}. ${line}`);
    });
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Error code:', error.code);
  console.error('Error stack:', error.stack);
}
