const fs = require('fs');
const path = require('path');

// Test file path in current directory
const testFile = path.join(__dirname, 'test-write-output.txt');
const content = 'Test content at ' + new Date().toISOString();

// Write to file
fs.writeFileSync(testFile, content, 'utf8');

// Verify file exists and has content
const fileExists = fs.existsSync(testFile);
const fileContent = fs.readFileSync(testFile, 'utf8');

// Create result object
const result = {
  success: fileExists && fileContent === content,
  filePath: testFile,
  fileExists: fileExists,
  contentMatches: fileContent === content,
  currentDirectory: __dirname,
  filesInDirectory: fs.readdirSync(__dirname)
};

// Output result to console
console.log(JSON.stringify(result, null, 2));
