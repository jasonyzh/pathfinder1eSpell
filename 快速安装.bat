@echo off
chcp 65001 >nul
title PF1e 法术查询器 - 快速安装
cd /d "%~dp0"

echo ============================================
echo   PF1e 法术查询器 - 快速安装
echo ============================================
echo.

REM 检查Node.js是否安装
echo 🔍 检查系统环境...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: 未检测到Node.js
    echo.
    echo 请先安装Node.js:
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装 LTS 版本
    echo 3. 重新运行此脚本
    echo.
    echo 按任意键打开下载页面...
    pause >nul
    start https://nodejs.org/
    pause
    exit /b 1
)

REM 显示Node.js版本
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js 已安装: %NODE_VERSION%
echo.

REM 检查npm
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: npm 未找到
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm 已安装: %NPM_VERSION%
echo.

REM 安装依赖
echo 📦 正在安装项目依赖...
echo.
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ 依赖安装失败，请检查:
    echo 1. 网络连接是否正常
    echo 2. npm 源是否可用
    echo.
    echo 尝试切换国内镜像源:
    echo npm config set registry https://registry.npmmirror.com
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 依赖安装完成！
echo.

REM 检查关键文件
echo 🔍 检查项目文件...
if not exist "spells.db" (
    echo ⚠️  警告: 未找到数据库文件 spells.db
    echo.
    set MISSING_DB=1
)

if not exist "server.js" (
    echo ❌ 错误: 未找到 server.js
    set MISSING_SERVER=1
)

if not exist "index.html" (
    echo ❌ 错误: 未找到 index.html
    set MISSING_INDEX=1
)

if defined MISSING_DB (
    echo.
    echo ⚠️  数据库文件缺失，某些功能可能无法使用
)

if defined MISSING_SERVER (
    echo.
    echo ❌ 缺少核心文件，请重新下载项目
    pause
    exit /b 1
)

if defined MISSING_INDEX (
    echo.
    echo ❌ 缺少前端文件，请重新下载项目
    pause
    exit /b 1
)

echo.
echo ============================================
echo   🎉 安装完成！
echo ============================================
echo.
echo 📋 项目信息:
echo   - 法术数量: 3029
echo   - 服务端口: 8080
echo   - 访问地址: http://localhost:8080
echo.
echo 🚀 下一步:
echo   1. 双击 "启动服务器.bat" 启动服务
echo   2. 在浏览器中打开 http://localhost:8080
echo.
echo ============================================
echo.

REM 询问是否立即启动
set /p START_NOW="是否立即启动服务器？ (Y/N): "
if /i "%START_NOW%"=="Y" (
    echo.
    echo 🚀 正在启动服务器...
    echo.
    start "" "http://localhost:8080"
    call node server.js
) else (
    echo.
    echo ✅ 安装完成！稍后可以运行 "启动服务器.bat" 启动服务
    echo.
    pause
)