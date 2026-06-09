@echo off
cd /d "%~dp0"
echo ================================================
echo  COMMIT_PUSH.bat  -  friction-dashboard
echo ================================================
echo.

echo [1/5] Setting git identity...
git config --global user.email "baratstylo0@gmail.com"
git config --global user.name "Barat"
echo Done: %ERRORLEVEL%
echo.

echo [2/5] Current branch:
git branch --show-current
echo.

echo [3/5] Staging all files...
git add .
echo Staged:
git diff --cached --name-only
echo.

echo [4/5] Committing...
git commit -m "feat: replace localStorage with Supabase write-through cache (#1)"
IF ERRORLEVEL 1 (
    echo NOTE: commit returned error - checking if already committed...
    git log --oneline -2
)
echo.

echo [5/5] Pushing to GitHub...
git push -u origin feature/dashboard-supabase
echo Push exit code: %ERRORLEVEL%
echo.

echo ================================================
echo  Done! Check output above for success/failure.
echo  PR: https://github.com/Jeevan1811/friction-dashboard/compare/feature/dashboard-supabase
echo ================================================
pause
