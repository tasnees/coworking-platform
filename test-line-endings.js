const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'routes', 'booking.routes.ts');

// Read the file as a buffer
const buffer = fs.readFileSync(filePath);

// Convert buffer to hex string
const hex = buffer.toString('hex');

// Count CRLF (0D 0A) and LF (0A) line endings
const crlfCount = (hex.match(/0d0a/g) || []).length;
const lfCount = (hex.match(/(?<!0d)0a/g) || []).length;

console.log(`CRLF line endings: ${crlfCount}`);
console.log(`LF line endings: ${lfCount}`);

// Write a test file with known line endings
const testFilePath = path.join(__dirname, 'test-line-endings.txt');
fs.writeFileSync(testFilePath, 'line1\r\nline2\r\nline3\r\n', 'binary');

console.log('Created test file with CRLF endings at:', testFilePath);
