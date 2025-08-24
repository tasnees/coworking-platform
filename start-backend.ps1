$env:NODE_ENV="development"
$env:PORT=5000
$env:MONGODB_URI="mongodb://localhost:27017/coworking-dev"
$env:JWT_SECRET="dev_secret"
$env:FRONTEND_URL="http://localhost:3000"

Write-Host "Starting backend server with the following environment variables:"
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "PORT: $env:PORT"
Write-Host "MONGODB_URI: $env:MONGODB_URI"

cd backend
node src/server.ts
