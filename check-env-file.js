// Check .env.local file for any issues
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

console.log(`Checking ${envPath}...`);

try {
  // Read file as buffer to check for BOM
  const buffer = fs.readFileSync(envPath);
  
  // Check for UTF-8 BOM (0xEF, 0xBB, 0xBF)
  const hasBOM = buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF;
  console.log(`- BOM detected: ${hasBOM ? 'Yes (this could cause issues)' : 'No'}`);
  
  // Read as text
  const content = fs.readFileSync(envPath, 'utf8');
  console.log(`- File size: ${content.length} characters`);
  
  // Check line endings
  const hasCRLF = content.includes('\r\n');
  const hasLF = content.includes('\n') && !content.includes('\r\n');
  console.log(`- Line endings: ${hasCRLF ? 'CRLF (Windows)' : hasLF ? 'LF (Unix)' : 'Unknown'}`);
  
  // Check for MONGODB_URI
  const hasMongoURI = content.includes('MONGODB_URI=');
  console.log(`- Contains MONGODB_URI: ${hasMongoURI ? 'Yes' : 'No'}`);
  
  // Print first 5 lines with line numbers
  console.log('\nFirst 5 lines:');
  content.split(/\r?\n/).slice(0, 5).forEach((line, i) => {
    console.log(`${i + 1}. ${line.replace(/[\u0000-\u001F\u007F-\u009F]/g, char => 
      `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`
    )}`);
  });
  
  // Check for non-ASCII characters
  const nonAscii = content.match(/[^\x00-\x7F]/g);
  if (nonAscii) {
    console.log('\n⚠️ Non-ASCII characters found:');
    console.log(Array.from(new Set(nonAscii)).map(c => 
      `- '${c}' (U+${c.charCodeAt(0).toString(16).toUpperCase()})`
    ).join('\n'));
  }
  
  // Try to parse as .env
  console.log('\nParsed environment variables:');
  const envVars = {};
  content.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=#]+?)\s*=\s*(.*?)\s*$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
      console.log(`- ${key}: ${key.includes('SECRET') || key.includes('PASSWORD') || key.includes('URI') ? '*** (hidden)' : value}`);
    }
  });
  
} catch (error) {
  console.error('Error reading .env.local:', error.message);
}
