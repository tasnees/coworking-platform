// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { spawn } = require('child_process');

console.log('Starting development environment...');

// Load .env.local file
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('Loading environment variables from .env.local');
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  
  // Set environment variables in the current process
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
  
  console.log('Environment variables loaded successfully');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '*** (set)' : 'not set');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  
  // Start the Next.js development server with the environment variables
  console.log('\nStarting Next.js development server...');
  const next = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      FORCE_COLOR: '1'  // Force colored output
    }
  });
  
  next.on('error', (error) => {
    console.error('Failed to start Next.js:', error);
  });
  
} else {
  console.error('❌ .env.local file not found at:', envPath);
  console.log('Please create a .env.local file with your environment variables');
  process.exit(1);
}
