$filePath = Join-Path $PSScriptRoot 'backend\src\routes\booking.routes.ts'
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
$content = $content -replace "`r?`n", "`r`n"
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Line endings have been converted to CRLF"
