@echo off
cd /d "%~dp0"
title PF1e Spell Server

echo ============================================
echo   PF1e Spell Server
echo ============================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js not found
    echo Please install Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed
    echo.
)

if not exist "spells.db" (
    echo Error: spells.db not found
    pause
    exit /b 1
)

echo Checking port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo Stopping process %%a...
    taskkill /F /PID %%a >nul 2>nul
    timeout /t 1 /nobreak >nul
)

echo Starting server...
echo.
echo URL: http://localhost:8080
echo Press Ctrl+C to stop
echo.
echo ============================================
echo.

node server.js

if %ERRORLEVEL% neq 0 (
    echo.
    echo Server failed to start
    echo.
    pause
    exit /b 1
)

pause