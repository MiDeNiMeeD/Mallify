# Email Notification System - Quick Setup Script

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Mallify Email Notification System - Setup Wizard     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if config already exists
if (Test-Path ".email-config.json") {
    Write-Host "✅ Email configuration already exists" -ForegroundColor Green
    $overwrite = Read-Host "Do you want to reconfigure? (yes/no)"
    if ($overwrite -ne "yes") {
        Write-Host "Setup cancelled. Your existing configuration is unchanged." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "📧 Let's set up your email notifications!" -ForegroundColor Yellow
Write-Host ""

# Step 1: Email Provider
Write-Host "Step 1: Select your email provider" -ForegroundColor Cyan
Write-Host "1. Gmail (smtp.gmail.com)" -ForegroundColor White
Write-Host "2. Outlook/Office365 (smtp.office365.com)" -ForegroundColor White
Write-Host "3. Yahoo (smtp.mail.yahoo.com)" -ForegroundColor White
Write-Host "4. Other (custom SMTP)" -ForegroundColor White
$provider = Read-Host "Enter choice (1-4)"

switch ($provider) {
    "1" { 
        $smtpHost = "smtp.gmail.com"
        $smtpPort = 587
        Write-Host "ℹ️  Gmail selected. Remember to use App Password!" -ForegroundColor Yellow
        Write-Host "   Get it here: https://myaccount.google.com/apppasswords" -ForegroundColor Gray
    }
    "2" { 
        $smtpHost = "smtp.office365.com"
        $smtpPort = 587
    }
    "3" { 
        $smtpHost = "smtp.mail.yahoo.com"
        $smtpPort = 587
    }
    "4" {
        $smtpHost = Read-Host "Enter SMTP host"
        $smtpPort = Read-Host "Enter SMTP port (typically 587 or 465)"
    }
    default {
        Write-Host "❌ Invalid choice. Using Gmail defaults." -ForegroundColor Red
        $smtpHost = "smtp.gmail.com"
        $smtpPort = 587
    }
}

# Step 2: Credentials
Write-Host "`nStep 2: Enter your email credentials" -ForegroundColor Cyan
$emailUser = Read-Host "Your email address"
$emailPassword = Read-Host "Your email password (or app password)" -AsSecureString
$emailPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($emailPassword)
)

# Step 3: Recipients
Write-Host "`nStep 3: Who should receive notifications?" -ForegroundColor Cyan
$recipients = @()
do {
    $recipient = Read-Host "Enter recipient email (or press Enter to finish)"
    if ($recipient) {
        $recipients += $recipient
        Write-Host "  ✓ Added: $recipient" -ForegroundColor Green
    }
} while ($recipient)

if ($recipients.Count -eq 0) {
    $recipients += $emailUser
    Write-Host "  Using sender as recipient: $emailUser" -ForegroundColor Yellow
}

# Step 4: Notification preferences
Write-Host "`nStep 4: Configure notification types" -ForegroundColor Cyan
Write-Host "Enable notifications for:" -ForegroundColor White

$notify = @{
    onCommit = (Read-Host "Commits? (yes/no)") -eq "yes"
    onPush = (Read-Host "Pushes? (yes/no)") -eq "yes"
    onPullRequest = (Read-Host "Pull Requests? (yes/no)") -eq "yes"
    onMerge = (Read-Host "Merges? (yes/no)") -eq "yes"
    onBuild = (Read-Host "Builds? (yes/no)") -eq "yes"
    onError = (Read-Host "Errors? (yes/no)") -eq "yes"
}

# Create configuration object
$config = @{
    smtp = @{
        host = $smtpHost
        port = [int]$smtpPort
        secure = $false
        auth = @{
            user = $emailUser
            password = $emailPasswordPlain
        }
    }
    from = @{
        name = "Mallify Project"
        email = $emailUser
    }
    to = $recipients
    notifications = $notify
}

# Save configuration
$configJson = $config | ConvertTo-Json -Depth 10
$configJson | Out-File -FilePath ".email-config.json" -Encoding UTF8

Write-Host "`n✅ Configuration saved successfully!" -ForegroundColor Green
Write-Host ""

# Test configuration
Write-Host "🧪 Would you like to send a test email now?" -ForegroundColor Cyan
$test = Read-Host "Send test email? (yes/no)"

if ($test -eq "yes") {
    Write-Host "`n📧 Sending test email..." -ForegroundColor Cyan
    try {
        .\send-notification.ps1 `
            -Subject "Test Email - Setup Complete" `
            -Body "Congratulations! Your email notification system is configured and working correctly. 🎉" `
            -EventType "general"
    } catch {
        Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Check your credentials and try again." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              Setup Complete! 🎉                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   • Run: .\notify.ps1 (for quick notifications)" -ForegroundColor White
Write-Host "   • Read: EMAIL_NOTIFICATION_SETUP.md (full documentation)" -ForegroundColor White
Write-Host "   • Test: .\send-notification.ps1 -Subject 'Test' -Body 'Hello' -EventType 'general'" -ForegroundColor White
Write-Host ""
Write-Host "🔒 Security reminder:" -ForegroundColor Red
Write-Host "   Your credentials are saved in .email-config.json" -ForegroundColor White
Write-Host "   This file is in .gitignore and won't be committed to git" -ForegroundColor White
Write-Host ""
