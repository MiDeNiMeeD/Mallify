const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const DB_NAME = 'mallify';
const BOUTIQUE_ID = '69b2399b8f52d551743f27eb';

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .trim();
}

// Realistic Food & Beverages boutique data
const boutiqueData = {
  name: "La Gourmandise Tunisienne",
  description: "Your premier destination for authentic Tunisian delicacies, fresh pastries, gourmet coffee, and traditional beverages. We pride ourselves on quality ingredients and traditional recipes passed down through generations.",
  slug: "la-gourmandise-tunisienne",
  logo: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&h=400&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop"
  ],
  hours: {
    monday: { open: "08:00", close: "20:00", closed: false },
    tuesday: { open: "08:00", close: "20:00", closed: false },
    wednesday: { open: "08:00", close: "20:00", closed: false },
    thursday: { open: "08:00", close: "20:00", closed: false },
    friday: { open: "08:00", close: "22:00", closed: false },
    saturday: { open: "08:00", close: "22:00", closed: false },
    sunday: { open: "09:00", close: "18:00", closed: false }
  },
  tags: ["bakery", "coffee", "pastries", "traditional", "gourmet", "fresh", "local"],
  address: {
    street: "15 Avenue Habib Bourguiba",
    city: "Tunis",
    state: "Tunis",
    country: "Tunisia",
    postalCode: "1000"
  }
};

