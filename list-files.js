const fs = require('fs');
const path = require('path');

// Get current directory
const currentDir = __dirname;

// Get all files and directories
const items = fs.readdirSync(currentDir, { withFileTypes: true });

// Create output
const output = [
  `Directory listing for: ${currentDir}`,
  `Generated at: ${new Date().toISOString()}`,
  '='.repeat(80),
  'Name'.padEnd(50) + 'Type'.padEnd(15) + 'Size (bytes)'.padStart(15),
  '-'.repeat(80)
];

// Add each item to output
items.forEach(item => {
  const itemPath = path.join(currentDir, item.name);
  const stats = fs.statSync(itemPath);
  const type = item.isDirectory() ? 'Directory' : 'File';
  const size = item.isFile() ? stats.size.toString() : '-';
  
  output.push(
    item.name.padEnd(50) + 
    type.padEnd(15) + 
    size.padStart(15)
  );
});

// Write to a file with timestamp
const outputFile = path.join(currentDir, `file-list-${Date.now()}.txt`);
fs.writeFileSync(outputFile, output.join('\n'));

// Also write to a fixed filename for easier access
fs.writeFileSync(path.join(currentDir, 'file-list-latest.txt'), output.join('\n'));
