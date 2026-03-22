const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuration
const MONGODB_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const EMAIL = 'mohamedamine.midani200@gmail.com';
const PASSWORD = 'boutique123';

async function createBoutiqueUser() {
  let client;
  
  try {
    console.log('\n========================================');
    console.log('CREATE BOUTIQUE OWNER USER ACCOUNT');
    console.log('========================================\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Get boutique application data
    const mallifyDb = client.db('mallify');
    const applicationsCollection = mallifyDb.collection('boutiqueapplications');
    
    const application = await applicationsCollection.findOne({ email: EMAIL.toLowerCase() });
    
    if (!application) {
      console.error('❌ Boutique application not found');
      process.exit(1);
    }

    console.log(`✅ Found boutique application for: ${application.boutiqueName}`);

    // Hash the password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // Create user in mallify database
    console.log('\n📝 Creating user account...');
    const usersCollection = mallifyDb.collection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: EMAIL.toLowerCase() });
    
    if (existingUser) {
      console.log('⚠️  User already exists, updating password...');
      await usersCollection.updateOne(
        { email: EMAIL.toLowerCase() },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date()
          } 
        }
      );
      console.log('✅ User password updated');
    } else {
      const newUser = {
        name: application.ownerName,
        email: EMAIL.toLowerCase(),
        password: hashedPassword,
        phone: application.phone,
        role: 'boutique_owner',
        addresses: [{
          street: application.address,
          city: application.city,
          state: '',
          zipCode: '',
          country: 'Tunisia',
          isDefault: true
        }],
        isEmailVerified: true,
        isActive: true,
        profileImage: null,
        googleId: null,
        boutiqueList: [],
        subscriptionStatus: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await usersCollection.insertOne(newUser);
      console.log('✅ User account created');
    }

    console.log('\n========================================');
    console.log('SETUP COMPLETE');
    console.log('========================================');
    console.log(`\n✅ You can now login at: http://192.168.56.1:3335/StoreOwner-SignIn`);
    console.log(`\nCredentials:`);
    console.log(`   Email: ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log(`   Application Status: ${application.status}\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('📡 Disconnected from MongoDB\n');
    }
  }
}

// Run the script
createBoutiqueUser().catch(console.error);
