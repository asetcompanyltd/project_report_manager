@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==========================================
echo   WTP Project Report Manager - Dev Launcher
echo ==========================================

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] Node.js was not found on your PATH.
  echo Install it from https://nodejs.org/ ^(LTS version^) and re-run this file.
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] npm was not found on your PATH. It normally ships with Node.js.
  echo Reinstall Node.js from https://nodejs.org/ and re-run this file.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo.
  echo Installing dependencies ^(first run only, this can take a few minutes^)...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed. See the output above for details.
    pause
    exit /b 1
  )
)

if not exist ".env.local" (
  echo.
  echo No .env.local found - creating one from .env.example.
  echo This defaults to a local SQLite file, so it works with no extra setup.
  copy /y ".env.example" ".env.local" >nul
  echo Generating a session secret...
  for /f "delims=" %%s in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set GENERATED_SECRET=%%s
  powershell -NoProfile -Command "(Get-Content '.env.local') -replace '^AUTH_SECRET=.*', 'AUTH_SECRET=%GENERATED_SECRET%' | Set-Content '.env.local'"
  echo For production, edit .env.local ^(or your Vercel project settings^) with your
  echo real Turso DATABASE_URL and DATABASE_AUTH_TOKEN.
)

echo.
echo Applying database migrations...
call npm run db:migrate
if errorlevel 1 (
  echo.
  echo [ERROR] Database migration failed. See the output above for details.
  pause
  exit /b 1
)

echo.
echo Starting the app in a new window...
start "WTP Report Manager - dev server" cmd /k "cd /d "%~dp0" && npm run dev"

echo Waiting for the app to become available at http://localhost:3000 ...
set READY=0
for /l %%i in (1,1,30) do (
  if !READY! == 0 (
    powershell -NoProfile -Command "try { (Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2) | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
    if not errorlevel 1 (
      set READY=1
    ) else (
      timeout /t 1 >nul
    )
  )
)

start "" "http://localhost:3000"

echo.
echo The app is starting in the other window. This window can be closed.
pause
