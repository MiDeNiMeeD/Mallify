const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const DB_NAME = 'mallify';
const BOUTIQUE_ID = '69b2399b8f52d551743f27eb';

async function debugBoutique() {
  let client;
  
  try {
    client = await MongoClient.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const db = client.db(DB_NAME);
    const boutique = await db.collection('boutiques').findOne({ _id: new ObjectId(BOUTIQUE_ID) });
    
    if (!boutique) {
      console.log('❌ Boutique not found!');
      return;
    }
    
    console.log('✅ Boutique found in database!\n');
    console.log('📊 Complete Boutique Object:');
    console.log(JSON.stringify(boutique, null, 2));
    
    console.log('\n\n📋 Field-by-field check:');
    console.log('- _id:', boutique._id);
    console.log('- name:', boutique.name || '❌ MISSING');
    console.log('- description:', boutique.description ? `${boutique.description.substring(0, 50)}...` : '❌ MISSING');
    console.log('- logo:', boutique.logo || '❌ MISSING');
    console.log('- images:', boutique.images?.length || 0, 'images');
    console.log('- email:', boutique.email || '❌ MISSING');
    console.log('- phone:', boutique.phone || '❌ MISSING');
    console.log('- hours:', boutique.hours ? 'Present' : '❌ MISSING');
    console.log('- address:', boutique.address ? 'Present' : '❌ MISSING');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

debugBoutique();
