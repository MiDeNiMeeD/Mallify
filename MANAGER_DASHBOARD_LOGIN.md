# Manager Dashboard Login

## Access URL
http://localhost:3333

## Access Restriction
**Only users with the `boutiques_manager` role can log in to this dashboard.**

## Valid Login Credentials

### ✅ Boutiques Manager (AUTHORIZED)
- **Email:** boutiques.manager@mallify.com
- **Password:** manager123
- **Role:** boutiques_manager
- **Status:** ✅ Can access Manager Dashboard

---

## Invalid Login Attempts (Will be rejected)

### ❌ Admin User
- **Email:** admin@mallify.com
- **Password:** admin123
- **Role:** admin
- **Error:** "Access denied. Only Boutiques Managers can access this dashboard."

### ❌ Client
- **Email:** client@mallify.com
- **Password:** client123
- **Role:** client
- **Error:** "Access denied. Only Boutiques Managers can access this dashboard."

### ❌ Boutique Owner
- **Email:** boutique@mallify.com
- **Password:** boutique123
- **Role:** boutique_owner
- **Error:** "Access denied. Only Boutiques Managers can access this dashboard."

### ❌ Delivery Manager
- **Email:** delivery.manager@mallify.com
- **Password:** delivery123
- **Role:** delivery_manager
- **Error:** "Access denied. Only Boutiques Managers can access this dashboard."

### ❌ Delivery Person
- **Email:** driver@mallify.com
- **Password:** driver123
- **Role:** delivery_person
- **Error:** "Access denied. Only Boutiques Managers can access this dashboard."

---

## Security Features

### 1. Login Validation
- Email and password are validated through API Gateway
- User role is checked after successful authentication
- Only `boutiques_manager` role is allowed to proceed

### 2. Session Protection
- On page load, stored user credentials are validated
- If user role is not `boutiques_manager`, they are automatically logged out
- Prevents unauthorized access even if tokens are manually set

### 3. Error Messages
- Clear, user-friendly error message for wrong role
- Standard error message for invalid credentials
- Toast notifications for all authentication events

---

## Testing Steps

1. **Start Services**
   ```cmd
   start-dev.cmd
   ```

2. **Open Manager Dashboard**
   ```
   http://localhost:3333
   ```

3. **Test Valid Login (Should work)**
   - Email: `boutiques.manager@mallify.com`
   - Password: `manager123`
   - Expected: Login successful, redirect to dashboard

4. **Test Invalid Role (Should fail)**
   - Email: `admin@mallify.com` (or any other role)
   - Password: `admin123`
   - Expected: Red toast message "Access denied. Only Boutiques Managers can access this dashboard."

---

## Implementation Details

### Modified Files

1. **src/context/AuthContext.js**
   - Added role check in `login()` function
   - Added role validation on component mount
   - Clears invalid user data if role doesn't match

2. **src/pages/LoginPage2.jsx**
   - Added visual indicator: "🔒 Boutiques Manager Access Only"
   - Toast notifications already implemented for errors

### Code Changes

```javascript
// In login function
if (response.data.user.role !== 'boutiques_manager') {
  return { 
    success: false, 
    message: 'Access denied. Only Boutiques Managers can access this dashboard.' 
  };
}

// On mount validation
if (parsedUser.role === 'boutiques_manager') {
  setUser(parsedUser);
  setIsAuthenticated(true);
} else {
  // Clear invalid user data
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
```

---

## Troubleshooting

### "Cannot connect to API"
- Check if User Service is running on port 3001
- Check if API Gateway is running on port 4000
- Restart services: Close Windows Terminal and run `start-dev.cmd`

### "Invalid email or password"
- Verify MongoDB has users (run `run-create-users.cmd` if needed)
- Check MongoDB Compass at `mongodb://localhost:27017`
- Database: `mallify_users`, Collection: `users`

### "Access denied" for boutiques.manager@mallify.com
- This should not happen - contact developer
- Verify user role in MongoDB: should be exactly `boutiques_manager`
- Check browser console for errors

### Already logged in as different role
- Clear browser localStorage: F12 → Application → Local Storage → Clear
- Or use Incognito/Private mode

---

## Future Enhancements

- [ ] Add JWT token validation with role claims
- [ ] Add 2FA for manager accounts
- [ ] Add session timeout (auto-logout after inactivity)
- [ ] Add IP whitelist for manager access
- [ ] Add audit log for all login attempts
- [ ] Add password reset flow for managers
