import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'app');
const errors: string[] = [];

function checkDirectory(directory: string) {
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      // Check if this is a page directory
      const pageFile = path.join(fullPath, 'page.tsx');
      if (fs.existsSync(pageFile)) {
        checkPageFile(pageFile);
      }
      checkDirectory(fullPath);
    } else if (item.name === 'page.tsx' && directory.endsWith('app')) {
      // Handle root page.tsx
      checkPageFile(fullPath);
    }
  }
}

function checkPageFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for default export
    if (!content.includes('export default')) {
      errors.push(`❌ Missing default export: ${filePath}`);
    }
    
    // Check for client component directive
    if (content.includes('use client') && !content.includes("'use client'")) {
      errors.push(`⚠️  Client component missing 'use client' directive: ${filePath}`);
    }
    
  } catch (error) {
    errors.push(`❌ Error reading ${filePath}: ${error}`);
  }
}

console.log('🔍 Checking page files for export issues...\n');

// Check root page
const rootPage = path.join(pagesDir, 'page.tsx');
if (fs.existsSync(rootPage)) {
  checkPageFile(rootPage);
}

// Check all other pages
checkDirectory(pagesDir);

// Print results
if (errors.length > 0) {
  console.log('Found the following issues:');
  errors.forEach(error => console.log(`• ${error}`));
  console.log(`\nTotal issues found: ${errors.length}`);
  process.exit(1);
} else {
  console.log('✅ No export issues found in page files!');  
  process.exit(0);
}
