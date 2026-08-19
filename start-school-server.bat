@echo off
setlocal
cd /d "%~dp0"

title Nukhba School Local Server
color 0A

echo =====================================================================
echo          Nukhba School SaaS - Local Offline Server
echo          Server is starting on: http://localhost:3000
echo =====================================================================
echo.

:: 1. Open default browser directly
start "" "http://localhost:3000/login"

:: 2. Launch production server
call npm run start -- -H 0.0.0.0 -p 3000

if %errorlevel% neq 0 (
    call npm run dev -- -H 0.0.0.0 -p 3000
)

pause
