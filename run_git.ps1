$host.UI.RawUI.WindowTitle = "Git Push - friction-dashboard"
Set-Location $PSScriptRoot
Write-Host "=== CWD: $(Get-Location) ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "--- git status ---" -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "--- git log -3 ---" -ForegroundColor Yellow
git log --oneline -3
Write-Host ""

Write-Host "--- Staging supabase-db.js ---" -ForegroundColor Yellow
git add supabase-db.js
git diff --cached --name-only
Write-Host ""

Write-Host "--- Amending commit ---" -ForegroundColor Yellow
git commit --amend --no-edit
Write-Host ""

Write-Host "--- Pushing feature/dashboard-supabase ---" -ForegroundColor Yellow
git push origin feature/dashboard-supabase

Write-Host ""
Read-Host "Done — press Enter to close"
