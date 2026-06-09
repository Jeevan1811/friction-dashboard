@echo off
cd /d "%~dp0"
echo CWD: %CD%
echo.
echo === where git ===
where git
echo.
echo === git version ===
git --version
echo.
echo === does .git exist here? ===
if exist ".git\" (echo YES - .git folder found) else (echo NO - .git NOT found)
echo.
echo === dir .git ===
dir /b /a ".git" 2>&1
echo.
echo === git rev-parse --git-dir ===
git rev-parse --git-dir 2>&1
echo.
echo === git status ===
git status 2>&1
echo.
pause
