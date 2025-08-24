# Test Node.js environment and save output to file
$outputFile = "$PSScriptRoot\test-output.txt"

# Clear previous output
if (Test-Path $outputFile) {
    Remove-Item $outputFile -Force
}

# Test basic Node.js functionality
"=== Testing Node.js Environment ===" | Out-File -FilePath $outputFile -Append
"Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $outputFile -Append
"Node.js Version: $(node -v)" | Out-File -FilePath $outputFile -Append
"NPM Version: $(npm -v)" | Out-File -FilePath $outputFile -Append

# Run a simple Node.js script
$testScript = @"
console.log('Test 1: Console output works');
console.error('Test 2: Error output works');
console.log('Test 3: Process info:', {
    cwd: process.cwd(),
    platform: process.platform,
    arch: process.arch,
    versions: process.versions
});
"@

$testScript | Out-File -FilePath "$PSScriptRoot\temp-test.js" -Encoding utf8

"`n=== Running Test Script ===" | Out-File -FilePath $outputFile -Append
node "$PSScriptRoot\temp-test.js" 2>&1 | Out-File -FilePath $outputFile -Append -Encoding utf8

# Clean up
Remove-Item "$PSScriptRoot\temp-test.js" -Force -ErrorAction SilentlyContinue

"`nTest complete. Output saved to: $outputFile" | Out-File -FilePath $outputFile -Append
Write-Host "Test complete. Check $outputFile for results."
