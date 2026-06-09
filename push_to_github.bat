@echo off
setlocal

cd /d "%~dp0"
echo === Friction Dashboard — Push Supabase feature branch ===
echo CWD: %CD%
echo.

REM Trust this directory (fixes git safe.directory error on Windows)
git config --global --add safe.directory "%CD:\=/%"
echo Trusted: %CD%
echo.

REM Verify git can see the repo
echo git status:
git status --short
echo.

REM Stage the corrected project URL in supabase-db.js
echo Staging supabase-db.js URL fix...
git add supabase-db.js

echo.
echo Staged files:
git diff --cached --name-only

echo.
REM Amend the previous commit to fold in the URL correction
echo Amending commit to include URL fix...
git commit --amend --no-edit

echo.
echo === Pushing feature/dashboard-supabase to origin ===
git push origin feature/dashboard-supabase

echo.
if %ERRORLEVEL% EQU 0 (
  echo ================================================
  echo  SUCCESS! Branch pushed.
  echo  Open a PR: https://github.com/Jeevan1811/friction-dashboard/compare/feature/dashboard-supabase
  echo ================================================
) else (
  echo PUSH FAILED. Check your credentials/remote access.
)

echo.
pause
