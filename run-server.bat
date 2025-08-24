@echo off
set NODE_ENV=development
set PORT=5000
set MONGODB_URI=mongodb://localhost:27017/coworking-platform
set DEBUG=*

cd backend
node src/server.js > server.log 2>&1

echo Server started. Check server.log for output.
pause
