@echo off
title GHQ — Project Setup
color 0B

echo.
echo  ========================================
echo   GHQ — PROJECT SETUP
echo  ========================================
echo.

:: ── Step 1: Install frontend packages ────────────────────────────────────────
echo  [1/5] Installing frontend packages...
echo.
cd /d E:\programing\GHQ
npm install
if %errorlevel% neq 0 (
  echo  ERROR: Frontend npm install failed!
  pause
  exit /b
)
echo.
echo  Frontend packages OK!

:: ── Step 2: Install backend packages ─────────────────────────────────────────
echo.
echo  [2/5] Installing backend packages...
echo.
cd /d E:\programing\GHQ\server
npm install
if %errorlevel% neq 0 (
  echo  ERROR: Backend npm install failed!
  pause
  exit /b
)
echo.
echo  Backend packages OK!

:: ── Step 3: Generate Prisma client ───────────────────────────────────────────
echo.
echo  [3/5] Generating Prisma client...
cd /d E:\programing\GHQ\server
npx prisma generate
echo  Prisma OK!

:: ── Step 4: Create .env files ─────────────────────────────────────────────────
echo.
echo  [4/5] Creating environment files...

if not exist "E:\programing\GHQ\server\.env" (
  (
    echo DATABASE_URL="postgresql://postgres:ghqadmin123@localhost:5432/ghq_db"
    echo JWT_SECRET="ghq_local_dev_secret_change_in_production_2026"
    echo JWT_EXPIRES_IN="7d"
    echo PORT=5000
    echo NODE_ENV=development
    echo CLIENT_URL="http://localhost:5173"
    echo UPI_ID="parshwapati2009@okhdfcbank"
    echo UPI_NAME="GamerHeadQuarter"
    echo PAYMENT_CODE_EXPIRY_HOURS=24
    echo GOOGLE_CLIENT_ID="1002134307154-phv4pgmq12gvlcio74tnthmf88sk4tok.apps.googleusercontent.com"
    echo GOOGLE_CLIENT_SECRET="your-google-secret-here"
  ) > "E:\programing\GHQ\server\.env"
  echo  server/.env created!
) else (
  echo  server/.env already exists — skipped
)

if not exist "E:\programing\GHQ\.env.local" (
  echo VITE_API_URL=http://localhost:5000/api > "E:\programing\GHQ\.env.local"
  echo  .env.local created!
) else (
  echo  .env.local already exists — skipped
)

:: ── Step 5: Setup database ────────────────────────────────────────────────────
echo.
echo  [5/5] Setting up database...
echo.

:: Add PostgreSQL to PATH for this session
set PGPATH=C:\Program Files\PostgreSQL\16\bin
set PATH=%PGPATH%;%PATH%
set PGPASSWORD=ghqadmin123

:: Create database
echo  Creating database ghq_db...
"%PGPATH%\psql.exe" -U postgres -c "CREATE DATABASE ghq_db;" 2>nul
if %errorlevel% equ 0 (
  echo  Database created!
) else (
  echo  Database already exists — continuing...
)

:: Run migrations
echo.
echo  Running migrations...
cd /d E:\programing\GHQ\server
npx prisma migrate dev --name init
if %errorlevel% neq 0 (
  echo.
  echo  Migration issue — trying db push instead...
  npx prisma db push
)

:: Seed
echo.
echo  Seeding sample data...
node prisma/seed.js

echo.
echo  ========================================
echo   ALL DONE!
echo.
echo   Double-click 3_start_dev.bat to start.
echo.
echo   Login:
echo   Admin:  admin@ghq.gg  / admin123
echo   Player: phantom@ghq.gg / player123
echo  ========================================
echo.
pause
