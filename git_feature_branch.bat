@echo off
setlocal

set REPO=C:\Users\barat\Documents\friction-dashboard

echo === Friction Dashboard — Issue #1 Git Setup ===
echo.

REM Use -C flag so git always operates on the correct repo regardless of working dir
git -C "%REPO%" checkout -b feature/dashboard-supabase 2>NUL
IF %ERRORLEVEL% NEQ 0 (
    echo Branch already exists — switching to it
    git -C "%REPO%" checkout feature/dashboard-supabase
)

echo.
echo === Staging files ===
git -C "%REPO%" add supabase/migrations/001_app_data.sql
git -C "%REPO%" add supabase-db.js
git -C "%REPO%" add config.example.js
git -C "%REPO%" add core.js
git -C "%REPO%" add index.html
git -C "%REPO%" add .gitignore

echo.
echo === Files staged ===
git -C "%REPO%" diff --cached --name-only

echo.
echo === Committing ===
git -C "%REPO%" commit -m "feat: replace localStorage with Supabase write-through cache (#1)"

echo.
echo === Done. Run push_to_github.bat next to push. ===
pause
