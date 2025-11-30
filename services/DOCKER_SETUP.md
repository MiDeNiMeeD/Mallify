# 🐳 Docker Installation Guide for Windows

## Problem

You're seeing the error: `docker-compose : The term 'docker-compose' is not recognized`

This means Docker is not installed on your system.

## Solution: Install Docker Desktop

### Step 1: Download Docker Desktop

1. Go to: **https://www.docker.com/products/docker-desktop**
2. Click **"Download for Windows"**
3. Wait for the installer to download (~500MB)

### Step 2: Install Docker Desktop

1. **Run the Installer**

   - Double-click `Docker Desktop Installer.exe`
   - Accept the license agreement
   - Click "OK" to use the default configuration

2. **Installation Options**

   - ✅ Use WSL 2 instead of Hyper-V (recommended)
   - ✅ Add shortcut to desktop

3. **Wait for Installation**

   - This takes 5-10 minutes
   - Don't close the installer window

4. **Restart Your Computer**
   - Docker requires a restart to complete installation

### Step 3: Start Docker Desktop

1. **Open Docker Desktop**

   - Look for the Docker icon in your system tray
   - If not running, search for "Docker Desktop" and open it

2. **Wait for Docker to Start**

   - First startup takes 2-3 minutes
   - You'll see "Docker Desktop is running" when ready

3. **Accept Terms** (first time only)
   - Docker may ask you to accept terms
   - Click "Accept"

### Step 4: Verify Installation

Open PowerShell and run:

```powershell
docker --version
docker compose version
```

You should see:

```
Docker version 24.x.x
Docker Compose version v2.x.x
```

### Step 5: Start Your Virtual Mall Platform

```powershell
cd "c:\Users\moham\OneDrive\Desktop\big project\micro-services"
docker compose up -d
```

This will:

- Download required images (~2GB total)
- Create 32 containers
- Start all services
- Takes 5-10 minutes on first run

### Step 6: Verify Everything is Running

```powershell
# Check all containers
docker compose ps

# Check API Gateway
curl http://localhost:3000/health
```

You should see all services as "Up" and the health check should return:

```json
{"status":"healthy","timestamp":"...","uptime":...}
```

## Common Issues & Solutions

### Issue 1: WSL 2 Update Required

**Error:** "WSL 2 installation is incomplete"

**Solution:**

1. Open PowerShell as Administrator
2. Run: `wsl --install`
3. Restart computer
4. Open Docker Desktop again

### Issue 2: Virtualization Not Enabled

**Error:** "Hardware assisted virtualization and data execution protection must be enabled in the BIOS"

**Solution:**

1. Restart computer
2. Enter BIOS (usually F2, F10, or Del during startup)
3. Find "Virtualization Technology" or "VT-x"
4. Enable it
5. Save and exit BIOS

### Issue 3: Not Enough Memory

**Error:** Containers keep restarting

**Solution:**

1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory to at least 4GB
4. Click "Apply & Restart"

### Issue 4: Port Already in Use

**Error:** "Port 3000 is already allocated"

**Solution:**

```powershell
# Find what's using the port
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process_id> /F

# Or change the port in docker-compose.yml
```

## Alternative: Run Without Docker (Not Recommended)

If you absolutely cannot use Docker, you'll need to manually install and run:

1. **MongoDB** (15 instances on different ports)

   - Download: https://www.mongodb.com/try/download/community
   - Very complex to set up 15 separate instances

2. **RabbitMQ**

   - Download: https://www.rabbitmq.com/download.html
   - Requires Erlang installation

3. **Redis**

   - Download: https://redis.io/download
   - Windows version from: https://github.com/microsoftarchive/redis

4. **Run Each Service Manually**
   ```powershell
   cd user-service
   npm install
   npm start
   ```
   - Repeat for all 16 services
   - Each in a separate terminal

**This is NOT recommended!** Docker makes this infinitely easier.

## Docker Desktop System Requirements

### Minimum Requirements:

- Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041 or higher)
- OR Windows 11 64-bit
- 4GB RAM (8GB recommended)
- Virtualization enabled in BIOS

### Check Your Windows Version:

```powershell
winver
```

If you're on Windows 10 Home, you'll need to upgrade to Pro or use WSL 2.

## Next Steps After Docker is Installed

1. ✅ Install Docker Desktop
2. ✅ Verify installation
3. ✅ Start services: `docker compose up -d`
4. 📖 Follow QUICKSTART.md for testing
5. 🔧 Start developing services

## Need Help?

If you encounter issues:

1. Check Docker Desktop logs (Settings → Troubleshoot → View logs)
2. Restart Docker Desktop
3. Restart your computer
4. Check Docker documentation: https://docs.docker.com/desktop/install/windows-install/

## Why Docker?

Docker provides:

- ✅ Easy setup (one command instead of 15+ installations)
- ✅ Consistent environment
- ✅ Isolated services
- ✅ Easy cleanup
- ✅ Production-like setup
- ✅ Faster development

Without Docker, you'd need to:

- ❌ Install 15 MongoDB instances manually
- ❌ Configure each service individually
- ❌ Manage 16+ terminal windows
- ❌ Deal with port conflicts
- ❌ Troubleshoot environment issues
- ❌ Spend hours on setup

---

**Docker Desktop is the recommended way to run this platform!**

Download now: https://www.docker.com/products/docker-desktop
