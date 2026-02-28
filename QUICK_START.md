# Quick Start Scripts

## Overview
These batch files help you quickly start and stop all services and frontend applications in **Windows Terminal with colored tabs** - no more 20+ separate windows!

## Files

### `fix-mongodb.cmd` ⚡ Run this first!
Fixes MongoDB authentication issues by:
1. Stopping all Node.js processes
2. Removing and recreating MongoDB container without authentication  
3. Updating all .env files to match

**Usage:**
```cmd
fix-mongodb.cmd
```

### `start-all.cmd` (Full Production Mode)
Starts all 16 microservices and 3 frontends in **one Windows Terminal window with colored tabs**.

**Features:**
- ✅ Kills all Node.js processes first (clean start)
- ✅ Opens in Windows Terminal with 19 colored tabs
- ✅ Each service has a unique color for easy identification
- ✅ User Service (Blue), API Gateway (Red), Boutique (Purple), Product (Orange), etc.

**Usage:**
```cmd
start-all.cmd
```

### `start-dev.cmd` (Development Mode) ⭐ Recommended for Development
Starts only essential services (5) and frontends (2) in **Windows Terminal with colored tabs**.

**First tab: MongoDB Manager** 🟢
Interactive menu for managing MongoDB:
1. Start/Stop/Restart MongoDB
2. Show container status and logs
3. Show databases and statistics
4. Connect to MongoDB shell
5. View container stats
6. **MongoDB Compass Connection** - Get connection string for MongoDB Compass

**Connection String:** `mongodb://localhost:27017`

**Services included:**
- User Service (Port 3001) - Authentication
- API Gateway (Port 4000) - Request routing
- Boutique Service - Store management
- Product Service - Product catalog
- Order Service - Order processing

**Frontends:**
- Home Frontend (Port 5174) - Vite app
- Manager Dashboard (Port 3333) - React app

**Usage:**
```cmd
start-dev.cmd
```

**Benefits:**
- Faster startup time
- Lower CPU/RAM usage  
- Easier debugging with fewer tabs
- Perfect for frontend development

### `stop-all.cmd`
Stops all running Node.js processes (services and frontends).
- Kills all node.exe processes
- Waits and retries if any processes remain
- Verifies all processes are stopped

**Usage:**
```cmd
stop-all.cmd
```

### `kill-port.cmd` 
Kills a specific process using a port (useful for stubborn processes).

**Usage:**
```cmd
kill-port.cmd 4000
```

**Common ports:**
- 4000 - API Gateway
- 3001 - User Service
- 5174 - Home Frontend  
- 3333 - Manager Dashboard
- 3000 - Store Frontend

### `mongo-manager.cmd` 🟢 MongoDB Management Console
Interactive menu for managing your MongoDB container.

**Features:**
1. Start MongoDB
2. Stop MongoDB
3. Restart MongoDB
4. Show MongoDB Status
5. Show Container Logs
6. Show Databases (with sizes)
7. Connect to MongoDB Shell
8. Remove MongoDB Container
9. View MongoDB Stats (CPU, Memory)

**Usage:**
```cmd
mongo-manager.cmd
```

**Note:** This opens automatically as the first tab when you run `start-dev.cmd` or `start-all.cmd`

## Prerequisites

Before running `start-all.cmd`, ensure:

1. **Docker Desktop is running** (for MongoDB)
2. **All dependencies are installed** in each service and frontend:
   ```cmd
   cd services\user-service
   npm install
   ```
   (Repeat for all services and frontends)

3. **Environment variables are configured** (`.env` files in each service)

**Note:** Services run in development mode using `npm run dev` which uses `ts-node` and `nodemon` to run TypeScript directly. No build or compilation step is required!

## Notes

**Requirements:**
- **Windows Terminal** is required for colored tabs feature
- If you don't have it, install from Microsoft Store (free)
- Or download from: https://aka.ms/terminal

**Features:**
- All services open in **one Windows Terminal window with multiple tabs**
- Each tab has a unique color and name for easy identification
- Automatically kills existing Node processes before starting (clean slate)
- MongoDB container name: `mallify-mongodb`

**Color Scheme:**
- Blue/Red: Core services (User, API Gateway)
- Purple/Orange: Business services (Boutique, Product, Order)
- Green shades: Logistics (Payment, Delivery, Driver)
- Yellow: Communication (Notification, Chat)
- Pink: Social (Review, Wishlist)
- Gray/Dark: Analytics & Monitoring

## Troubleshooting

**Port conflicts:**
- **"EADDRINUSE" error (port already in use):**
  1. Run `stop-all.cmd` to kill all Node processes
  2. Wait 3-5 seconds, then try again
  3. If still failing, use: `kill-port.cmd 4000` (replace 4000 with your port)
  4. Check what's using the port: `netstat -ano | findstr :4000`
- Kill specific process: `taskkill /F /PID <process_id>`

**Services not starting:**
- Check if all `node_modules` are installed
- Verify `.env` files exist
- Check MongoDB is running: `docker ps`

**"Cannot find module dist/index.js" error:**
- This is already fixed! Services now use `npm run dev` which runs TypeScript directly
- No need to build the TypeScript code first

**"Authentication failed" MongoDB error:**
- Run `fix-mongodb.cmd` to remove authentication and restart MongoDB
- This updates all .env files to use MongoDB without authentication (fine for local development)
- After running fix-mongodb.cmd, run `start-dev.cmd` again

**TypeScript compilation errors in boutique-service:**
- Fixed! The getAllApplications function had malformed code
- Nodemon will auto-restart the service once you save any file

**High CPU usage:**
- Close unused service windows
- Use Docker Compose instead for better resource management

## Alternative: Docker Compose

For a more efficient approach, consider using Docker Compose:
```cmd
cd services
docker-compose up
```

## Access Points

**Windows Terminal Tabs:**
- **Tab 1: MongoDB Manager** 🟢 - Interactive MongoDB management console

**Web Applications:**
- **Home (Vite):** http://localhost:5174
- **Manager Dashboard (React):** http://localhost:3333
- **Store Frontend (React):** http://localhost:3000

**API Services:**
- **API Gateway:** http://localhost:4000
- **User Service:** http://localhost:3001
- **MongoDB:** mongodb://localhost:27017

## Manager Login

- **Boutiques Manager:** boutiques@mallify.com / Boutiques123
- **Delivery Manager:** delivery@mallify.com / Delivery123
