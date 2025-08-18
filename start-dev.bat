@echo off
REM Start development server with environment variables

echo Starting development server...

REM Set environment variables from .env.local
for /f "tokens=*" %%i in (.env.local) do (
    for /f "tokens=1,* delims==" %%a in ("%%i") do (
        if not "%%a"=="" if not "%%a"=="#" (
            set "%%a=%%b"
        )
    )
)

echo Environment variables loaded from .env.local
echo MONGODB_URI: %MONGODB_URI:0,10%...
echo NODE_ENV: %NODE_ENV%

echo.
echo Starting Next.js development server...

REM Start the development server with the environment variables
set NODE_ENV=development
npm run dev