// Sample products for Food & Beverages boutique
const products = [
  {
    name: "Traditional Tunisian Baklava",
    description: "Layers of crispy phyllo dough filled with chopped nuts and sweetened with honey syrup. A classic Middle Eastern dessert made fresh daily.",
    price: 25.00,
    compareAtPrice: 30.00,
    category: "Pastries & Desserts",
    subcategory: "Traditional Sweets",
    sku: "BAK-001",
    quantity: 50,
    lowStockThreshold: 10,
    images: [
      "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&h=600&fit=crop"
    ],
    tags: ["sweet", "traditional", "nuts", "honey", "dessert"],
    specifications: {
      weight: "500g",
      servings: "10-12 pieces",
      shelfLife: "7 days"
    }
  },
  {
    name: "Makroud - Date Filled Pastries",
    description: "Traditional Tunisian semolina pastries filled with date paste, deep-fried and dipped in honey. A beloved treat for special occasions.",
    price: 18.00,
    compareAtPrice: 22.00,
    category: "Pastries & Desserts",
    subcategory: "Traditional Sweets",
    sku: "MAK-001",
    quantity: 45,
    lowStockThreshold: 10,
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop"
    ],
    tags: ["sweet", "traditional", "dates", "honey", "handmade"],
    specifications: {
      weight: "400g",
      servings: "8-10 pieces",
      shelfLife: "5 days"
    }
  },
  {
    name: "Premium Arabic Coffee Blend",
    description: "Expertly roasted blend of premium Arabica beans with hints of cardamom. Perfect for traditional Tunisian coffee ceremonies.",
    price: 35.00,
    compareAtPrice: 42.00,
    category: "Beverages",
    subcategory: "Coffee",
    sku: "COF-001",
    quantity: 80,
    lowStockThreshold: 15,
    images: [
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop"
    ],
    tags: ["coffee", "arabica", "premium", "cardamom", "beverage"],
    specifications: {
      weight: "250g",
      origin: "Tunisia",
      roast: "Medium"
    }
  },
  {
    name: "Mint Tea - Premium Leaves",
    description: "Fresh dried mint leaves for authentic Tunisian mint tea. Hand-picked and naturally dried to preserve maximum flavor and aroma.",
    price: 12.00,
    compareAtPrice: 15.00,
    category: "Beverages",
    subcategory: "Tea",
    sku: "TEA-001",
    quantity: 100,
    lowStockThreshold: 20,
    images: [
      "https://images.unsplash.com/photo-1563822249548-9a72b6d09c7c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600&fit=crop"
    ],
    tags: ["tea", "mint", "herbal", "natural", "traditional"],
    specifications: {
      weight: "100g",
      origin: "Tunisia",
      type: "Green Mint"
    }
  },
  {
    name: "Assorted Tunisian Cookies Box",
    description: "A delightful box containing 6 varieties of traditional Tunisian cookies including kaaber el ghazal, ghriba, and more. Perfect gift or personal treat.",
    price: 28.00,
    compareAtPrice: 35.00,
    category: "Pastries & Desserts",
    subcategory: "Cookies",
    sku: "COO-001",
    quantity: 40,
    lowStockThreshold: 10,
    images: [
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop"
    ],
    tags: ["cookies", "assorted", "gift", "traditional", "variety"],
    specifications: {
      weight: "600g",
      varieties: "6 types",
      packaging: "Gift box"
    }
  },
  {
    name: "Fresh Honey from Tunisian Mountains",
    description: "Pure, raw honey harvested from wildflowers in the Atlas Mountains. Rich in natural enzymes and perfect for sweetening or medicinal use.",
    price: 45.00,
    compareAtPrice: 55.00,
    category: "Natural Products",
    subcategory: "Honey & Spreads",
    sku: "HON-001",
    quantity: 60,
    lowStockThreshold: 15,
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784769?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop"
    ],
    tags: ["honey", "natural", "organic", "raw", "mountain"],
    specifications: {
      weight: "500g",
      origin: "Atlas Mountains, Tunisia",
      type: "Wildflower"
    }
  },
  {
    name: "Traditional Brik Pastry Sheets",
    description: "Ultra-thin pastry sheets perfect for making traditional Tunisian brik. Pre-packaged and ready to use for savory or sweet recipes.",
    price: 8.00,
    compareAtPrice: 10.00,
    category: "Baking Supplies",
    subcategory: "Pastry",
    sku: "BRI-001",
    quantity: 75,
    lowStockThreshold: 20,
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop"
    ],
    tags: ["pastry", "sheets", "brik", "cooking", "traditional"],
    specifications: {
      weight: "300g",
      sheets: "10 pieces",
      storage: "Refrigerate"
    }
  },
  {
    name: "Harissa Paste - Spicy Chili Sauce",
    description: "Authentic Tunisian harissa made from red chili peppers, garlic, and aromatic spices. Essential condiment for traditional cuisine.",
    price: 15.00,
    compareAtPrice: 18.00,
    category: "Condiments & Spices",
    subcategory: "Sauces",
    sku: "HAR-001",
    quantity: 90,
    lowStockThreshold: 20,
    images: [
      "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=800&h=600&fit=crop"
    ],
    tags: ["harissa", "spicy", "condiment", "chili", "traditional"],
    specifications: {
      weight: "200g",
      spiceLevel: "Hot",
      shelfLife: "12 months"
    }
  },
  {
    name: "Tunisian Olive Oil - Extra Virgin",
    description: "Cold-pressed extra virgin olive oil from centuries-old olive groves in Tunisia. Rich, fruity flavor perfect for cooking or drizzling.",
    price: 38.00,
    compareAtPrice: 45.00,
    category: "Natural Products",
    subcategory: "Oils & Vinegars",
    sku: "OIL-001",
    quantity: 70,
    lowStockThreshold: 15,
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608181831521-4c9d6f44e4b3?w=800&h=600&fit=crop"
    ],
    tags: ["olive oil", "extra virgin", "natural", "premium", "cooking"],
    specifications: {
      volume: "500ml",
      origin: "Tunisia",
      acidity: "< 0.5%"
    }
  },
  {
    name: "Dates - Premium Deglet Nour",
    description: "The finest Deglet Nour dates from Tunisia, known as the 'queen of dates'. Naturally sweet, soft, and perfect for snacking or baking.",
    price: 22.00,
    compareAtPrice: 28.00,
    category: "Natural Products",
    subcategory: "Dried Fruits",
    sku: "DAT-001",
    quantity: 85,
    lowStockThreshold: 20,
    images: [
      "https://images.unsplash.com/photo-1584278892693-a0e8d2e4234c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&h=600&fit=crop"
    ],
    tags: ["dates", "dried fruit", "natural", "sweet", "healthy"],
    specifications: {
      weight: "500g",
      variety: "Deglet Nour",
      origin: "Tunisia"
    }
  },
  {
    name: "Traditional Couscous - Fine Grain",
    description: "Premium quality hand-rolled couscous made from durum wheat semolina. The foundation of Tunisia's national dish.",
    price: 14.00,
    compareAtPrice: 17.00,
    category: "Grains & Pasta",
    subcategory: "Couscous",
    sku: "COU-001",
    quantity: 120,
    lowStockThreshold: 25,
    images: [
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611184344491-4ffb2f27e92e?w=800&h=600&fit=crop"
    ],
    tags: ["couscous", "grain", "traditional", "staple", "pasta"],
    specifications: {
      weight: "1kg",
      grain: "Fine",
      cookingTime: "5 minutes"
    }
  },
  {
    name: "Za'atar Spice Blend",
    description: "Aromatic blend of thyme, sesame seeds, sumac, and Mediterranean herbs. Versatile seasoning for breads, meats, and vegetables.",
    price: 16.00,
    compareAtPrice: 20.00,
    category: "Condiments & Spices",
    subcategory: "Spice Blends",
    sku: "ZAA-001",
    quantity: 95,
    lowStockThreshold: 20,
    images: [
      "https://images.unsplash.com/photo-1596040033229-a0b3b3a08afd?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1599909533925-d8e7d40c1a25?w=800&h=600&fit=crop"
    ],
    tags: ["spice", "blend", "zaatar", "herbs", "seasoning"],
    specifications: {
      weight: "150g",
      ingredients: "Thyme, Sesame, Sumac",
      shelfLife: "18 months"
    }
  },
  {
    name: "Artisan Sfenj - Donut Mix",
    description: "Pre-mixed ingredients for making traditional Tunisian sfenj (donuts). Just add water, knead, and fry for authentic fluffy donuts.",
    price: 10.00,
    compareAtPrice: 13.00,
    category: "Baking Supplies",
    subcategory: "Mixes",
    sku: "SFE-001",
    quantity: 65,
    lowStockThreshold: 15,
    images: [
      "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514517521153-1be72277b32f?w=800&h=600&fit=crop"
    ],
    tags: ["donut", "mix", "baking", "traditional", "easy"],
    specifications: {
      weight: "500g",
      yield: "12-15 donuts",
      difficulty: "Easy"
    }
  },
  {
    name: "Rose Water - Food Grade",
    description: "Pure distilled rose water for flavoring desserts, beverages, and traditional sweets. A signature ingredient in Middle Eastern cuisine.",
    price: 11.00,
    compareAtPrice: 14.00,
    category: "Baking Supplies",
    subcategory: "Extracts & Flavors",
    sku: "ROS-001",
    quantity: 110,
    lowStockThreshold: 25,
    images: [
      "https://images.unsplash.com/photo-1615485290161-6c0e94bb3a58?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1510925751823-5cfb2ec631fa?w=800&h=600&fit=crop"
    ],
    tags: ["rose water", "extract", "flavoring", "traditional", "natural"],
    specifications: {
      volume: "250ml",
      type: "Food Grade",
      ingredients: "100% Rose Water"
    }
  },
  {
    name: "Tunisian Chickpea Snack Mix",
    description: "Crunchy roasted chickpeas seasoned with traditional Tunisian spices. Healthy, protein-rich snack perfect for any time of day.",
    price: 9.00,
    compareAtPrice: 12.00,
    category: "Snacks",
    subcategory: "Nuts & Seeds",
    sku: "CHI-001",
    quantity: 88,
    lowStockThreshold: 20,
    images: [
      "https://images.unsplash.com/photo-1599909533925-d8e7d40c1a25?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&h=600&fit=crop"
    ],
    tags: ["snack", "chickpea", "healthy", "protein", "spicy"],
    specifications: {
      weight: "200g",
      calories: "150 per serving",
      shelfLife: "6 months"
    }
  }
];

