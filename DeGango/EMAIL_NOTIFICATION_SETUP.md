# Email Notification System Setup

Automated email notifications for Mallify project events (commits, pushes, merges, builds).

## 🔧 Quick Setup

### Step 1: Create Your Email Configuration

Copy the template and fill in your details:

```powershell
Copy-Item .email-config.template.json .email-config.json
```

Then edit `.email-config.json` with your actual credentials:

```json
{
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "your-actual-email@gmail.com",
      "password": "your-app-specific-password"
    }
  },
  "from": {
    "name": "Mallify Project",
    "email": "your-actual-email@gmail.com"
  },
  "to": [
    "recipient1@example.com",
    "recipient2@example.com"
  ],
  "notifications": {
    "onCommit": true,
    "onPush": true,
    "onPullRequest": true,
    "onMerge": true,
    "onBuild": true,
    "onError": true
  }
}
```

### Step 2: Enable Gmail App Password (If using Gmail)

1. Go to Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification (must be enabled)
3. App Passwords → Generate new password
4. Use this password in `.email-config.json`

### Step 3: Test Email Notifications

```powershell
# Test basic notification
.\send-notification.ps1 -Subject "Test Email" -Body "Testing email system" -EventType "general"

# Test commit notification
.\send-notification.ps1 -Subject "Test Commit" -Body "This is a test commit notification" -EventType "Commit"
```

## 📧 Manual Usage

### Send Notification Manually

```powershell
.\send-notification.ps1 `
    -Subject "Your Subject" `
    -Body "Your message here" `
    -EventType "Commit"  # or "Push", "Merge", "Build", "Error"
```

### Example: Build Success Notification

```powershell
.\send-notification.ps1 `
    -Subject "Docker Build Successful" `
    -Body "All 17 microservices built successfully" `
    -EventType "Build"
```

### Example: Error Notification

```powershell
.\send-notification.ps1 `
    -Subject "Build Failed" `
    -Body "Error in user-service Docker build" `
    -EventType "Error"
```

## 🪝 Automatic Git Hooks

Git hooks are already created in `.git/hooks/`:

- **post-commit.ps1** - Sends email after each commit
- **post-push.ps1** - Sends email after pushing to remote

### Enable Git Hooks (Windows)

Create wrapper scripts for PowerShell hooks:

```powershell
# In .git/hooks/post-commit (no extension)
#!/bin/sh
powershell.exe -ExecutionPolicy Bypass -File .git/hooks/post-commit.ps1
```

```powershell
# In .git/hooks/post-push (no extension)
#!/bin/sh
powershell.exe -ExecutionPolicy Bypass -File .git/hooks/post-push.ps1 "$@"
```

Then make them executable:
```powershell
git config core.hooksPath .git/hooks
```

## 🎯 Notification Types

| Event Type | When Triggered | Example Use |
|------------|---------------|-------------|
| `Commit` | After git commit | "New commit: feat: Add user auth" |
| `Push` | After git push | "Code pushed to origin/main" |
| `Merge` | After branch merge | "Merged feature-branch into main" |
| `Build` | Docker build complete | "All services built successfully" |
| `Error` | Build/test failure | "Test failed in payment-service" |
| `general` | Manual notification | Custom messages |

## 📝 Integration Examples

### Docker Build Notification

```powershell
# After building services
docker-compose build
if ($LASTEXITCODE -eq 0) {
    .\send-notification.ps1 `
        -Subject "Docker Build Complete" `
        -Body "All microservices built successfully" `
        -EventType "Build"
} else {
    .\send-notification.ps1 `
        -Subject "Docker Build Failed" `
        -Body "Build failed with exit code $LASTEXITCODE" `
        -EventType "Error"
}
```

### CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/notify.yml
name: Email Notifications
on: [push, pull_request]

jobs:
  notify:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - name: Send Notification
        shell: powershell
        run: |
          .\send-notification.ps1 `
            -Subject "GitHub Action: ${{ github.event_name }}" `
            -Body "Action completed on ${{ github.ref }}" `
            -EventType "Build"
```

## 🔒 Security

- ✅ `.email-config.json` is in `.gitignore` (credentials never committed)
- ✅ Use app-specific passwords (not your main password)
- ✅ Template file (`.email-config.template.json`) can be committed safely
- ⚠️ Never commit actual credentials

## 🎨 Email Format

Emails include:
- Custom subject with event type prefix
- Your custom message body
- Automatic git information:
  - Current branch
  - Latest commit
  - Commit author
  - Timestamp
- Professional formatting

## ⚙️ Configuration Options

### SMTP Providers

**Gmail:**
```json
"smtp": {
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false
}
```

**Outlook/Office 365:**
```json
"smtp": {
  "host": "smtp.office365.com",
  "port": 587,
  "secure": false
}
```

**Yahoo:**
```json
"smtp": {
  "host": "smtp.mail.yahoo.com",
  "port": 587,
  "secure": false
}
```

### Enable/Disable Notifications

Edit `.email-config.json`:
```json
"notifications": {
  "onCommit": false,    // Disable commit notifications
  "onPush": true,       // Keep push notifications
  "onBuild": true,
  "onError": true
}
```

## 🧪 Troubleshooting

### "Email config not found"
- Run: `Copy-Item .email-config.template.json .email-config.json`
- Fill in your credentials

### "Authentication failed"
- Check username/password
- Use app-specific password (not your main password)
- Enable "Less secure app access" (Gmail) or use OAuth

### "Unable to connect to SMTP server"
- Check SMTP host and port
- Verify firewall/antivirus isn't blocking
- Try port 465 (SSL) or 587 (TLS)

### Emails not sending
- Test manually first: `.\send-notification.ps1 -Subject "Test" -Body "Test" -EventType "general"`
- Check spam folder
- Verify recipient email addresses

## 📞 Support

For issues or questions:
1. Check your email provider's SMTP documentation
2. Verify credentials in `.email-config.json`
3. Test with manual command first
4. Check PowerShell execution policy: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass`

## 🎯 Next Steps

1. ✅ Copy template to `.email-config.json`
2. ✅ Fill in your email credentials
3. ✅ Test with: `.\send-notification.ps1 -Subject "Test" -Body "Hello" -EventType "general"`
4. ✅ Enable git hooks if desired
5. ✅ Integrate into your workflow

Happy coding! 🚀
