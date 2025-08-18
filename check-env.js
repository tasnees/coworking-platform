const fs = require('fs');
const path = require('path');

console.log('=== Environment Variables ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '*** (set)' : 'not set');

// Try to load .env files manually
const envFiles = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env.development'),
  path.resolve(process.cwd(), '.env.development.local'),
];

console.log('\n=== Checking .env files ===');
for (const file of envFiles) {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const hasMongoDB = content.includes('MONGODB_URI');
      console.log(`✅ ${path.basename(file)}: exists${hasMongoDB ? ' (contains MONGODB_URI)' : ''}`);
    } else {
      console.log(`❌ ${path.basename(file)}: not found`);
    }
  } catch (error) {
    console.error(`Error checking ${file}:`, error.message);
  }
}

// Check if dotenv is installed and working
try {
  require('dotenv').config();
  console.log('\n=== After dotenv ===');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '*** (set)' : 'not set');
} catch (error) {
  console.error('\nError loading dotenv:', error.message);
}

// Check if we can access the .env.local file directly
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log('\n=== .env.local content (MONGODB_URI hidden) ===');
  const content = fs.readFileSync(envLocalPath, 'utf8');
  console.log(
    content
      .split('\n')
      .map(line => 
        line.includes('MONGODB_URI') 
          ? 'MONGODB_URI=*** (hidden)' 
          : line
      )
      .filter(line => line && !line.trim().startsWith('#'))
      .join('\n')
  );
} else {
  console.log('\n.env.local does not exist');
}

// Check if we can access the file system at all
try {
  const testFile = path.resolve(process.cwd(), 'test-write.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('\n✅ File system is writable');
} catch (error) {
  console.error('\n❌ Cannot write to file system:', error.message);
}
