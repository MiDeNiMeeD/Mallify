const { MongoClient } = require('mongodb');

// Configuration
const MONGODB_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';

async function createBoutiquesFromApproved() {
  let client;
  
  try {
    console.log('\n========================================');
    console.log('CREATE BOUTIQUES FROM APPROVED APPLICATIONS');
    console.log('========================================\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const mallifyDb = client.db('mallify');
    
    const applicationsCollection = mallifyDb.collection('boutiqueapplications');
    const boutiquesCollection = mallifyDb.collection('boutiques');
    const usersCollection = mallifyDb.collection('users');

    // Get all approved applications
    console.log('\n🔍 Finding approved applications...');
    const approvedApplications = await applicationsCollection.find({ status: 'approved' }).toArray();
    
    if (approvedApplications.length === 0) {
      console.log('⚠️  No approved applications found');
      return;
    }

    console.log(`✅ Found ${approvedApplications.length} approved application(s)\n`);

    for (const application of approvedApplications) {
      console.log(`\n📝 Processing: ${application.boutiqueName}`);
      console.log(`   Email: ${application.email}`);

      // Find user by email
      const user = await usersCollection.findOne({ email: application.email.toLowerCase() });
      
      if (!user) {
        console.log(`   ❌ User not found for email: ${application.email}`);
        continue;
      }

      console.log(`   ✅ User found: ${user.name} (${user._id})`);

      // Check if boutique already exists
      const existingBoutique = await boutiquesCollection.findOne({
        $or: [
          { ownerId: user._id },
          { email: application.email.toLowerCase() }
        ]
      });

      if (existingBoutique) {
        console.log(`   ⚠️  Boutique already exists: ${existingBoutique.name}`);
        
        // Update user's boutiqueList if not already included
        if (!user.boutiqueList || !user.boutiqueList.some(id => id.toString() === existingBoutique._id.toString())) {
          await usersCollection.updateOne(
            { _id: user._id },
            { $addToSet: { boutiqueList: existingBoutique._id } }
          );
          console.log(`   ✅ Updated user's boutiqueList`);
        }
        continue;
      }

      // Generate slug from boutique name
      const slug = application.boutiqueName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Create the boutique
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
      console.log(`   ✅ Boutique created with ID: ${result.insertedId}`);

      // Update user's boutiqueList
      await usersCollection.updateOne(
        { _id: user._id },
        { $addToSet: { boutiqueList: result.insertedId } }
      );
      console.log(`   ✅ Updated user's boutiqueList`);
    }

    // Show summary
    console.log('\n========================================');
    console.log('SUMMARY');
    console.log('========================================');
    
    const totalBoutiques = await boutiquesCollection.countDocuments();
    console.log(`\n✅ Total boutiques in database: ${totalBoutiques}`);
    
    const boutiques = await boutiquesCollection.find().toArray();
    console.log('\nBoutiques:');
    boutiques.forEach(b => {
      console.log(`   - ${b.name} (${b.status}) - Owner: ${b.ownerId}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n📡 Disconnected from MongoDB\n');
    }
  }
}

// Run the script
createBoutiquesFromApproved().catch(console.error);
