@echo off
cd /d "%~dp0"
echo === CWD: %CD% ===
echo.

echo === Step 1: Re-init git (creates missing objects dir) ===
git init
echo.

echo === Step 2: Add remote ===
git remote add origin https://github.com/Jeevan1811/friction-dashboard.git 2>NUL
IF %ERRORLEVEL% NEQ 0 (
    echo Remote already exists - updating URL...
    git remote set-url origin https://github.com/Jeevan1811/friction-dashboard.git
)
echo.
echo Remotes:
git remote -v
echo.

echo === Step 3: Create feature branch ===
git checkout -b feature/dashboard-supabase 2>NUL
IF %ERRORLEVEL% NEQ 0 (
    echo Branch exists - switching...
    git checkout feature/dashboard-supabase
)
echo.

echo === Step 4: Stage all files ===
git add .
echo.
echo Files staged:
git diff --cached --name-only
echo.

echo === Step 5: Commit ===
git commit -m "feat: replace localStorage with Supabase write-through cache (#1)"
echo.

echo === Step 6: Push ===
git push -u origin feature/dashboard-supabase
echo.

if %ERRORLEVEL% EQU 0 (
  echo ================================================
  echo  Branch pushed successfully!
  echo  PR: https://github.com/Jeevan1811/friction-dashboard/compare/feature/dashboard-supabase
  echo ================================================
) else (
  echo PUSH FAILED - check credentials/remote access.
)
echo.
pause
