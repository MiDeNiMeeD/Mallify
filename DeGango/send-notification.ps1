# Mallify Email Notification System
# Sends email notifications for git and build events

param(
    [string]$Subject = "Mallify Project Notification",
    [string]$Body = "No message provided",
    [string]$EventType = "general"
)

# Load email configuration
$configPath = Join-Path $PSScriptRoot ".email-config.json"

if (-Not (Test-Path $configPath)) {
    Write-Host "Error: Email config not found: $configPath" -ForegroundColor Red
    Write-Host "Please copy .email-config.template.json to .email-config.json and fill in your details" -ForegroundColor Yellow
    exit 1
}

try {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    
    # Check if notifications are enabled for this event type
    if ($config.notifications.PSObject.Properties[$EventType]) {
        if (-Not $config.notifications.$EventType) {
            Write-Host "Notifications disabled for: $EventType" -ForegroundColor Cyan
            exit 0
        }
    }

    # Get git information
    $gitBranch = git branch --show-current 2>$null
    $gitCommit = git log -1 --pretty=format:"%h - %s" 2>$null
    $gitAuthor = git log -1 --pretty=format:"%an" 2>$null
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    # Build enhanced email body
    $emailBody = @"
$Body

========================================
Project Information
========================================

Project: Mallify Virtual Mall
Date: $timestamp
Event: $EventType
Branch: $gitBranch
Latest Commit: $gitCommit
Author: $gitAuthor

========================================

This is an automated notification from the Mallify project.
"@

    # Prepare email parameters
    $emailParams = @{
        SmtpServer = $config.smtp.server
        Port = $config.smtp.port
        From = "$($config.from.name) <$($config.from.email)>"
        To = $config.to
        Subject = "[$EventType] $Subject"
        Body = $emailBody
        BodyAsHtml = $false
        Encoding = 'UTF8'
    }

    # Add authentication
    if ($config.smtp.username -and $config.smtp.password) {
        $securePassword = ConvertTo-SecureString $config.smtp.password -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($config.smtp.username, $securePassword)
        $emailParams['Credential'] = $credential
    }

    # Add SSL if needed
    if ($config.smtp.ssl -or $config.smtp.port -eq 587 -or $config.smtp.port -eq 465) {
        $emailParams['UseSsl'] = $true
    }

    # Send email
    Write-Host "Sending email notification..." -ForegroundColor Cyan
    Send-MailMessage @emailParams
    Write-Host "Email sent successfully!" -ForegroundColor Green
    Write-Host "   To: $($config.to -join ', ')" -ForegroundColor Gray
    Write-Host "   Subject: [$EventType] $Subject" -ForegroundColor Gray

} catch {
    Write-Host "Failed to send email: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.InnerException) {
        Write-Host "   Error Details: $($_.Exception.InnerException.Message)" -ForegroundColor Red
    }
    exit 1
}
