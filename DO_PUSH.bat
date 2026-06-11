@echo off
cd /d "%~dp0"
if exist ".git\index.lock" del /f /q ".git\index.lock"

echo === Staging all files === >> push_log.txt 2>&1
git add taskboard-app\ >> push_log.txt 2>&1
git add BARAT.md >> push_log.txt 2>&1
git add PROJECT_STATUS.md >> push_log.txt 2>&1

echo === Committing === >> push_log.txt 2>&1
git commit -m "feat: v5 dark UI redesign — full Design System Dark Edition, all 5 pages + components rewritten, BARAT.md + PROJECT_STATUS.md handover docs added" >> push_log.txt 2>&1

echo === Pulling with rebase === >> push_log.txt 2>&1
git pull origin feature/dashboard-supabase --rebase >> push_log.txt 2>&1

echo === Pushing === >> push_log.txt 2>&1
git push origin feature/dashboard-supabase >> push_log.txt 2>&1

echo Exit code: %ERRORLEVEL% >> push_log.txt
type push_log.txt
pause
