const fs = require('fs');
const path = require('path');

// Test file path
const testFile = path.join(__dirname, 'test-write-read.txt');
const testContent = 'Test content at ' + new Date().toISOString();

// Write to file
fs.writeFileSync(testFile, testContent);

// Read from file
const readContent = fs.readFileSync(testFile, 'utf8');

// Verify and create result
const result = {
  success: readContent === testContent,
  testFile: testFile,
  expectedContent: testContent,
  actualContent: readContent,
  filesInDir: fs.readdirSync(__dirname).filter(f => f.endsWith('.js') || f.endsWith('.txt'))
};

// Write result to a file
fs.writeFileSync('test-result.json', JSON.stringify(result, null, 2));

// Also write human-readable output
const humanOutput = [
  '=== Test Write/Read ===',
  `Test Time: ${new Date().toISOString()}`,
  `Test File: ${testFile}`,
  `Success: ${result.success ? '✅' : '❌'}`,
  '\n=== Expected Content ===',
  testContent,
  '\n=== Actual Content ===',
  readContent,
  '\n=== Files in Directory ===',
  ...result.filesInDir
].join('\n');

fs.writeFileSync('test-output.txt', humanOutput);
