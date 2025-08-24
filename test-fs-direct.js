const fs = require('fs');
const path = require('path');

// Test paths
const testFile = path.join(__dirname, 'test-fs-direct-output.txt');
const content = 'Test content at ' + new Date().toISOString();

// Write to file
fs.writeFileSync(testFile, content, 'utf8');

// Read back
const readContent = fs.readFileSync(testFile, 'utf8');

// Create result object
const result = {
  success: readContent === content,
  filePath: testFile,
  expectedContent: content,
  actualContent: readContent,
  filesInDir: fs.readdirSync(__dirname)
};

// Output result to a known location
const resultFile = path.join('C:\\', 'node-test-result.json');
fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));

console.log('Test completed. Results written to:', resultFile);
