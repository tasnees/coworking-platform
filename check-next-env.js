// Check how environment variables are loaded in Next.js
const { loadEnvConfig } = require('@next/env');
const path = require('path');

console.log('=== Next.js Environment Check ===');

// Get the current environment
const dev = process.env.NODE_ENV !== 'production';
console.log(`Environment: ${dev ? 'development' : 'production'}`);

// Load environment variables the same way Next.js does
const projectDir = process.cwd();
console.log('Project directory:', projectDir);

console.log('\nLoading environment variables...');
const { loadedEnvFiles } = loadEnvConfig(projectDir, dev);

console.log('\nLoaded environment files:');
loadedEnvFiles.forEach(({ path: envPath, result }) => {
  console.log(`\n${envPath}:`);
  console.log('- Exists:', result ? 'Yes' : 'No');
  
  if (result) {
    console.log('- Contents:');
    Object.entries(result).forEach(([key, value]) => {
      const displayValue = key.includes('SECRET') || key.includes('PASSWORD') || key.includes('URI') 
        ? '*** (hidden)' 
        : value;
      console.log(`  ${key}=${displayValue}`);
    });
  }
});

console.log('\nProcess environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '*** (set)' : 'not set');
console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'not set');

console.log('\n=== Next.js Public Runtime Config ===');
console.log('(This would be available in the browser)');
const nextConfig = require('./next.config.js');
if (nextConfig.publicRuntimeConfig) {
  console.log(nextConfig.publicRuntimeConfig);
} else {
  console.log('No publicRuntimeConfig found in next.config.js');
}

console.log('\n=== Next.js Server Runtime Config ===');
console.log('(This is only available server-side)');
if (nextConfig.serverRuntimeConfig) {
  console.log(nextConfig.serverRuntimeConfig);
} else {
  console.log('No serverRuntimeConfig found in next.config.js');
}
