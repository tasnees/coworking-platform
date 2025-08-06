const fs = require('fs');
const path = require('path');

function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('Html') || content.includes('next/document')) {
      console.log(`Found in: ${filePath}`);
      console.log('---');
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
}

function searchInDirectory(directory) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      // Skip node_modules and .next directories
      if (file.name === 'node_modules' || file.name === '.next') {
        continue;
      }
      searchInDirectory(fullPath);
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
      searchInFile(fullPath);
    }
  }
}

// Start searching from the current directory
console.log('Searching for Html imports...');
searchInDirectory(process.cwd());
console.log('Search complete.');
