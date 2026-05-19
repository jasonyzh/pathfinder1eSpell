@echo off
cd /d "%~dp0"
echo Starting PF1e Spell Server...
echo URL: http://localhost:8080
echo Press Ctrl+C to stop
echo.
node server.js
pause
