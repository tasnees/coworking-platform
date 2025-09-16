import fs from 'fs';
import path from 'path';

const apiDir = path.join(process.cwd(), 'app', 'api');

async function processDirectory(directory: string) {
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      await processDirectory(fullPath);
    } else if (item.name === 'route.ts' || item.name === 'route.js') {
      await processRouteFile(fullPath);
    }
  }
}

async function processRouteFile(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let updated = false;

    // Check if the file has export const dynamic
    if (content.includes('export const dynamic')) {
      // Update dynamic export to be conditional
      content = content.replace(
        /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/g,
        '// Dynamic behavior is automatically handled by Next.js in production\n' +
        'export const dynamic = process.env.NODE_ENV === "production" ? "auto" : "force-dynamic"'
      );
      
      // Update force-static to be conditional
      content = content.replace(
        /export\s+const\s+dynamic\s*=\s*['"]force-static['"]/g,
        '// Static behavior for production, dynamic in development\n' +
        'export const dynamic = process.env.NODE_ENV === "production" ? "force-static" : "auto"'
      );
      
      updated = true;
    }

    // Add dynamicParams if not present
    if (content.includes('export const dynamic') && !content.includes('export const dynamicParams')) {
      content = content.replace(
        /export\s+const\s+dynamic[^;]+;/,
        (match) => `${match}\n\n// Enable dynamic parameters\nexport const dynamicParams = true;`
      );
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`✓ No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

console.log('🚀 Starting to update API routes for static export compatibility...\n');

processDirectory(apiDir)
  .then(() => {
    console.log('\n✅ All API routes have been processed.');
  })
  .catch((error) => {
    console.error('\n❌ Error processing API routes:', error);
    process.exit(1);
  });
