const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const appDir = path.join(rootDir, 'app');

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Skip if already fixed
        if (content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'")) {
            console.log(`✓ Already fixed: ${path.relative(rootDir, filePath)}`);
            return false;
        }
        
        // Check for generateStaticParams
        const hasGenerateStaticParams = /export\s+(async\s+)?function\s+generateStaticParams\s*\([^)]*\)/s.test(content);
        const useClientRegex = /(["'])use client\1[\s;]*/g;
        const hasUseClient = useClientRegex.test(content);
        
        let newContent = content;
        
        // Remove generateStaticParams if it exists with use client
        if (hasGenerateStaticParams && hasUseClient) {
            newContent = newContent.replace(
                /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*|export\s+(async\s+)?function\s+generateStaticParams\s*\([^)]*\)\s*{([^{}]|{[^{}]*})*}/g, 
                ''
            );
            console.log(`ℹ️ Removed generateStaticParams from: ${path.relative(rootDir, filePath)}`);
        }
        
        // Remove existing use client if it exists
        if (hasUseClient) {
            newContent = newContent.replace(useClientRegex, '');
        }
        
        // Add use client at the top
        newContent = '"use client";\n\n' + newContent.trimStart();
        
        // Write the file if content has changed
        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✓ Fixed: ${path.relative(rootDir, filePath)}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        return false;
    }
}

// List of files to fix
const filesToFix = [
    'app/env-test/page.tsx',
    'app/test-signup/page.tsx',
    'app/unauthorized/page.tsx',
    'app/dashboard/member/settings/page.tsx'
];

// Process each file
let filesFixed = 0;
for (const file of filesToFix) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
        if (fixFile(filePath)) {
            filesFixed++;
        }
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
}

console.log('\nDone!');
console.log(`Fixed ${filesFixed} files.`);
