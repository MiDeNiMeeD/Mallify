const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';

async function checkApplications() {
  let client;
  
  try {
    console.log('\n========================================');
    console.log('CHECK BOUTIQUE APPLICATIONS');
    console.log('========================================\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const mallifyDb = client.db('mallify');
    const usersDb = client.db('mallify_users');
    
    const applicationsCollection = mallifyDb.collection('boutiqueapplications');
    const boutiquesCollection = mallifyDb.collection('boutiques');
    const usersCollection = usersDb.collection('users');

    // Get all applications
    const applications = await applicationsCollection.find().toArray();
    
    console.log(`📋 Total Applications: ${applications.length}\n`);
    
    if (applications.length === 0) {
      console.log('⚠️  No applications found in database');
    } else {
      applications.forEach((app, index) => {
        console.log(`\n${index + 1}. ${app.boutiqueName}`);
        console.log(`   Email: ${app.email}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Owner: ${app.ownerName}`);
        console.log(`   Submitted: ${app.submittedAt || 'N/A'}`);
      });
    }

    // Get all boutiques
    console.log('\n========================================');
    const boutiques = await boutiquesCollection.find().toArray();
    console.log(`\n🏪 Total Boutiques: ${boutiques.length}\n`);
    
    if (boutiques.length === 0) {
      console.log('⚠️  No boutiques found in database');
    } else {
      boutiques.forEach((b, index) => {
        console.log(`\n${index + 1}. ${b.name}`);
        console.log(`   Email: ${b.email}`);
        console.log(`   Status: ${b.status}`);
        console.log(`   Owner ID: ${b.ownerId}`);
      });
    }

    // Get boutique owners
    console.log('\n========================================');
    const owners = await usersCollection.find({ role: 'boutique_owner' }).toArray();
    console.log(`\n👤 Total Boutique Owners: ${owners.length}\n`);
    
    if (owners.length === 0) {
      console.log('⚠️  No boutique owners found in database');
    } else {
      owners.forEach((owner, index) => {
        console.log(`\n${index + 1}. ${owner.name}`);
        console.log(`   Email: ${owner.email}`);
        console.log(`   Verified: ${owner.isEmailVerified}`);
        console.log(`   Active: ${owner.isActive}`);
        console.log(`   Boutiques: ${owner.boutiqueList ? owner.boutiqueList.length : 0}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n\n📡 Disconnected from MongoDB\n');
    }
  }
}

// Run the script
checkApplications().catch(console.error);
