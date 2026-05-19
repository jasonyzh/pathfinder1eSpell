@echo off
cd /d "%~dp0"
title PF1e Spell Server - Quick Install

echo ============================================
echo   PF1e Spell Server - Quick Install
echo ============================================
echo.

echo Checking system...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js not found
    echo.
    echo Please install Node.js:
    echo 1. Visit https://nodejs.org/
    echo 2. Download and install LTS version
    echo 3. Run this script again
    echo.
    echo Press any key to open download page...
    pause >nul
    start https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Node.js installed: %NODE_VERSION%
echo.

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: npm not found
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo npm installed: %NPM_VERSION%
echo.

echo Installing dependencies...
echo.
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo Failed to install dependencies
    echo Please check:
    echo 1. Network connection
    echo 2. npm registry availability
    echo.
    echo Try China mirror:
    echo npm config set registry https://registry.npmmirror.com
    echo.
    pause
    exit /b 1
)

echo.
echo Dependencies installed
echo.

echo Checking project files...
if not exist "spells.db" (
    echo Warning: spells.db not found
    set MISSING_DB=1
)

if not exist "server.js" (
    echo Error: server.js not found
    set MISSING_SERVER=1
)

if not exist "index.html" (
    echo Error: index.html not found
    set MISSING_INDEX=1
)

if defined MISSING_DB (
    echo.
    echo Database file missing
)

if defined MISSING_SERVER (
    echo.
    echo Missing core files
    pause
    exit /b 1
)

if defined MISSING_INDEX (
    echo.
    echo Missing frontend files
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Installation Complete
echo ============================================
echo.
echo Project Info:
echo   - Spells: 3029
echo   - Port: 8080
echo   - URL: http://localhost:8080
echo.
echo Next Steps:
echo   1. Double-click "start.bat" to start
echo   2. Open http://localhost:8080 in browser
echo.
echo ============================================
echo.

set /p START_NOW="Start server now? (Y/N): "
if /i "%START_NOW%"=="Y" (
    echo.
    echo Starting server...
    echo.
    start "" "http://localhost:8080"
    call node server.js
) else (
    echo.
    echo Installation complete
    echo.
    pause
)