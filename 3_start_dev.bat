@echo off
title GHQ — Dev Server
color 0B

echo.
echo  ========================================
echo   GHQ — STARTING DEV SERVERS
echo  ========================================
echo.
echo  Starting Backend  on http://localhost:5000
echo  Starting Frontend on http://localhost:5173
echo.
echo  Both will open automatically.
echo  Press Ctrl+C in either window to stop.
echo.

:: Start backend in a new window
start "GHQ Backend :5000" cmd /k "cd /d E:\programing\GHQ\server && npm run dev"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "GHQ Frontend :5173" cmd /k "cd /d E:\programing\GHQ && npm run dev"

:: Wait 3 more seconds then open browser
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo  Both servers are running in separate windows.
echo  Close those windows to stop the servers.
echo.
pause
