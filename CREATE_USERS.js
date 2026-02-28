// ========================================
// CREATE SAMPLE USERS FOR MALLIFY
// ========================================
// 
// INSTRUCTIONS:
// 1. Open MongoDB Compass
// 2. Connect to: mongodb://localhost:27017
// 3. Click "mongosh" at the bottom (or press Ctrl+`)
// 4. Copy ALL lines below and paste into mongosh
// 5. Press Enter to execute
//
// ========================================

use mallify_users

db.users.insertMany([
  {
    name: "Admin User",
    email: "admin@mallify.com",
    password: "$2a$10$KfJ5/JzIakbNFnwfCWn5ieLuwNTkLHiq3aHlexDPq/9L.2KvDj0Ya",
    phone: "+1234567890",
    role: "admin",
    addresses: [],
    isEmailVerified: true,
    isActive: true,
    profileImage: null,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "John Doe",
    email: "client@mallify.com",
    password: "$2a$10$zD4JP6PMdpHc/T0JVuBbBeeRfBTpQUbYeCQTOtqasiNxA2S4/1IeG",
    phone: "+1234567891",
    role: "client",
    addresses: [
      {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        isDefault: true
      }
    ],
    isEmailVerified: true,
    isActive: true,
    profileImage: null,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Boutique Owner",
    email: "boutique@mallify.com",
    password: "$2a$10$ePlWGTWV5kBkA8XONUC5pesf.3YdhoZO5D71uqOTb1O/kWr5v3HNu",
    phone: "+1234567892",
    role: "boutique_owner",
    addresses: [
      {
        street: "456 Fashion Ave",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90001",
        country: "USA",
        isDefault: true
      }
    ],
    isEmailVerified: true,
    isActive: true,
    profileImage: null,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Delivery Manager",
    email: "delivery.manager@mallify.com",
    password: "$2a$10$IL.zPxqQTxAl5j8QEegex.6HaG35pVc6Z9p5hJ2HwEV21YHcuJZ9G",
    phone: "+1234567893",
    role: "delivery_manager",
    addresses: [],
    isEmailVerified: true,
    isActive: true,
    profileImage: null,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Delivery Person",
    email: "driver@mallify.com",
    password: "$2a$10$I9SWEohFdyJfAF5PxsMDseymvsZPctbAGiXssnmnZm922dQeliMze",
    phone: "+1234567894",
    role: "delivery_person",
    addresses: [
      {
        street: "789 Delivery Rd",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
        isDefault: true
      }
    ],
    isEmailVerified: true,
    isActive: true,
    profileImage: null,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Boutiques Manager",
    email: "boutiques.manager@mallify.com",
    password: "$2a$10$f5Zam8bdVBAtwWC.uK3Qz.Msy1qHjxJHbbuw1BHAcXw/3TJJWZdD2",
    phone: "+1234567895",
    role: "boutiques_manager",
    addresses: [],
    isEmailVerified: true,
    isActive: true,
    profileImage: null,
    googleId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// ========================================
// VERIFY USERS WERE CREATED
// ========================================

print("\n✅ Users created successfully!\n");
print("Login Credentials:");
print("==========================================");
print("Role                Email                              Password");
print("==========================================");
print("Admin               admin@mallify.com                  admin123");
print("Client              client@mallify.com                 client123");
print("Boutique Owner      boutique@mallify.com               boutique123");
print("Delivery Manager    delivery.manager@mallify.com       delivery123");
print("Delivery Person     driver@mallify.com                 driver123");
print("Boutiques Manager   boutiques.manager@mallify.com      manager123");
print("==========================================\n");

// Show created users (without passwords)
db.users.find({}, { password: 0 }).pretty()
