// Direct file reading test
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), '.env.local');
console.log(`Attempting to read: ${filePath}`);

// Method 1: Basic readFileSync
try {
  console.log('\n--- Method 1: readFileSync ---');
  const content = fs.readFileSync(filePath, 'utf8');
  console.log('Success! Content length:', content.length);
  console.log('First 100 chars:', content.substring(0, 100));
} catch (e) {
  console.error('Error with readFileSync:', e.message);
}

// Method 2: readFile with callback
console.log('\n--- Method 2: readFile with callback ---');
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error with readFile callback:', err.message);
  } else {
    console.log('Success! Content length:', data.length);
    console.log('First 100 chars:', data.substring(0, 100));
  }
});

// Method 3: Read stream
console.log('\n--- Method 3: Read stream ---');
const readStream = fs.createReadStream(filePath, 'utf8');
let streamData = '';

readStream.on('data', (chunk) => {
  streamData += chunk;
}).on('end', () => {
  console.log('Success! Content length:', streamData.length);
  console.log('First 100 chars:', streamData.substring(0, 100));
}).on('error', (err) => {
  console.error('Error with read stream:', err.message);
});

// Method 4: Try with different encoding
console.log('\n--- Method 4: Try different encodings ---');
const encodings = ['utf8', 'utf16le', 'latin1', 'ascii'];

encodings.forEach(encoding => {
  try {
    const content = fs.readFileSync(filePath, { encoding });
    console.log(`\n${encoding.toUpperCase()}:`);
    console.log('First 50 chars:', content.substring(0, 50).replace(/[\x00-\x1F\x7F-\x9F]/g, '?'));
  } catch (e) {
    console.error(`Error with ${encoding}:`, e.message);
  }
});

// Method 5: Check file stats
console.log('\n--- Method 5: File stats ---');
try {
  const stats = fs.statSync(filePath);
  console.log('File exists');
  console.log('Size:', stats.size, 'bytes');
  console.log('Created:', stats.birthtime);
  console.log('Modified:', stats.mtime);
  console.log('Permissions:', stats.mode.toString(8));
} catch (e) {
  console.error('Error getting file stats:', e.message);
}
