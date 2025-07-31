const fs = require('fs');
const path = require('path');

// Files that should be skipped (already processed or special cases)
const SKIP_FILES = [
  'app/500.tsx',
  'app/not-found.tsx',
  'app/layout.tsx'
];

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove import { ... } from 'next/document'
    content = content.replace(/import\s*\{\s*[^}]*\s*\}\s*from\s*['"]next\/document['"];?\s*/g, '');
    
    // Remove any Html, Head, Main, NextScript components
    content = content.replace(/<(\/)?(Html|Head|Main|NextScript)\b[^>]*>/g, '');
    
    // Clean up any empty lines left after removal
    content = content.replace(/\n\s*\n/g, '\n').trim() + '\n';
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  let count = 0;
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
    
    if (file.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (
      file.name.match(/\.(js|jsx|ts|tsx)$/) && 
      !SKIP_FILES.includes(relativePath)
    ) {
      if (cleanFile(fullPath)) {
        count++;
      }
    }
  }
  
  return count;
}

// Start processing from the app directory
console.log('🔍 Searching for files with next/document imports...');
const filesCleaned = processDirectory('app');

console.log(`\n✅ Cleaned ${filesCleaned} files.`);
console.log('Please review the changes and commit them to your repository.');
