import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'app');

// List of dynamic routes that need generateStaticParams
const DYNAMIC_ROUTES = [
  '/dashboard/[role]',
  '/dashboard/[role]/[page]',
  // Add other dynamic routes as needed
];

async function processDirectory(directory: string) {
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      await processDirectory(fullPath);
    } else if (item.name === 'page.tsx' || item.name === 'page.js') {
      const relativePath = path.relative(pagesDir, directory);
      const routePath = `/${relativePath.replace(/\\/g, '/')}`;
      
      // Check if this is a dynamic route
      if (DYNAMIC_ROUTES.some(route => routePath.startsWith(route) || routePath.includes('['))) {
        await addGenerateStaticParams(fullPath, routePath);
      }
    }
  }
}

async function addGenerateStaticParams(filePath: string, routePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Skip if already has generateStaticParams
    if (content.includes('export async function generateStaticParams')) {
      console.log(`✓ Already has generateStaticParams: ${filePath}`);
      return;
    }
    
    // Add generateStaticParams at the top of the file
    const staticParams = `
// Generate static params for this route
export async function generateStaticParams() {
  // TODO: Replace with actual dynamic segments
  return [
    { /* Add your dynamic params here */ }
  ];
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

console.log('🚀 Adding generateStaticParams to dynamic routes...\n');

processDirectory(pagesDir)
  .then(() => {
    console.log('\n✅ All dynamic routes have been processed.');
    console.log('\nNext steps:');
    console.log('1. Update the generateStaticParams functions with your actual dynamic segments');
    console.log('2. Run `next build` to verify the build works');
  })
  .catch((error) => {
    console.error('\n❌ Error processing routes:', error);
    process.exit(1);
  });
