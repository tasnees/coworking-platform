const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const dashboardDir = path.join(rootDir, 'app', 'dashboard');

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;
        let modified = false;
        
        // Check if file has generateStaticParams
        const hasGenerateStaticParams = /export\s+(async\s+)?function\s+generateStaticParams\s*\([^)]*\)/s.test(content);
        
        // Check if file contains 'use client' directive
        const useClientRegex = /(["'])use client\1[\s;]*/g;
        const hasUseClient = useClientRegex.test(content);
        
        if (hasGenerateStaticParams && hasUseClient) {
            // Remove generateStaticParams if both exist
            newContent = newContent.replace(
                /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*|export\s+(async\s+)?function\s+generateStaticParams\s*\([^)]*\)\s*{([^{}]|{[^{}]*})*}/g, 
                ''
            );
            modified = true;
            console.log(`ℹ️ Removed generateStaticParams from: ${path.relative(rootDir, filePath)}`);
        }
        
        // Move 'use client' to top if it exists but not at the top
        if (hasUseClient) {
            // Remove existing 'use client' directive
            newContent = newContent.replace(useClientRegex, '');
            
            // Remove any leading whitespace and empty lines
            newContent = newContent.replace(/^\s*[\r\n]+/, '');
            
            // Add 'use client' at the top
            newContent = '"use client";\n\n' + newContent;
            modified = true;
        } else if (hasGenerateStaticParams) {
            // If it's a server component with generateStaticParams, ensure it doesn't have 'use client'
            newContent = newContent.replace(useClientRegex, '');
            modified = true;
        } else {
            console.log(`- No changes needed: ${path.relative(rootDir, filePath)}`);
            return false;
        }
        
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

function processDirectory(directory) {
    let filesFixed = 0;
    
    function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.name === 'page.tsx') {
                if (fixFile(fullPath)) {
                    filesFixed++;
                }
            }
        }
    }
    
    console.log('Scanning for files that need fixing...');
    walk(directory);
    
    return filesFixed;
}

// Run the script
const filesFixed = processDirectory(dashboardDir);

console.log('\nDone!');
console.log(`Fixed ${filesFixed} files.`);
