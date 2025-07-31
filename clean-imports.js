const fs = require('fs');
const path = require('path');

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove import { ... } from 'next/document'
    content = content.replace(/import\s*{\s*[^}]*\s*}\s*from\s*['"]next\/document['"];?\s*/g, '');
    
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
    
    if (file.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (file.name.match(/\.(js|jsx|ts|tsx)$/)) {
      if (cleanFile(fullPath)) {
        count++;
      }
    }
  }
  
  return count;
}

// Start processing from the current directory
console.log('🔍 Searching for files with next/document imports...');
const filesCleaned = processDirectory('app');

console.log(`\n✅ Cleaned ${filesCleaned} files with next/document imports.`);
console.log('Please review the changes and commit them to your repository.');