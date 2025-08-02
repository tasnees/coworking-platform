const fs = require('fs');
const path = require('path');

// Files that should be skipped (already processed or special cases)
const SKIP_FILES = [
  'app/500.tsx',
  'app/not-found.tsx',
  'app/layout.tsx',
  'app/error.tsx'
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
    const relativePath = path.relative(process.cwd(), fullPath);
    
    if (SKIP_FILES.includes(relativePath.replace(/\\/g, '/'))) {
      console.log(`⏩ Skipping: ${relativePath}`);
      continue;
    }
    
    if (file.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
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

if (filesCleaned > 0) {
  console.log(`\n✨ Successfully cleaned ${filesCleaned} files.`);
  console.log('✅ You can now try building the project again.');
} else {
  console.log('\n✅ No files needed cleaning.');
  console.log('The issue might be in the build cache. Try running:');
  console.log('  1. rmdir /s /q .next');
  console.log('  2. npm run build');
}
