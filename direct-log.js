// Simple script to test direct file logging
const fs = require('fs');
const path = require('path');

// Create a log file
const logFile = path.join(__dirname, 'direct-log.txt');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(logMessage.trim());
}

log('Starting direct log test...');
log(`Current directory: ${process.cwd()}`);
log(`__dirname: ${__dirname}`);
log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
log(`MONGODB_URI: ${process.env.MONGODB_URI ? '*** (set)' : 'not set'}`);

// Try to load .env file manually
const envPath = path.join(process.cwd(), '.env.local');
log(`\nChecking for .env.local at: ${envPath}`);

try {
  if (fs.existsSync(envPath)) {
    log('.env.local exists');
    const content = fs.readFileSync(envPath, 'utf8');
    log(`File size: ${content.length} bytes`);
    log('First 3 lines:');
    content.split('\n').slice(0, 3).forEach((line, i) => {
      log(`${i + 1}. ${line}`);
    });
  } else {
    log('❌ .env.local does not exist');
  }
} catch (error) {
  log(`❌ Error reading .env.local: ${error.message}`);
}

log('\nTest complete');
