import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'app');

function processDirectory(directory: string) {
  const files = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.name === 'page.tsx' || file.name === 'page.js') {
      processPageFile(fullPath);
    }
  }
}

function processPageFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has a default export
  if (content.includes('export default')) {
    return;
  }
  
  // Add a simple default export if none exists
  const newContent = `${content}\n\nexport default function Page() {\n  return (\n    <div>\n      <h1>Coming Soon</h1>\n      <p>This page is under construction.</p>\n    </div>\n  );\n}\n`;
  
  fs.writeFileSync(filePath, newContent);
  console.log(`Updated: ${filePath}`);
}

// Start processing from the pages directory
processDirectory(pagesDir);
console.log('✅ All page files have been processed.');
