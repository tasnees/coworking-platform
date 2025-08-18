// Script to copy .env.local to .env
const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '.env.local');
const destPath = path.join(__dirname, '.env');

try {
  if (fs.existsSync(sourcePath)) {
    // Read the source file
    const content = fs.readFileSync(sourcePath, 'utf8');
    
    // Write to destination
    fs.writeFileSync(destPath, content, 'utf8');
    
    console.log('✅ Successfully copied .env.local to .env');
    console.log('File created at:', destPath);
  } else {
    console.error('❌ Source file not found:', sourcePath);
  }
} catch (error) {
  console.error('❌ Error copying file:', error.message);
}
