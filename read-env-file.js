// Simple script to read and display .env.local file contents
const fs = require('fs');
const path = require('path');

console.log('Reading .env.local file...');

const envPath = path.join(process.cwd(), '.env.local');

try {
  if (fs.existsSync(envPath)) {
    console.log(`✅ .env.local found at: ${envPath}`);
    
    // Read the file content
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('\n=== File Content ===');
    console.log(content);
    
    // Parse the content
    const lines = content.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
    console.log('\n=== Parsed Variables ===');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      const displayValue = key.includes('SECRET') || key.includes('PASSWORD') || key.includes('URI')
        ? '*** (hidden)'
        : value;
      console.log(`${key}=${displayValue}`);
    });
    
  } else {
    console.error(`❌ .env.local not found at: ${envPath}`);
    console.log('Current directory contents:');
    fs.readdirSync(process.cwd()).forEach(file => {
      console.log(`- ${file}`);
    });
  }
} catch (error) {
  console.error('Error reading .env.local:', error);
}
