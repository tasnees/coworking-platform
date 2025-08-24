const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'src', 'routes', 'booking.routes.ts');

// Read the file content
let content = fs.readFileSync(filePath, 'utf8');

// Replace all line endings with CRLF
content = content.replace(/\r?\n|\r/g, '\r\n');

// Write the file back with CRLF line endings
fs.writeFileSync(filePath, content, { encoding: 'utf8' });

console.log('Line endings have been converted to CRLF');