async function setupBoutiqueData() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const boutiquesCollection = db.collection('boutiques');
    const productsCollection = db.collection('products');
    
    // Update boutique with enhanced data
    console.log('\n📦 Updating boutique information...');
    const boutiqueUpdateResult = await boutiquesCollection.updateOne(
      { _id: new ObjectId(BOUTIQUE_ID) },
      { 
        $set: {
          ...boutiqueData,
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ Boutique updated successfully`);
    console.log(`   - Name: ${boutiqueData.name}`);
    console.log(`   - Description: ${boutiqueData.description.substring(0, 80)}...`);
    console.log(`   - Logo: ${boutiqueData.logo}`);
    console.log(`   - Images: ${boutiqueData.images.length} images added`);
    console.log(`   - Business Hours: Set for all days`);
    console.log(`   - Tags: ${boutiqueData.tags.join(', ')}`);
    
    // Create products
    console.log('\n🛍️  Creating products...');
    
    const productsToInsert = products.map(product => ({
      ...product,
      slug: generateSlug(product.name),
      boutiqueId: new ObjectId(BOUTIQUE_ID),
      status: 'active',
      featured: Math.random() > 0.7, // 30% chance of being featured
      sold: Math.floor(Math.random() * 50), // Random sold count 0-50
      views: Math.floor(Math.random() * 500 + 100), // Random views 100-600
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating between 3.0-5.0
      reviewCount: Math.floor(Math.random() * 20), // 0-20 reviews
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Delete existing products for this boutique (if any)
    const deleteResult = await productsCollection.deleteMany({
      boutiqueId: new ObjectId(BOUTIQUE_ID)
    });
    console.log(`   Removed ${deleteResult.deletedCount} existing products`);
    
    // Insert new products
    const insertResult = await productsCollection.insertMany(productsToInsert);
    console.log(`✅ ${insertResult.insertedCount} products created successfully\n`);
    
    // Display product summary
    console.log('📊 Product Summary:');
    console.log('─────────────────────────────────────────────────────────────');
    
    const categorySummary = {};
    productsToInsert.forEach(product => {
      if (!categorySummary[product.category]) {
        categorySummary[product.category] = [];
      }
      categorySummary[product.category].push(product.name);
    });
    
    Object.entries(categorySummary).forEach(([category, productNames]) => {
      console.log(`\n${category} (${productNames.length} products):`);
      productNames.forEach(name => console.log(`  • ${name}`));
    });
    
    // Calculate total inventory value
    const totalValue = productsToInsert.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalQuantity = productsToInsert.reduce((sum, p) => sum + p.quantity, 0);
    
    console.log('\n─────────────────────────────────────────────────────────────');
    console.log(`\n💰 Inventory Statistics:`);
    console.log(`   Total Products: ${productsToInsert.length}`);
    console.log(`   Total Items in Stock: ${totalQuantity}`);
    console.log(`   Total Inventory Value: ${totalValue.toFixed(2)} TND`);
    console.log(`   Average Price: ${(totalValue / productsToInsert.length).toFixed(2)} TND`);
    console.log(`   Price Range: ${Math.min(...productsToInsert.map(p => p.price))} TND - ${Math.max(...productsToInsert.map(p => p.price))} TND`);
    
    console.log('\n─────────────────────────────────────────────────────────────');
    console.log('✨ Setup Complete!');
    console.log('\nBoutique Dashboard: http://192.168.56.1:3335');
    console.log(`Boutique ID: ${BOUTIQUE_ID}`);
    console.log(`Boutique Name: ${boutiqueData.name}`);
    console.log('─────────────────────────────────────────────────────────────\n');
    
  } catch (error) {
    console.error('❌ Error setting up boutique data:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the setup
setupBoutiqueData();
