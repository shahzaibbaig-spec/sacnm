@echo off
setlocal EnableExtensions
title SACNM Offline Launcher
color 1F

set "ROOT=%~dp0"
set "FRONTEND=%ROOT%frontend"
set "BACKEND=%ROOT%backend"
set "NEXT_CMD=%FRONTEND%\node_modules\.bin\next.cmd"
set "MYSQL_BIN=C:\xampp\mysql\bin"
set "MYSQL_EXE=%MYSQL_BIN%\mysql.exe"
set "MYSQLD_EXE=%MYSQL_BIN%\mysqld.exe"

echo.
echo ============================================================
echo   SACNM Website - Offline Local Launcher
echo ============================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js was not found. Install Node.js 20 or newer.
  goto :failed
)

if not exist "%NEXT_CMD%" (
  echo [ERROR] Offline frontend dependencies are missing.
  echo Connect to the internet once and run npm.cmd install inside:
  echo %FRONTEND%
  goto :failed
)

echo [1/6] Checking the local database...
set "DATABASE_READY=0"
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if not errorlevel 1 set "DATABASE_READY=1"

if "%DATABASE_READY%"=="0" if exist "%MYSQLD_EXE%" (
  echo       Starting XAMPP MySQL from local files...
  start "SACNM MySQL" /min "%MYSQLD_EXE%" --defaults-file="%MYSQL_BIN%\my.ini"
  powershell -NoProfile -Command "$ok=$false; foreach ($attempt in 1..20) { if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) { $ok=$true; break }; Start-Sleep -Seconds 1 }; if (-not $ok) { exit 1 }" >nul 2>&1
  if not errorlevel 1 set "DATABASE_READY=1"
)

if "%DATABASE_READY%"=="1" if exist "%MYSQL_EXE%" (
  "%MYSQL_EXE%" -u root -e "CREATE DATABASE IF NOT EXISTS nursing_college CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >nul 2>&1
)

if "%DATABASE_READY%"=="0" (
  echo [WARNING] Local MySQL is unavailable. Public pages will work,
  echo           but forms, accounts, and the portal may not.
)

echo [2/6] Checking the local Laravel API...
set "BACKEND_READY=0"
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if not errorlevel 1 set "BACKEND_READY=1"

if "%BACKEND_READY%"=="0" (
  where php >nul 2>&1
  if not errorlevel 1 if exist "%BACKEND%\vendor\autoload.php" (
    if "%DATABASE_READY%"=="1" (
      pushd "%BACKEND%"
      php artisan migrate --force >nul 2>&1
      if not exist "public\storage" php artisan storage:link >nul 2>&1
      popd
    )
    start "SACNM Laravel API" /min cmd /k "cd /d ""%BACKEND%"" && php artisan serve --host=127.0.0.1 --port=8000"
    set "BACKEND_READY=1"
  )
)

if "%BACKEND_READY%"=="0" (
  echo [WARNING] The offline Laravel API could not be started.
  echo           Public pages will still be available.
)

echo [3/6] Preparing a clean frontend build cache...
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if not errorlevel 1 (
  echo [ERROR] Port 3000 is already in use.
  echo Close the existing frontend window, then run this file again.
  goto :failed
)

if exist "%FRONTEND%\.next" rmdir /s /q "%FRONTEND%\.next"

echo [4/6] Starting Next.js with the local API address...
start "SACNM Frontend Offline" /min cmd /k "cd /d ""%FRONTEND%"" && set ""NEXT_PUBLIC_API_URL=http://127.0.0.1:8000"" && set ""NEXT_TELEMETRY_DISABLED=1"" && ""%NEXT_CMD%"" dev -H 127.0.0.1 -p 3000"

echo [5/6] Waiting for the website...
powershell -NoProfile -Command "$ok=$false; foreach ($attempt in 1..60) { try { $r=Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:3000' -TimeoutSec 2; if ($r.StatusCode -eq 200) { $ok=$true; break } } catch {}; Start-Sleep -Seconds 1 }; if (-not $ok) { exit 1 }" >nul 2>&1
if errorlevel 1 (
  echo [ERROR] The frontend did not become ready within 60 seconds.
  echo Open the minimized SACNM Frontend Offline window for details.
  goto :failed
)

echo [6/6] Verifying the compiled CSS...
powershell -NoProfile -Command "$page=Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:3000' -TimeoutSec 10; $match=[regex]::Match($page.Content,'/_next/static/css/[A-Za-z0-9_./?=^&-]+'); if (-not $match.Success) { exit 2 }; $url='http://127.0.0.1:3000'+($match.Value -replace '&amp;','&'); $css=Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 10; if ($css.StatusCode -ne 200 -or $css.Content.Length -lt 100) { exit 3 }" >nul 2>&1
if errorlevel 1 (
  echo [ERROR] The website started, but its CSS did not load correctly.
  echo Close the frontend window and run this launcher once more.
  goto :failed
)

echo.
echo ============================================================
echo   Website and CSS are ready: http://127.0.0.1:3000
echo   This launcher did not download anything from the internet.
echo ============================================================
echo.
start "" "http://127.0.0.1:3000"
echo Keep the minimized server windows open while using the site.
timeout /t 8 /nobreak >nul
exit /b 0

:failed
echo.
echo Offline startup was not completed.
echo Press any key to close this window.
pause >nul
exit /b 1
