# Test environment and save output to file
$outputFile = "$PSScriptRoot\env-test-output.txt"

# Clear previous output
if (Test-Path $outputFile) {
    Remove-Item $outputFile -Force
}

# Test basic PowerShell functionality
"=== Environment Test ===" | Out-File -FilePath $outputFile -Append
"Test Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File -FilePath $outputFile -Append
"Current Directory: $PWD" | Out-File -FilePath $outputFile -Append
"Computer Name: $env:COMPUTERNAME" | Out-File -FilePath $outputFile -Append
"Username: $env:USERNAME" | Out-File -FilePath $outputFile -Append

# Test Node.js
"`n=== Node.js Test ===" | Out-File -FilePath $outputFile -Append
try {
    $nodeVersion = node --version 2>&1 | Out-String
    "Node.js Version: $nodeVersion" | Out-File -FilePath $outputFile -Append
} catch {
    "Node.js not found or error: $_" | Out-File -FilePath $outputFile -Append
}

# Test file system
"`n=== File System Test ===" | Out-File -FilePath $outputFile -Append
$testFile = "$PSScriptRoot\fs-test-file.txt"
"Test content" | Out-File -FilePath $testFile
if (Test-Path $testFile) {
    "File created successfully: $testFile" | Out-File -FilePath $outputFile -Append
    $content = Get-Content -Path $testFile -Raw
    "File content: $content" | Out-File -FilePath $outputFile -Append
    Remove-Item $testFile -Force
    "Test file cleaned up" | Out-File -FilePath $outputFile -Append
} else {
    "Failed to create test file" | Out-File -FilePath $outputFile -Append
}

# List directory contents
"`n=== Directory Contents ===" | Out-File -FilePath $outputFile -Append
Get-ChildItem -Path $PSScriptRoot -Force | 
    Select-Object Name, Length, LastWriteTime | 
    Format-Table -AutoSize | 
    Out-String -Width 4096 | 
    Out-File -FilePath $outputFile -Append

Write-Host "Test complete. Check $outputFile for results."
