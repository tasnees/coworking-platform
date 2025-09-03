const fs = require('fs');
const path = require('path');

const filePath = path.join('backend', 'src', 'routes', 'booking.routes.ts');

try {
    const stats = fs.statSync(filePath);
    console.log(`File: ${filePath}`);
    console.log(`Size: ${stats.size} bytes`);
    
    const content = fs.readFileSync(filePath, 'binary');
    const crlf = content.split('\r\n').length - 1;
    const lf = content.split('\n').length - 1 - crlf;
    
    console.log(`CRLF line endings: ${crlf}`);
    console.log(`LF line endings: ${lf}`);
    
    if (crlf > 0) {
        console.log('\nConverting line endings to LF...');
        const normalized = content.replace(/\r\n/g, '\n');
        fs.writeFileSync(filePath + '.lf', normalized, 'utf8');
        console.log(`Created new file with LF endings: ${filePath}.lf`);
    }
} catch (error) {
    console.error('Error:', error.message);
}
