// Node.js script to generate bcrypt password hashes and create users
// Run: node generate-users.js

const bcrypt = require('bcryptjs');

// Function to hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

// Generate sample users
async function generateUsers() {
  const users = [
    {
      name: "Admin User",
      email: "admin@mallify.com",
      password: await hashPassword("admin123"),
      phone: "+1234567890",
      role: "admin",
      addresses: [],
      isEmailVerified: true,
      isActive: true,
    },
    {
      name: "John Doe",
      email: "client@mallify.com",
      password: await hashPassword("client123"),
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
    },
    {
      name: "Boutique Owner",
      email: "boutique@mallify.com",
      password: await hashPassword("boutique123"),
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
    },
    {
      name: "Delivery Manager",
      email: "delivery.manager@mallify.com",
      password: await hashPassword("delivery123"),
      phone: "+1234567893",
      role: "delivery_manager",
      addresses: [],
      isEmailVerified: true,
      isActive: true,
    },
    {
      name: "Delivery Person",
      email: "driver@mallify.com",
      password: await hashPassword("driver123"),
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
    },
    {
      name: "Boutiques Manager",
      email: "boutiques.manager@mallify.com",
      password: await hashPassword("manager123"),
      phone: "+1234567895",
      role: "boutiques_manager",
      addresses: [],
      isEmailVerified: true,
      isActive: true,
    }
  ];

  // Add timestamps
  const now = new Date();
  users.forEach(user => {
    user.createdAt = now;
    user.updatedAt = now;
  });

  return users;
}

// Generate and output MongoDB insert command
async function main() {
  console.log('Generating users with bcrypt hashed passwords...\n');
  
  const users = await generateUsers();
  
  console.log('Copy and paste this into MongoDB Compass Shell:\n');
  console.log('========================================\n');
  console.log('use mallify_users\n');
  console.log('db.users.insertMany(');
  console.log(JSON.stringify(users, null, 2));
  console.log(')\n');
  console.log('========================================\n');
  
  console.log('\nLogin Credentials:');
  console.log('==================');
  console.log('Admin:              admin@mallify.com / admin123');
  console.log('Client:             client@mallify.com / client123');
  console.log('Boutique Owner:     boutique@mallify.com / boutique123');
  console.log('Delivery Manager:   delivery.manager@mallify.com / delivery123');
  console.log('Delivery Person:    driver@mallify.com / driver123');
  console.log('Boutiques Manager:  boutiques.manager@mallify.com / manager123');
}

main().catch(console.error);
