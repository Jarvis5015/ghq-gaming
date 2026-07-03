@echo off
title GHQ — Push to GitHub
color 0B

echo.
echo  ========================================
echo   GHQ — PUSH TO GITHUB
echo  ========================================
echo.

cd /d E:\programing\GHQ

:: Show what changed
echo  Changed files:
git status --short
echo.

:: Ask for commit message
set /p MSG="Enter commit message (or press Enter for 'update'): "
if "%MSG%"=="" set MSG=update

git add .
git commit -m "%MSG%"
git push

echo.
echo  ========================================
echo   Pushed! Vercel + Railway auto-deploy.
echo   Check live in ~2 minutes.
echo  ========================================
echo.
pause
