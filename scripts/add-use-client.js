const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, '..', 'app', 'dashboard');

function processDirectory(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.name.match(/\.(js|jsx|ts|tsx)$/) && !file.name.endsWith('.d.ts')) {
      processFile(fullPath);
    }
  });
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has 'use client' or is a server component
  if (content.includes("'use client'") || content.includes('"use client"')) {
    console.log(`Skipping ${filePath} - already has 'use client'`);
    return;
  }
  
  // Skip files that should be server components
  if (filePath.endsWith('loading.tsx') || filePath.endsWith('loading.ts') || 
      filePath.endsWith('error.tsx') || filePath.endsWith('error.ts')) {
    console.log(`Skipping ${filePath} - appears to be a server component`);
    return;
  }
  
  // Add 'use client' at the top of the file
  const newContent = `'use client'\n\n${content}`;
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Updated ${filePath}`);
}

console.log('Starting to add \'use client\' to dashboard files...');
processDirectory(dashboardPath);
console.log('Done!');
