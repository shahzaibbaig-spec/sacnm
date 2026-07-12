@echo off
setlocal EnableExtensions
title SACNM Project Launcher
color 1F

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "MYSQL_BIN=C:\xampp\mysql\bin"
set "MYSQL_EXE=%MYSQL_BIN%\mysql.exe"
set "MYSQLD_EXE=%MYSQL_BIN%\mysqld.exe"

echo.
echo ============================================================
echo   Shamim Akhtar College Website - Local Project Launcher
echo ============================================================
echo.

where php >nul 2>&1
if errorlevel 1 (
  echo [ERROR] PHP was not found in PATH.
  echo Add C:\xampp\php to your Windows PATH, then try again.
  goto :failed
)

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js was not found. Install Node.js 20 or newer.
  goto :failed
)

if not exist "%MYSQLD_EXE%" (
  echo [ERROR] XAMPP MySQL was not found at %MYSQLD_EXE%
  goto :failed
)

echo [1/7] Checking MySQL...
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 (
  echo       Starting XAMPP MySQL...
  start "SACNM MySQL" /min "%MYSQLD_EXE%" --defaults-file="%MYSQL_BIN%\my.ini"
  powershell -NoProfile -Command "$ok=$false; 1..20 | ForEach-Object { if(Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue){$ok=$true;return}; Start-Sleep -Seconds 1 }; if(-not $ok){exit 1}" >nul 2>&1
  if errorlevel 1 (
    echo [ERROR] MySQL did not start. Open XAMPP Control Panel and check MySQL.
    goto :failed
  )
)

echo [2/7] Preparing the database...
"%MYSQL_EXE%" -u root -e "CREATE DATABASE IF NOT EXISTS nursing_college CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Could not connect to local MySQL as root.
  goto :failed
)

echo [3/7] Checking Laravel dependencies...
cd /d "%BACKEND%"
if not exist "vendor\autoload.php" (
  if exist "composer.phar" (
    php -d extension=zip composer.phar install --no-interaction --prefer-dist
  ) else (
    where composer >nul 2>&1
    if errorlevel 1 (
      echo [ERROR] Composer is missing and backend\composer.phar was not found.
      goto :failed
    )
    composer install --no-interaction --prefer-dist
  )
  if errorlevel 1 goto :failed
)

if not exist ".env" copy ".env.example" ".env" >nul
findstr /B /C:"APP_KEY=base64:" ".env" >nul 2>&1
if errorlevel 1 php artisan key:generate --force
php artisan migrate --force
if errorlevel 1 goto :failed
if not exist "public\storage" php artisan storage:link >nul 2>&1

echo [4/7] Checking frontend dependencies...
cd /d "%FRONTEND%"
if not exist "node_modules\next\package.json" (
  call npm.cmd install
  if errorlevel 1 goto :failed
)

echo [5/7] Starting Laravel API on port 8000...
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 start "SACNM Laravel API" /min cmd /k "cd /d ""%BACKEND%"" && php artisan serve --host=127.0.0.1 --port=8000"

echo [6/7] Starting Next.js frontend on port 3000...
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 start "SACNM Frontend" /min cmd /k "cd /d ""%FRONTEND%"" && set NEXT_PUBLIC_API_URL=http://127.0.0.1:8000&& npm.cmd run dev"

echo [7/7] Waiting for the website...
powershell -NoProfile -Command "$ok=$false; 1..60 | ForEach-Object { try { $r=Invoke-WebRequest -UseBasicParsing http://localhost:3000 -TimeoutSec 2; if($r.StatusCode -eq 200){$ok=$true;return} } catch {}; Start-Sleep -Seconds 1 }; if(-not $ok){exit 1}" >nul 2>&1
if errorlevel 1 (
  echo [ERROR] The frontend did not become ready within 60 seconds.
  echo Open the minimized SACNM Frontend window to see its error.
  goto :failed
)

echo.
echo ============================================================
echo   Project is running successfully.
echo   Website: http://localhost:3000
echo   API:     http://127.0.0.1:8000/api/health
echo ============================================================
echo.
start "" "http://localhost:3000"
echo You may close this launcher window. The two minimized server
echo windows must remain open while you use the local website.
powershell -NoProfile -Command "Start-Sleep -Seconds 8" >nul 2>&1
exit /b 0

:failed
echo.
echo The launcher could not complete the startup process.
echo Review the error above, then press any key to close.
pause >nul
exit /b 1
