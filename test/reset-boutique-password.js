const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Configuration
const MONGODB_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const EMAIL = 'mohamedamine.midani200@gmail.com';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetPassword() {
  let client;
  
  try {
    console.log('\n========================================');
    console.log('BOUTIQUE OWNER PASSWORD RESET');
    console.log('========================================\n');
    console.log(`Resetting password for: ${EMAIL}\n`);

    // Get new password from user
    const newPassword = await new Promise((resolve) => {
      rl.question('Enter new password: ', (answer) => {
        resolve(answer);
      });
    });

    if (!newPassword || newPassword.length < 6) {
      console.error('\n❌ Password must be at least 6 characters long');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Hash the new password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hashed');

    // Update user credentials inside mallify database
    console.log('\n📝 Updating user account...');
    const usersCollection = client.db('mallify').collection('users');
    
    const userResult = await usersCollection.updateOne(
      { email: EMAIL.toLowerCase() },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    if (userResult.matchedCount > 0) {
      console.log('✅ User account password updated');
    } else {
      console.log('⚠️  User account not found in mallify database');
    }

    // Update in mallify database (BoutiqueApplications collection)
    console.log('\n📝 Updating boutique application...');
    const boutiqueDb = client.db('mallify');
    const applicationsCollection = boutiqueDb.collection('boutiqueapplications');
    
    const appResult = await applicationsCollection.updateOne(
      { email: EMAIL.toLowerCase() },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    if (appResult.matchedCount > 0) {
      console.log('✅ Boutique application password updated');
    } else {
      console.log('⚠️  Boutique application not found in mallify database');
    }

    // Display results
    console.log('\n========================================');
    console.log('PASSWORD RESET COMPLETE');
    console.log('========================================');
    console.log(`\n✅ Password successfully reset for: ${EMAIL}`);
    console.log(`\nYou can now login with:`);
    console.log(`   Email: ${EMAIL}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n⚠️  Important: Make sure your boutique application status is "approved"');
    console.log('   to be able to login to the store owner portal.\n');

    // Check application status
    const application = await applicationsCollection.findOne({ email: EMAIL.toLowerCase() });
    if (application) {
      console.log(`Current application status: ${application.status}`);
      if (application.status !== 'approved') {
        console.log('\n💡 To approve your application:');
        console.log('   1. Login to Manager Dashboard (http://192.168.56.1:3333)');
        console.log('   2. Go to Boutiques section');
        console.log('   3. Find your application and approve it');
        console.log('\n   Or run MongoDB command:');
        console.log(`   db.boutiqueapplications.updateOne({email: "${EMAIL}"}, {$set: {status: "approved"}})`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error resetting password:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n📡 Disconnected from MongoDB\n');
    }
    rl.close();
  }
}

// Run the script
resetPassword().catch(console.error);
