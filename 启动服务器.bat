@echo off
chcp 65001 >nul
title PF1e 法术查询器
cd /d "%~dp0"

echo ============================================
echo   PF1e 法术查询器
echo ============================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: 未检测到Node.js
    echo.
    echo 请先安装Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 检查依赖是否已安装
if not exist "node_modules\" (
    echo 📦 首次运行，正在安装依赖...
    echo.
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo.
        echo ❌ 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo.
    echo ✅ 依赖安装完成！
    echo.
)

REM 检查数据库文件
if not exist "spells.db" (
    echo ❌ 错误: 未找到数据库文件 spells.db
    echo.
    pause
    exit /b 1
)

echo 🚀 正在启动服务器...
echo.
echo 📱 访问地址: http://localhost:8080
echo 💡 按 Ctrl+C 可停止服务器
echo.
echo ============================================
echo.

node server.js

if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ 服务器启动失败
    echo.
    pause
    exit /b 1
)

pause