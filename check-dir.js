const fs = require('fs');
const path = require('path');

// Get current directory info
const currentDir = __dirname;
const files = fs.readdirSync(currentDir);

// Create output content
const output = [
  '=== Directory Check ===',
  `Checked at: ${new Date().toISOString()}`,
  `Current directory: ${currentDir}`,
  '\n=== Files ===',
  ...files.map(file => {
    const stats = fs.statSync(path.join(currentDir, file));
    return `${file.padEnd(40)} ${stats.size.toString().padStart(10)} bytes  ${stats.mtime.toISOString()}`;
  }),
  '\n=== Environment ===',
  `Node.js version: ${process.version}`,
  `Platform: ${process.platform} ${process.arch}`,
  `Current working directory: ${process.cwd()}`
].join('\n');

// Write to a file with a timestamp
const outputFile = path.join(currentDir, `dir-check-${Date.now()}.txt`);
fs.writeFileSync(outputFile, output);

console.log(`Directory check complete. Results saved to: ${outputFile}`);
