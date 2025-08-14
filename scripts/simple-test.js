// Simple test script to verify Node.js script execution
console.log('✅ Simple test script is running!');
console.log('Current directory:', process.cwd());
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

// Test file system access
try {
  const fs = require('fs');
  const path = require('path');
  
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  console.log('Checking for .env.local at:', envPath);
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local file exists');
    
    // Read first few lines (without exposing sensitive data)
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    console.log(`.env.local contains ${lines.length} lines`);
    
    // Show first few lines (redacting values)
    console.log('First few lines (values redacted):');
    lines.slice(0, 5).forEach((line, i) => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...value] = line.split('=');
        console.log(`  ${i + 1}. ${key}=[REDACTED]`);
      } else if (line.trim()) {
        console.log(`  ${i + 1}. ${line}`);
      }
    });
  } else {
    console.error('❌ .env.local file does not exist');
  }
} catch (error) {
  console.error('Error accessing file system:', error);
}

// Test basic functionality
console.log('\nTesting basic functionality...');
const testObj = { test: 'value', number: 42 };
console.log('Test object:', JSON.stringify(testObj, null, 2));

// Test async/await
(async () => {
  try {
    console.log('\nTesting async/await...');
    const result = await Promise.resolve('Async test successful!');
    console.log(result);
  } catch (error) {
    console.error('Async test failed:', error);
  }
})();

console.log('\n✅ Test script completed successfully');
