@echo off

echo Testing command prompt output...
echo -----------------------------

echo 1. Testing basic echo
echo 2. Testing environment variables:
echo    - USERNAME: %USERNAME%
echo    - COMPUTERNAME: %COMPUTERNAME%
echo    - DATE: %DATE%
echo    - TIME: %TIME%

echo 3. Testing command execution:
whoami
echo.

echo 4. Testing file creation:
echo Test content > test-file.txt
type test-file.txt
echo.

echo 5. Testing Node.js:
node -v
echo.

echo Test complete. Press any key to exit...
pause > nul
