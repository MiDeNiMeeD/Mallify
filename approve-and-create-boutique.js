const { MongoClient, ObjectId } = require('mongodb');

// Configuration
const MONGODB_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const EMAIL_TO_APPROVE = 'mohamedamine.midani200@gmail.com'; // Change this if needed

async function approveApplicationAndCreateBoutique() {
  let client;
  
  try {
    console.log('\n========================================');
    console.log('APPROVE APPLICATION & CREATE BOUTIQUE');
    console.log('========================================\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const mallifyDb = client.db('mallify');
    
    const applicationsCollection = mallifyDb.collection('boutiqueapplications');
    const boutiquesCollection = mallifyDb.collection('boutiques');
    const usersCollection = mallifyDb.collection('users');

    // Find the application
    console.log(`🔍 Finding application for: ${EMAIL_TO_APPROVE}`);
    const application = await applicationsCollection.findOne({ 
      email: EMAIL_TO_APPROVE.toLowerCase() 
    });
    
    if (!application) {
      console.log('❌ Application not found');
      return;
    }

    console.log(`✅ Found application: ${application.boutiqueName}`);
    console.log(`   Current status: ${application.status}\n`);

    // Update application status to approved
    console.log('📝 Updating application status to APPROVED...');
    await applicationsCollection.updateOne(
      { _id: application._id },
      { 
        $set: { 
          status: 'approved',
          reviewedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    console.log('✅ Application status updated to APPROVED\n');

    // Find user by email
    console.log('🔍 Finding user account...');
    const user = await usersCollection.findOne({ 
      email: EMAIL_TO_APPROVE.toLowerCase() 
    });
    
    if (!user) {
      console.log('❌ User account not found');
      console.log('💡 Run: node create-boutique-user.js');
      return;
    }

    console.log(`✅ User found: ${user.name} (${user._id})\n`);

    // Check if boutique already exists
    const existingBoutique = await boutiquesCollection.findOne({
      $or: [
        { ownerId: user._id },
        { email: EMAIL_TO_APPROVE.toLowerCase() }
      ]
    });

    if (existingBoutique) {
      console.log(`⚠️  Boutique already exists: ${existingBoutique.name}`);
      console.log(`   Status: ${existingBoutique.status}`);
      console.log(`   ID: ${existingBoutique._id}\n`);
      
      // Update user's boutiqueList
      if (!user.boutiqueList || !user.boutiqueList.some(id => id.toString() === existingBoutique._id.toString())) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $addToSet: { boutiqueList: existingBoutique._id } }
        );
        console.log(`✅ Updated user's boutiqueList`);
      }
      return;
    }

    // Generate slug from boutique name
    const slug = application.boutiqueName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Create the boutique
    console.log('🏪 Creating boutique...');
    const newBoutique = {
      name: application.boutiqueName,
      description: application.description,
      ownerId: user._id,
      email: application.email.toLowerCase(),
      phone: application.phone,
      address: {
        street: application.address,
        city: application.city,
        state: '',
        country: 'Tunisia',
        postalCode: '',
      },
      businessType: 'retail',
      categories: application.category ? [application.category] : [],
      tags: [],
      images: [],
      hours: {},
      slug: slug,
      status: 'active',
      verified: true,
      featured: false,
      rating: 0,
      reviewCount: 0,
      totalSales: 0,
      totalOrders: 0,
      currency: 'TND',
      timezone: 'Africa/Tunis',
      language: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await boutiquesCollection.insertOne(newBoutique);
    console.log(`✅ Boutique created with ID: ${result.insertedId}\n`);

    // Update user's boutiqueList
    console.log('📝 Updating user\'s boutiqueList...');
    await usersCollection.updateOne(
      { _id: user._id },
      { $addToSet: { boutiqueList: result.insertedId } }
    );
    console.log('✅ User\'s boutiqueList updated\n');

    // Show summary
    console.log('========================================');
    console.log('SUCCESS!');
    console.log('========================================');
    console.log(`\n✅ Application: ${application.boutiqueName}`);
    console.log(`✅ Status: ${application.status} → approved`);
    console.log(`✅ Boutique created: ${newBoutique.name}`);
    console.log(`✅ Boutique ID: ${result.insertedId}`);
    console.log(`✅ Owner: ${user.name} (${user.email})`);
    console.log(`\n🎉 You can now login at: http://192.168.56.1:3335/StoreOwner-SignIn`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: boutique123\n`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('📡 Disconnected from MongoDB\n');
    }
  }
}

// Run the script
approveApplicationAndCreateBoutique().catch(console.error);
