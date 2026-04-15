const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuration
const MONGODB_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const DEFAULT_PASSWORD = process.env.BOUTIQUE_OWNER_PASSWORD || 'boutique123';
const EMAIL_FILTER = process.env.BOUTIQUE_EMAIL
  ? process.env.BOUTIQUE_EMAIL.trim().toLowerCase()
  : null;

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
    const query = { status: 'approved' };
    if (EMAIL_FILTER) {
      query.email = EMAIL_FILTER;
      console.log(`   ➤ Email filter active: ${EMAIL_FILTER}`);
    }

    const approvedApplications = await applicationsCollection.find(query).toArray();
    
    if (approvedApplications.length === 0) {
      console.log('⚠️  No approved applications found');
      return;
    }

    console.log(`✅ Found ${approvedApplications.length} approved application(s)\n`);

    for (const application of approvedApplications) {
      console.log(`\n📝 Processing: ${application.boutiqueName}`);
      console.log(`   Email: ${application.email}`);

      // Find or create user by email
      let user = await usersCollection.findOne({ email: application.email.toLowerCase() });
      
      if (!user) {
        console.log('   ⚠️  User not found. Creating boutique owner account...');
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        const newUser = {
          name: application.ownerName,
          email: application.email.toLowerCase(),
          password: hashedPassword,
          phone: application.phone,
          role: 'boutique_owner',
          addresses: [
            {
              street: application.address,
              city: application.city,
              state: '',
              zipCode: application.postalCode || '',
              country: 'Tunisia',
              isDefault: true,
            },
          ],
          isEmailVerified: true,
          isActive: true,
          profileImage: null,
          googleId: null,
          boutiqueList: [],
          subscriptionStatus: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const insertResult = await usersCollection.insertOne(newUser);
        user = { ...newUser, _id: insertResult.insertedId };
        console.log(`   ✅ Created user account (${user._id})`);
        console.log(`   🔑 Temporary password: ${DEFAULT_PASSWORD}`);
      } else {
        console.log(`   ✅ User found: ${user.name} (${user._id})`);

        const updates = {};
        if (user.role !== 'boutique_owner') {
          updates.role = 'boutique_owner';
        }
        if (!user.isEmailVerified) {
          updates.isEmailVerified = true;
        }
        if (user.isActive === false) {
          updates.isActive = true;
        }

        if (!Array.isArray(user.addresses) || user.addresses.length === 0) {
          updates.addresses = [
            {
              street: application.address,
              city: application.city,
              state: '',
              zipCode: application.postalCode || '',
              country: 'Tunisia',
              isDefault: true,
            },
          ];
        }

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = new Date();
          await usersCollection.updateOne({ _id: user._id }, { $set: updates });
          user = { ...user, ...updates };
          console.log('   🔄 User metadata updated for boutique access');
        }

        if (!Array.isArray(user.boutiqueList)) {
          await usersCollection.updateOne(
            { _id: user._id },
            { $set: { boutiqueList: [] } }
          );
          user.boutiqueList = [];
        }
      }

      // Check if boutique already exists
      const existingBoutique = await boutiquesCollection.findOne({
        $or: [
          { ownerId: user._id },
          { email: application.email.toLowerCase() }
        ]
      });

      let activeBoutique = existingBoutique;

      if (activeBoutique) {
        console.log(`   ⚠️  Boutique already exists: ${activeBoutique.name}`);
      } else {
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
        activeBoutique = { ...newBoutique, _id: result.insertedId };
        console.log(`   ✅ Boutique created with ID: ${result.insertedId}`);
      }

      const validBoutiqueId = activeBoutique._id;

      // Replace boutiqueList with the single valid boutique ID
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            boutiqueList: [validBoutiqueId],
            role: 'boutique_owner',
            isApproved: true,
          },
        }
      );
      console.log('   ✅ Synced user.boutiqueList with active boutique');

      await applicationsCollection.updateOne(
        { _id: application._id },
        {
          $set: {
            status: 'approved',
            reviewedAt: application.reviewedAt || new Date(),
            lastProvisionedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      console.log(`   ✅ Owner linked to boutique ${validBoutiqueId}`);
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
