const fs = require('fs');
const path = require('path');

// Output file path
const outputFile = path.join(__dirname, 'direct-output.txt');

// Test data
const testData = {
  timestamp: new Date().toISOString(),
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  cwd: process.cwd(),
  env: {
    NODE_ENV: process.env.NODE_ENV,
    USER: process.env.USERNAME,
    COMPUTER: process.env.COMPUTERNAME
  },
  testMessage: 'This is a direct file output test',
  success: true
};

// Write directly to file
fs.writeFileSync(outputFile, JSON.stringify(testData, null, 2));
