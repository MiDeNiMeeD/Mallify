# User Service

Authentication and user management service for Mallify platform.

## Features

- User registration with role-based accounts (Client, Boutique Owner, Delivery Person)
- Email/password authentication
- Google OAuth authentication
- JWT-based authentication with refresh tokens
- Email verification with OTP
- Password reset with OTP
- User profile management
- Address management
- Delivery person application management

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/send-verification-otp` - Send email verification OTP
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/forgot-password` - Send password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/change-password` - Change password (authenticated)

### User Management

- `GET /api/users/profile` - Get current user profile
- `GET /api/users/:userId` - Get user by ID (admin/managers only)
- `PUT /api/users/profile` - Update profile
- `POST /api/users/addresses` - Add address
- `PUT /api/users/addresses/:addressId` - Update address
- `DELETE /api/users/addresses/:addressId` - Delete address
- `POST /api/users/deactivate` - Deactivate account
- `PUT /api/users/:userId/application-status` - Update delivery person application

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Configure environment variables in `.env`

4. Run in development:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

See `.env.example` for all required variables.

## Testing

```bash
npm test
```
