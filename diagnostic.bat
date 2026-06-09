@echo off
cd /d "%~dp0"
echo === DIAGNOSTIC ===
echo CWD: %CD%
echo.
echo Adding safe.directory...
git config --global --add safe.directory "%CD:\=/%"
echo.
echo git version:
git --version
echo.
echo git status:
git status
echo.
echo git log --oneline -3:
git log --oneline -3
echo.
pause
