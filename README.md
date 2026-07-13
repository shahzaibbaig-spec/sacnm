# Shamim Akhtar College of Nursing & Midwifery

A complete responsive college website and admissions API for KORT, Mirpur, AJK.

## What is included

- `frontend/`: Next.js, TypeScript, Tailwind CSS and Framer Motion-ready UI
- `backend/`: Laravel 12 REST API, MySQL migration, validation and secure file uploads
- Pages: Home, About, Programs, Admissions, Apply Online and Contact
- API: `GET /api/health` and `POST /api/admissions`

## 1. Install prerequisites on Windows

Install Node.js 20+, PHP 8.2+, Composer, and MySQL 8 (XAMPP is also suitable). In a new VS Code PowerShell terminal, check:

```powershell
node --version
npm.cmd --version
php --version
composer --version
mysql --version
```

Use `npm.cmd` if PowerShell says script execution is disabled.

## 2. Create the MySQL database

Start MySQL, open phpMyAdmin, and create a database named `nursing_college`. Alternatively:

```sql
CREATE DATABASE nursing_college CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 3. Set up Laravel

```powershell
cd "C:\Users\KORT OFFICAL\Desktop\sacnm\shamim-akhtar-college-website\backend"
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Open `backend/.env` and change `DB_USERNAME` and `DB_PASSWORD` to match MySQL. Then run:

```powershell
php artisan migrate
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

Test in a browser: http://127.0.0.1:8000/api/health

## 4. Set up Next.js

Open a second VS Code terminal:

```powershell
cd "C:\Users\KORT OFFICAL\Desktop\sacnm\shamim-akhtar-college-website\frontend"
npm.cmd install
Copy-Item .env.local.example .env.local
npm.cmd run dev
```

Open http://localhost:3000. The environment value is:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## API upload rules

- CNIC/B-form: PDF, JPG or PNG; maximum 5 MB
- Educational document: PDF, JPG or PNG; maximum 10 MB
- Photo: JPG or PNG; maximum 2 MB
- Files are stored below `storage/app/public/admissions/`; database rows store relative paths.
- CORS accepts `http://localhost:3000`. Change `FRONTEND_URL` for another frontend origin.

## Testing

Backend (after PHP/Composer setup):

```powershell
php artisan test
```

Frontend production check:

```powershell
npm.cmd run build
npm.cmd run start
```

Manual end-to-end test:

1. Keep both development servers running.
2. Open http://localhost:3000/apply.
3. Complete the form and upload valid sample files.
4. Submit and confirm the success message.
5. Check the `admissions` MySQL table and `backend/storage/app/public/admissions`.

Replace the placeholder phone, email, office timing and map when official details are available.

## Offline Windows launcher

After the frontend and backend dependencies have been installed once, double-click
`Start-SACNM-Offline.bat` to run the project without downloading anything. The
launcher serves the website at `http://127.0.0.1:3000`, overrides the frontend API
address to the local Laravel server, clears stale generated Next.js files, and checks
that the compiled CSS is reachable before opening the browser.

XAMPP MySQL, PHP, `backend/vendor`, and `frontend/node_modules` must already exist
for all forms and portal features to work fully offline. Public pages can still run
when the database or Laravel API is unavailable.
