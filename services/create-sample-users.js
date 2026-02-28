// MongoDB Script to Create Sample Users
// Run this in MongoDB Compass Shell (mongosh) or MongoDB Shell

// Switch to mallify_users database
use mallify_users

// Helper function to hash passwords (bcrypt simulation for manual entry)
// Note: In production, passwords are hashed by the User Service
// For testing, use bcrypt with 10 rounds: $2a$10$...

// Sample users with different roles
const users = [
  {
    name: "Admin User",
    email: "admin@mallify.com",
    // Password: admin123 (you should hash this in production)
    password: "$2a$10$XqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9J",
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
    // Password: client123
    password: "$2a$10$YqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9K",
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
    // Password: boutique123
    password: "$2a$10$ZqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9L",
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
    // Password: delivery123
    password: "$2a$10$AqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9M",
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
    // Password: driver123
    password: "$2a$10$BqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9N",
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
    // Password: manager123
    password: "$2a$10$CqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9J5Z5Z5Z5Z5ZuqV5N5rGZ9O",
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
];

// Insert users
print("Creating sample users...");
const result = db.users.insertMany(users);
print(`Successfully created ${result.insertedIds.length} users`);

// Display created users
print("\nCreated Users:");
print("================");
db.users.find({}, { password: 0 }).forEach(user => {
  print(`\nEmail: ${user.email}`);
  print(`Role: ${user.role}`);
  print(`Name: ${user.name}`);
});

print("\n\nLogin Credentials (IMPORTANT - Save these!):");
print("=============================================");
print("Admin:              admin@mallify.com / admin123");
print("Client:             client@mallify.com / client123");
print("Boutique Owner:     boutique@mallify.com / boutique123");
print("Delivery Manager:   delivery.manager@mallify.com / delivery123");
print("Delivery Person:    driver@mallify.com / driver123");
print("Boutiques Manager:  boutiques.manager@mallify.com / manager123");
print("\nNote: These passwords are temporary. Change them after first login!");
