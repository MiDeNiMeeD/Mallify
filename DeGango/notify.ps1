# Quick Email Notification Helper
# Easy shortcuts for common notification scenarios

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Mallify Email Notification Helper       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Select notification type:" -ForegroundColor Yellow
Write-Host "1. Commit notification" -ForegroundColor White
Write-Host "2. Push notification" -ForegroundColor White
Write-Host "3. Merge notification" -ForegroundColor White
Write-Host "4. Docker build success" -ForegroundColor White
Write-Host "5. Docker build failed" -ForegroundColor White
Write-Host "6. Test results" -ForegroundColor White
Write-Host "7. Custom message" -ForegroundColor White
Write-Host "8. Test email configuration" -ForegroundColor White
Write-Host "0. Exit" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter your choice (0-8)"

switch ($choice) {
    "1" {
        $commitMsg = git log -1 --pretty=format:"%s" 2>$null
        if (-not $commitMsg) { $commitMsg = Read-Host "Enter commit message" }
        .\send-notification.ps1 `
            -Subject "New Commit: $commitMsg" `
            -Body "A new commit has been made to the repository" `
            -EventType "Commit"
    }
    "2" {
        $branch = git branch --show-current 2>$null
        if (-not $branch) { $branch = Read-Host "Enter branch name" }
        .\send-notification.ps1 `
            -Subject "Code Pushed to $branch" `
            -Body "Latest changes have been pushed to remote repository" `
            -EventType "Push"
    }
    "3" {
        $branch = Read-Host "Enter branch that was merged"
        .\send-notification.ps1 `
            -Subject "Branch Merged: $branch" `
            -Body "$branch has been successfully merged" `
            -EventType "Merge"
    }
    "4" {
        $services = Read-Host "Enter number of services built (default: 17)"
        if (-not $services) { $services = "17" }
        .\send-notification.ps1 `
            -Subject "✅ Docker Build Successful" `
            -Body "All $services microservices have been built successfully without errors" `
            -EventType "Build"
    }
    "5" {
        $service = Read-Host "Enter service name that failed"
        $error = Read-Host "Enter error details"
        .\send-notification.ps1 `
            -Subject "❌ Docker Build Failed: $service" `
            -Body "Build failed in $service. Error: $error" `
            -EventType "Error"
    }
    "6" {
        $passed = Read-Host "Tests passed? (yes/no)"
        if ($passed -eq "yes") {
            .\send-notification.ps1 `
                -Subject "✅ All Tests Passed" `
                -Body "Test suite completed successfully. All tests passed" `
                -EventType "Build"
        } else {
            $details = Read-Host "Enter failure details"
            .\send-notification.ps1 `
                -Subject "❌ Tests Failed" `
                -Body "Some tests failed. Details: $details" `
                -EventType "Error"
        }
    }
    "7" {
        $subject = Read-Host "Enter email subject"
        $body = Read-Host "Enter email body"
        .\send-notification.ps1 `
            -Subject $subject `
            -Body $body `
            -EventType "general"
    }
    "8" {
        Write-Host "`n🧪 Testing email configuration..." -ForegroundColor Cyan
        .\send-notification.ps1 `
            -Subject "Test Email - Configuration Check" `
            -Body "If you received this email, your email notification system is configured correctly! 🎉" `
            -EventType "general"
    }
    "0" {
        Write-Host "👋 Goodbye!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
    }
}
