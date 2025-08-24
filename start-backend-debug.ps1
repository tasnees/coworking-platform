# Start backend server with debug logging
$env:NODE_OPTIONS = '--trace-warnings --unhandled-rejections=strict --trace-uncaught'
$env:DEBUG = '*,-express:router*,-express:application,-express:view,-express:init'
$env:NODE_ENV = 'development'
$env:PORT = 5000
$env:MONGODB_URI = 'mongodb://localhost:27017/coworking-platform'

Write-Host "Starting backend server with debug logging..."
Write-Host "NODE_OPTIONS: $env:NODE_OPTIONS"
Write-Host "DEBUG: $env:DEBUG"
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "PORT: $env:PORT"
Write-Host "MONGODB_URI: $env:MONGODB_URI"

# Change to backend directory and start the server
Set-Location -Path "$PSScriptRoot\backend"
node --trace-warnings --unhandled-rejections=strict --trace-uncaught src/server.ts

# Keep the window open to see any output
Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
