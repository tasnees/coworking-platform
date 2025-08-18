// Simple script to read and display .env.local contents
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

console.log(`Reading ${envPath}...\n`);

try {
  // Read file as raw buffer
  const buffer = fs.readFileSync(envPath);
  
  // Display raw hex representation of first 100 bytes
  console.log('First 100 bytes (hex):');
  const hex = buffer.slice(0, 100).toString('hex').match(/.{2}/g)?.join(' ') || '';
  console.log(hex);
  
  // Display as text
  console.log('\nFile content (as text):');
  console.log(buffer.toString('utf8'));
  
  // Try different encodings if needed
  console.log('\nTrying different encodings:');
  const encodings = ['utf8', 'utf16le', 'latin1'];
  encodings.forEach(enc => {
    try {
      const content = buffer.toString(enc);
      console.log(`\n${enc.toUpperCase()} (first 50 chars):`);
      console.log(content.substring(0, 50).replace(/[\x00-\x1F\x7F-\x9F]/g, '?'));
    } catch (e) {
      console.log(`\nFailed to decode as ${enc}:`, e.message);
    }
  });
  
} catch (error) {
  console.error('Error reading file:', error.message);
  console.error('Error code:', error.code);
  console.error('Error path:', error.path);
}
