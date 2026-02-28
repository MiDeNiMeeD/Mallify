// Register Managers Script
// Run this with: node register-managers.js

const API_BASE = 'http://localhost:4000';

async function registerManager(userData) {
  try {
    console.log(`Attempting to register: ${userData.name}...`);
    
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${userData.name} registered successfully!`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Role: ${userData.role}`);
      console.log('');
      return data;
    } else {
      console.error(`❌ Failed to register ${userData.name}:`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Message:`, data.message || data);
      console.error('');
      return null;
    }
  } catch (error) {
    console.error(`❌ Error registering ${userData.name}:`);
    console.error(`   Error:`, error.message);
    console.error(`   Make sure user-service is running on port 4000!`);
    console.error('');
    return null;
  }
}

async function createManagers() {
  console.log('🚀 Creating Manager Accounts...\n');

  // 1. Boutiques Manager (using boutique_owner role)
  await registerManager({
    name: "Boutiques Manager",
    email: "boutiques@mallify.com",
    password: "Boutiques123",
    role: "boutique_owner"
  });

  // 2. Delivery Manager (using delivery_person role for now)
  await registerManager({
    name: "Delivery Manager",
    email: "delivery@mallify.com",
    password: "Delivery123",
    role: "delivery_person"
  });

  console.log('✨ Done! You can now login with:');
  console.log('');
  console.log('📦 Boutiques Manager:');
  console.log('   Email: boutiques@mallify.com');
  console.log('   Password: Boutiques123');
  console.log('   Role: boutique_owner');
  console.log('');
  console.log('🚚 Delivery Manager:');
  console.log('   Email: delivery@mallify.com');
  console.log('   Password: Delivery123');
  console.log('   Role: delivery_person');
}

// Run the script
createManagers().catch(console.error);
