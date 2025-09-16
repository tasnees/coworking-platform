import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'app');

// List of files that should be skipped (they might have special exports)
const SKIP_FILES = [
  'layout.tsx',
  'loading.tsx',
  'error.tsx',
  'not-found.tsx',
  'global-error.tsx',
  'template.tsx',
  'head.tsx',
  'page.tsx',
  'route.ts',
  'middleware.ts',
  'middleware.clerk.ts'
];

// List of directories to process
const PROCESS_DIRS = [
  path.join(pagesDir, 'auth'),
  path.join(pagesDir, 'dashboard'),
  path.join(pagesDir, 'api'),
  path.join(pagesDir, 'home'),
  path.join(pagesDir, 'test-signup'),
  path.join(pagesDir, 'unauthorized'),
  path.join(pagesDir, 'env-test')
];

function processDirectory(directory: string) {
  if (!fs.existsSync(directory)) return;
  
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      // Check if this is a page directory
      const pageFile = path.join(fullPath, 'page.tsx');
      if (fs.existsSync(pageFile)) {
        processPageFile(pageFile);
      }
      processDirectory(fullPath);
    } else if (item.name === 'page.tsx' && directory.endsWith('app')) {
      // Handle root page.tsx
      processPageFile(fullPath);
    }
  }
}

function processPageFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Skip if already has a default export
    if (content.includes('export default') || content.includes('export {')) {
      console.log(`✓ Already has export: ${filePath}`);
      return;
    }
    
    // Add a simple default export
    const newContent = `${content}\n\n// Default export for Next.js\nexport default function Page() {\n  return (\n    <div className="flex items-center justify-center min-h-screen">\n      <div className="text-center p-8">\n        <h1 className="text-2xl font-bold mb-4">Page Under Construction</h1>\n        <p className="text-gray-600">This page is currently being developed.</p>\n      </div>\n    </div>\n  );\n}\n`;
    
    fs.writeFileSync(filePath, newContent);
    console.log(`✓ Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process all specified directories
console.log('🚀 Starting to process page files...\n');

// Process root page
const rootPage = path.join(pagesDir, 'page.tsx');
if (fs.existsSync(rootPage)) {
  processPageFile(rootPage);
}

// Process all other pages
PROCESS_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  } else {
    console.log(`⚠️  Directory not found: ${dir}`);
  }
});

console.log('\n✅ All page files have been processed.');
