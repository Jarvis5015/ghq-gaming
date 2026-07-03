@echo off
title GHQ — Full Setup
color 0B
echo.
echo  ========================================
echo   GHQ GAMERHEADQUARTER — FULL SETUP
echo  ========================================
echo.
echo  This will install everything needed to
echo  run GHQ on your computer.
echo.
echo  Estimated time: 5-10 minutes
echo  Press any key to start...
pause >nul

:: ── Step 1: Check internet ────────────────────────────────────────────────────
echo.
echo  [1/6] Checking internet connection...
ping google.com -n 1 >nul 2>&1
if %errorlevel% neq 0 (
  echo  ERROR: No internet connection. Please connect and try again.
  pause
  exit /b
)
echo  Internet OK

:: ── Step 2: Install Winget (usually already on Windows 11) ───────────────────
echo.
echo  [2/6] Checking Windows Package Manager (winget)...
winget --version >nul 2>&1
if %errorlevel% neq 0 (
  echo  Winget not found. Please install it from the Microsoft Store
  echo  Search for "App Installer" and install it, then run this script again.
  pause
  exit /b
)
echo  Winget OK

:: ── Step 3: Install Node.js ───────────────────────────────────────────────────
echo.
echo  [3/6] Installing Node.js v20 LTS...
node --version >nul 2>&1
if %errorlevel% equ 0 (
  echo  Node.js already installed: 
  node --version
) else (
  winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
  echo  Node.js installed!
)

:: ── Step 4: Install Git ───────────────────────────────────────────────────────
echo.
echo  [4/6] Installing Git...
git --version >nul 2>&1
if %errorlevel% equ 0 (
  echo  Git already installed:
  git --version
) else (
  winget install Git.Git --silent --accept-package-agreements --accept-source-agreements
  echo  Git installed!
)

:: ── Step 5: Install PostgreSQL ────────────────────────────────────────────────
echo.
echo  [5/6] Installing PostgreSQL 16...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
  echo  PostgreSQL already installed:
  psql --version
) else (
  winget install PostgreSQL.PostgreSQL.16 --silent --accept-package-agreements --accept-source-agreements
  echo  PostgreSQL installed!
  echo.
  echo  IMPORTANT: PostgreSQL was just installed.
  echo  Default password is set in step 6.
)

:: ── Step 6: Refresh PATH ──────────────────────────────────────────────────────
echo.
echo  [6/6] Refreshing environment...
call refreshenv >nul 2>&1

echo.
echo  ========================================
echo   ALL TOOLS INSTALLED!
echo   Now run: 2_setup_project.bat
echo  ========================================
echo.
pause
