@echo off
cd /d "%~dp0"
echo ================================================
echo  FINAL_PUSH.bat  -  friction-dashboard
echo  CWD: %CD%
echo ================================================
echo.

echo [1/7] Removing stale lock files...
del ".git\config.lock" 2>NUL
del ".git\index.lock" 2>NUL
echo Done.
echo.

echo [2/7] git init (creates missing objects/ dir)...
git init
IF ERRORLEVEL 1 (
    echo ERROR: git init failed. Check git is installed and this folder is writable.
    pause & exit /b 1
)
echo.

echo [3/7] Set remote origin...
git remote add origin https://github.com/Jeevan1811/friction-dashboard.git 2>NUL
IF ERRORLEVEL 1 (
    git remote set-url origin https://github.com/Jeevan1811/friction-dashboard.git
)
git remote -v
echo.

echo [4/7] Create/switch to feature branch...
git checkout -b feature/dashboard-supabase 2>NUL
IF ERRORLEVEL 1 (
    git checkout feature/dashboard-supabase
)
echo On branch: & git branch --show-current
echo.

echo [5/7] Stage all files...
git add .
echo Staged files:
git diff --cached --name-only
echo.

echo [6/7] Commit...
git commit -m "feat: replace localStorage with Supabase write-through cache (#1)"
IF ERRORLEVEL 1 (
    echo NOTE: Nothing new to commit (may already be committed). Continuing...
)
echo.

echo [7/7] Push to GitHub...
git push -u origin feature/dashboard-supabase
IF ERRORLEVEL 1 (
    echo.
    echo PUSH FAILED - you may need to authenticate.
    echo Run: git credential-manager configure
    echo Then re-run this bat file.
    pause & exit /b 1
)

echo.
echo ================================================
echo  SUCCESS! Branch pushed.
echo  Open PR at:
echo  https://github.com/Jeevan1811/friction-dashboard/compare/feature/dashboard-supabase
echo ================================================
echo.
pause
