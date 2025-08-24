const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'routes', 'booking.routes.ts');

// Read the file as a buffer
const buffer = fs.readFileSync(filePath);

// Count CRLF and LF line endings
let crlfCount = 0;
let lfCount = 0;

for (let i = 0; i < buffer.length - 1; i++) {
  if (buffer[i] === 0x0D && buffer[i + 1] === 0x0A) {
    crlfCount++;
  } else if (buffer[i] === 0x0A && (i === 0 || buffer[i - 1] !== 0x0D)) {
    lfCount++;
  }
}

console.log(`CRLF line endings: ${crlfCount}`);
console.log(`LF line endings: ${lfCount}`);

// Write a test file with known line endings
const testFilePath = path.join(__dirname, 'test-crlf.txt');
const testContent = 'line1\r\nline2\r\nline3\r\n';
fs.writeFileSync(testFilePath, testContent, { encoding: 'binary' });

console.log('Created test file at:', testFilePath);
console.log('Test file length:', testContent.length);
console.log('Test file hex:', Buffer.from(testContent).toString('hex'));
