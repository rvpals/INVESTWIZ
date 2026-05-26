@echo off
title InvestWiz - Starting...
echo ========================================
echo        InvestWiz Local Dev Server
echo ========================================
echo.
echo Starting API server on http://localhost:3001
echo Starting Frontend on http://localhost:5173
echo.
echo Press Ctrl+C in either window to stop.
echo ========================================
echo.

start "InvestWiz API" cmd /k "cd /d %~dp0 && pnpm dev:api"
timeout /t 2 /nobreak >nul
start "InvestWiz Frontend" cmd /k "cd /d %~dp0 && pnpm dev"

echo Both servers launched. You can close this window.
timeout /t 3 /nobreak >nul
