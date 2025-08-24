// Test file system access and output
const fs = require('fs');
const path = require('path');

// Test file path
const testFile = path.join(__dirname, 'fs-test-output.txt');
const content = 'Test content at ' + new Date().toISOString();

// Write to file
fs.writeFileSync(testFile, content);

// Verify file exists
const exists = fs.existsSync(testFile);
console.log(`File exists: ${exists}`);

// Read file content
const fileContent = fs.readFileSync(testFile, 'utf8');
console.log(`File content: ${fileContent}`);

// Compare content
console.log(`Content matches: ${content === fileContent}`);

// Clean up
fs.unlinkSync(testFile);
console.log('Test file cleaned up');
