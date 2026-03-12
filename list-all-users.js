const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const DB_NAME = 'mallify';

async function listAllUsers() {
  let client;
  
  try {
    client = await MongoClient.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    // Find all users
    const users = await usersCollection.find({}).toArray();
    
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No Name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Boutique List: ${user.boutiqueList || 'None'}`);
      console.log(`   Approved: ${user.isApproved || false}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

listAllUsers();
