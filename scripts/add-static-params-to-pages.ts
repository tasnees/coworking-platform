import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'app');

async function processDirectory(directory: string) {
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    // Skip node_modules and .next directories
    if (item.name === 'node_modules' || item.name === '.next' || item.name === '.git') {
      continue;
    }
    
    if (item.isDirectory()) {
      await processDirectory(fullPath);
    } else if (item.name === 'page.tsx' || item.name === 'page.js') {
      await processPageFile(fullPath);
    }
  }
}

async function processPageFile(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Skip if already has generateStaticParams
    if (content.includes('export async function generateStaticParams')) {
      console.log(`✓ Already has generateStaticParams: ${filePath}`);
      return;
    }
    
    // Skip API routes
    if (filePath.includes('\\api\\') || filePath.includes('/api/')) {
      console.log(`⏭️  Skipping API route: ${filePath}`);
      return;
    }
    
    // Add generateStaticParams at the top of the file
    const staticParams = `
// Generate static params for this route
export async function generateStaticParams() {
  // For static export, return an empty array since we don't know the params in advance
  // The actual params will be handled client-side
  return [];
}

`;
    
    // Add after any 'use client' or imports
    const updatedContent = content.replace(
      /('use client'\s*\n|^)(import\s+.*\n)*/,
      (match) => `${match}${staticParams}`
    );
    
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    console.log(`✅ Added generateStaticParams to: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

console.log('🚀 Adding generateStaticParams to all pages...\n');

processDirectory(pagesDir)
  .then(() => {
    console.log('\n✅ All pages have been processed.');
    console.log('\nNext steps:');
    console.log('1. Run `next build` to verify the build works');
    console.log('2. For dynamic routes, update generateStaticParams with actual params');
  })
  .catch((error) => {
    console.error('\n❌ Error processing pages:', error);
    process.exit(1);
  });
