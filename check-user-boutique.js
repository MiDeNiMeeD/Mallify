const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const DB_NAME = 'mallify';
const USER_EMAIL = 'mohamedamine.midani200@gmail.com';

async function checkUserData() {
  let client;
  
  try {
    client = await MongoClient.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
   // Find user by email
    const user = await usersCollection.findOne({ email: USER_EMAIL });
    
    if (!user) {
      console.log('❌ User not found with email:', USER_EMAIL);
      return;
    }
    
    console.log('✅ User found!');
    console.log('📊 User Details:');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Boutique List:', user.boutiqueList || 'MISSING ❌');
    console.log('   Approved:', user.isApproved);
    console.log('\n📦 Full User Object:', JSON.stringify(user, null, 2));
    
    // Check if boutiqueList exists and has boutique ID
    if (!user.boutiqueList || user.boutiqueList.length === 0) {
      console.log('\n⚠️  PROBLEM FOUND: User does not have boutiqueList!');
      console.log('   The user needs to have the boutique ID in boutiqueList array');
    } else {
      console.log('\n✅ User has boutique ID:', user.boutiqueList[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

checkUserData();
