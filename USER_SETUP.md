# Creating Sample Users

## Quick Method (Recommended)

### Step 1: Open MongoDB Compass
- Connect to: `mongodb://localhost:27017`
- Click the **mongosh** icon at the bottom (or press `Ctrl + \``)

### Step 2: Copy & Paste Script
- Open the file: `CREATE_USERS.js`
- Copy **ALL** the contents
- Paste into the mongosh shell in Compass
- Press **Enter**

### Step 3: Verify
The script will create 6 sample users and display their credentials.

---

## Login Credentials

| Role              | Email                           | Password     |
|-------------------|--------------------------------|--------------|
| Admin             | admin@mallify.com              | admin123     |
| Client            | client@mallify.com             | client123    |
| Boutique Owner    | boutique@mallify.com           | boutique123  |
| Delivery Manager  | delivery.manager@mallify.com   | delivery123  |
| Delivery Person   | driver@mallify.com             | driver123    |
| Boutiques Manager | boutiques.manager@mallify.com  | manager123   |

---

## User Roles Explained

### 1. **admin**
- Full system access
- Manage all users, boutiques, orders
- View analytics and reports

### 2. **client**
- Regular customer
- Browse products, place orders
- Manage addresses and wishlist

### 3. **boutique_owner**
- Manage their boutique
- Add/edit products
- Process orders

### 4. **delivery_manager**
- Oversee delivery operations
- Assign drivers to orders
- Monitor delivery performance

### 5. **delivery_person**
- Receive delivery assignments
- Update order status
- Navigate to customer locations

### 6. **boutiques_manager**
- Manage all boutiques
- Approve/reject boutique applications
- Monitor boutique performance

---

## Testing Login

1. Run services: `start-dev.cmd`
2. Open Manager Dashboard: http://localhost:3333
3. Login with any credentials above
4. Test the dashboard functionality

---

## Advanced: Custom Users

### Method 1: Using MongoDB Shell
```javascript
use mallify_users

db.users.insertOne({
  name: "Custom User",
  email: "custom@example.com",
  password: "$2a$10$yourBcryptHashHere",  // Use bcrypt to hash password
  phone: "+1234567899",
  role: "client",  // or admin, boutique_owner, etc.
  addresses: [],
  isEmailVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Method 2: Via API (After services running)
Use the registration endpoint through API Gateway:

```bash
POST http://localhost:4000/api/users/auth/register
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "client"
}
```

---

## Troubleshooting

### Users not showing in Compass?
1. Refresh the database list in Compass
2. Click on `mallify_users` database
3. Click on `users` collection

### Can't login with credentials?
1. Check services are running: `start-dev.cmd`
2. Verify API Gateway is on port 4000
3. Check MongoDB is running: Press **4** in MongoDB Manager tab
4. Verify users exist: Run `db.users.find()` in mongosh

### Need to reset users?
```javascript
use mallify_users
db.users.deleteMany({})  // Delete all users
// Then run CREATE_USERS.js again
```

---

## Security Notes

⚠️ **Important:**
- These are test credentials for development only
- Change default passwords in production
- Use strong passwords (12+ characters, mixed case, numbers, symbols)
- Enable 2FA for admin accounts in production
- Passwords are hashed using bcrypt (10 rounds)
