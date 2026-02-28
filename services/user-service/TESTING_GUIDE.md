# User Service - Testing Guide

## Prerequisites

1. **Docker Desktop** installed and running
2. **Node.js 18+** installed
3. **npm** or **yarn** package manager

## Setup Instructions

### 1. Start Infrastructure Services

From the `services` directory:

```powershell
# Start MongoDB, Redis, and RabbitMQ
docker-compose up -d

# Verify services are running
docker-compose ps
```

You should see:
- MongoDB on port 27017
- Redis on port 6379
- RabbitMQ on ports 5672 (AMQP) and 15672 (Management UI)

### 2. Build Shared Package

```powershell
# Navigate to shared directory
cd services/shared

# Install dependencies
npm install

# Build the shared package
npm run build

# Return to services root
cd ..
```

### 3. Configure User Service

```powershell
# Navigate to user-service
cd user-service

# Copy environment template
cp .env.example .env

# Edit .env file with your settings
```

**Required `.env` variables:**
```env
NODE_ENV=development
PORT=3001

# MongoDB
MONGODB_URI=mongodb://mallify_user:mallify_pass@localhost:27017/mallify_users?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=mallify_redis_pass

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# Email (configure with your SMTP provider)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@mallify.com

# Google OAuth (optional for testing)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Other
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

### 4. Install Dependencies and Start Service

```powershell
# Install user-service dependencies
npm install

# Start in development mode (with hot reload)
npm run dev
```

The service will start on http://localhost:3001

## Testing Endpoints

### Health Check

```powershell
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "user-service",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 1. Register a New Client

```powershell
curl -X POST http://localhost:3001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "phone": "+1234567890",
    "role": "client"
  }'
```

Expected response (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client",
      "isEmailVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    },
    "message": "Registration successful. Please verify your email."
  }
}
```

### 2. Login

```powershell
curl -X POST http://localhost:3001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### 3. Get User Profile

```powershell
# Replace YOUR_ACCESS_TOKEN with the token from login/register response
curl http://localhost:3001/api/users/profile `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Send Email Verification OTP

```powershell
curl -X POST http://localhost:3001/api/auth/send-verification-otp `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john@example.com"
  }'
```

### 5. Verify Email

```powershell
curl -X POST http://localhost:3001/api/auth/verify-email `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john@example.com",
    "code": "123456"
  }'
```

### 6. Update Profile

```powershell
curl -X PUT http://localhost:3001/api/users/profile `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "John Updated",
    "phone": "+9876543210"
  }'
```

### 7. Add Address

```powershell
curl -X POST http://localhost:3001/api/users/addresses `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "isDefault": true
  }'
```

### 8. Forgot Password

```powershell
curl -X POST http://localhost:3001/api/auth/forgot-password `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john@example.com"
  }'
```

### 9. Reset Password

```powershell
curl -X POST http://localhost:3001/api/auth/reset-password `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john@example.com",
    "code": "123456",
    "newPassword": "NewPassword123"
  }'
```

### 10. Refresh Access Token

```powershell
curl -X POST http://localhost:3001/api/auth/refresh-token `
  -H "Content-Type: application/json" `
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Using Postman

Import the collection from `services/Virtual-Mall-API.postman_collection.json` for easier testing.

## Google OAuth Testing

1. Visit http://localhost:3001/api/auth/google in your browser
2. Authorize with your Google account
3. You'll be redirected to the callback URL with user data and tokens

## Monitoring

### MongoDB Express UI
- URL: http://localhost:8081
- Username: admin
- Password: pass

### RabbitMQ Management UI
- URL: http://localhost:15672
- Username: mallify
- Password: mallify_pass

### Redis CLI

```powershell
docker exec -it services-redis-1 redis-cli
AUTH mallify_redis_pass
KEYS *
```

## Common Issues

### 1. "Cannot find module '@mallify/shared'"

**Solution:** Build the shared package first:
```powershell
cd services/shared
npm install
npm run build
```

### 2. "Cannot connect to MongoDB"

**Solution:** Ensure Docker is running and MongoDB container is up:
```powershell
docker-compose up -d mongodb
docker-compose logs mongodb
```

### 3. "Email sending failed"

**Solution:** Configure valid SMTP credentials in `.env`. For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in EMAIL_PASSWORD

### 4. Port already in use

**Solution:** Change the PORT in `.env` or stop the conflicting service:
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

## Development Workflow

1. **Watch mode for shared package:**
   ```powershell
   cd services/shared
   npm run dev
   ```

2. **Watch mode for user-service:**
   ```powershell
   cd services/user-service
   npm run dev
   ```

3. **View logs:**
   ```powershell
   # All Docker services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f mongodb
   ```

## Next Steps

After successfully testing user-service:
1. Implement API Gateway (Phase 1.3)
2. Add RabbitMQ event publishing for user events
3. Implement additional microservices (product, order, etc.)
4. Add comprehensive unit and integration tests

## Support

For issues or questions, refer to:
- Main README: `services/README.md`
- Project Documentation: `PROJECT_SUMMARY.md`
- Implementation Plan: `IMPLEMENTATION_PLAN.md`
