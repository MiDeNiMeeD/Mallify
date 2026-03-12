const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const BOUTIQUE_ID = '69b2399b8f52d551743f27eb';

async function checkData() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db('mallify');
    
    // Check boutique
    const boutique = await db.collection('boutiques').findOne({ 
      _id: new ObjectId(BOUTIQUE_ID) 
    });
    
    console.log('====== BOUTIQUE DATA ======');
    console.log('Name:', boutique?.name);
    console.log('Logo:', boutique?.logo);
    console.log('Images:', boutique?.images);
    console.log('Description:', boutique?.description?.substring(0, 80) + '...');
    
    // Check products
    const products = await db.collection('products').find({ 
      boutiqueId: new ObjectId(BOUTIQUE_ID) 
    }).limit(5).toArray();
    
    console.log('\n====== PRODUCT DATA (Sample) ======');
    products.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`);
      console.log('   Images:', p.images);
      console.log('   Price:', p.price);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkData();
