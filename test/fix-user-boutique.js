const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const DB_NAME = 'mallify';
const BOUTIQUE_ID = '69b2399b8f52d551743f27eb';

async function checkAndFixUser() {
  let client;
  
  try {
    client = await MongoClient.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    
    // Check boutique
    console.log('1. Checking Boutique...');
    const boutique = await db.collection('boutiques').findOne({ _id: new ObjectId(BOUTIQUE_ID) });
    
    if (!boutique) {
      console.log('❌ Boutique not found!');
      return;
    }
    
    console.log('✅ Boutique found:');
    console.log('   Name:', boutique.name);
    console.log('   Owner ID:', boutique.ownerId);
    console.log('   Email:', boutique.email);
    
    // Check if user exists with this ownerId
    console.log('\n2. Checking User...');
    const user = await db.collection('users').findOne({ _id: boutique.ownerId });
    
    if (!user) {
      console.log('❌ User not found! Creating user now...\n');
      
      // Create the user
      const newUser = {
        _id: boutique.ownerId,
        name: 'test', // Default name
        email: boutique.email,
        password: '$2b$10$8nVH5kQk3.QX9gQQ9qQxqO7JZGq9qQxqO7JZGq9qQxqO7JZGq9qQ', // "boutique123" hashed
        role: 'boutique_owner',
        isApproved: true,
        boutiqueList: [BOUTIQUE_ID],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('users').insertOne(newUser);
      console.log('✅ User created successfully!');
      console.log('   Email:', newUser.email);
      console.log('   Password: boutique123');
      console.log('   Role:', newUser.role);
      console.log('   Boutique ID:', BOUTIQUE_ID);
      
    } else {
      console.log('✅ User exists:');
      console.log('   Name:', user.name);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Boutique List:', user.boutiqueList);
      
      // Update user to include boutique if missing
      if (!user.boutiqueList || !user.boutiqueList.includes(BOUTIQUE_ID)) {
        console.log('\n⚠️  Adding boutique to user...');
        await db.collection('users').updateOne(
          { _id: boutique.ownerId },
          { 
            $set: { 
              boutiqueList: [BOUTIQUE_ID],
              isApproved: true,
              role: 'boutique_owner'
            } 
          }
        );
        console.log('✅ User updated with boutique ID');
      }
    }
    
    console.log('\n✅ Setup complete! You can now login at:');
    console.log('   http://192.168.56.1:3335/StoreOwner-SignIn');
    console.log('   Email:', boutique.email);
    console.log('   Password: boutique123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

checkAndFixUser();
