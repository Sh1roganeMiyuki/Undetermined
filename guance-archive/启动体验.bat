@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 城北新区资料协作平台 · 本地启动

rem 运行环境：优先用项目内便携运行时，其次系统 Node.js，都没有就自动准备一份。
if exist "runtime\node.exe" set "PATH=%CD%\runtime;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo 本机未检测到 Node.js，正在自动准备本地运行环境……
  echo 需要联网下载（约 30MB，只会做这一次，请耐心等待一两分钟）。
  echo.
  powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\ensure-node.ps1" -Target "%~dp0runtime"
  if errorlevel 1 goto :nodefail
  set "PATH=%CD%\runtime;%PATH%"
)

rem 首次启动（或产物缺失）时自动安装依赖并构建，仅这一次。
if not exist "out\index.html" (
  echo 首次启动：正在构建静态产物，请稍候（仅这一次，约一两分钟）……
  if not exist "node_modules" call npm install --no-audit --no-fund
  call npm run build
  if errorlevel 1 goto :buildfail
)

node "scripts\serve.mjs" out 7788
echo.
echo 体验服务已结束。下次再来，双击本文件即可——记录还在。
pause
goto :eof

:buildfail
echo.
echo 构建失败。请先在本目录手动运行 “npm install” 与 “npm run build” 查看报错。
pause
goto :eof

:nodefail
echo.
echo 自动准备运行环境失败（多半是网络原因）。可选择任一种方式手动完成：
echo   方式一：按 Win 键，搜索“终端”打开，粘贴运行： winget install OpenJS.NodeJS.LTS
echo   方式二：打开 https://nodejs.org/ 下载 LTS 安装包，装好后重新双击本文件。
pause
goto :eof