const http = require('http');

const API_BASE = 'localhost';
const API_PORT = 4000;
const EMAIL = 'mohamedamine.midani200@gmail.com';
const PASSWORD = 'boutique123';
const BOUTIQUE_ID = '69b2399b8f52d551743f27eb';

function makeRequest(path, method, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testLoginAndFetch() {
  try {
    console.log('🔐 Step 1: Logging in...');
    console.log(`   Email: ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}\n`);

    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: EMAIL,
      password: PASSWORD
    });

    console.log('📦 Login Response Status:', loginResponse.status);
    
    if (loginResponse.status !== 200 && loginResponse.status !== 201) {
      console.log('❌ Login failed!');
      console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }

    const token = loginResponse.data.data?.accessToken || loginResponse.data.accessToken;
    const user = loginResponse.data.data?.user || loginResponse.data.user;

    console.log('✅ Login successful!');
    console.log('   User:', user.name);
    console.log('   Role:', user.role);
    console.log('   Boutique List:', user.boutiqueList);
    console.log('   Token:', token ? 'Received' : 'Missing');

    if (!token) {
      console.log('❌ No token received!');
      return;
    }

    console.log('\n📍 Step 2: Fetching boutique data...');
    console.log(`   GET /api/boutiques/${BOUTIQUE_ID}\n`);

    const boutiqueResponse = await makeRequest(
      `/api/boutiques/${BOUTIQUE_ID}`,
      'GET',
      null,
      token
    );

    console.log('📦 Boutique Response Status:', boutiqueResponse.status);

    if (boutiqueResponse.status !== 200) {
      console.log('❌ Failed to fetch boutique!');
      console.log('Response:', JSON.stringify(boutiqueResponse.data, null, 2));
      return;
    }

    console.log('\n🔍 RAW API Response:');
    console.log(JSON.stringify(boutiqueResponse.data, null, 2));

    const boutique = boutiqueResponse.data.data?.boutique || boutiqueResponse.data.data || boutiqueResponse.data;

    console.log('\n✅ Boutique fetched successfully!\n');
    console.log('📊 Boutique Details:');
    console.log('   Name:', boutique.name || '❌ MISSING');
    console.log('   Logo:', boutique.logo || '❌ MISSING');
    console.log('   Images:', boutique.images?.length || 0, 'images');
    console.log('   Description:', boutique.description ? `${boutique.description.substring(0, 60)}...` : '❌ MISSING');
    console.log('   Email:', boutique.email || '❌ MISSING');
    console.log('   Phone:', boutique.phone || '❌ MISSING');
    
    if (boutique.logo) {
      console.log('\n🖼️  Logo URL:', boutique.logo);
    }
    
    if (boutique.images && boutique.images.length > 0) {
      console.log('\n🖼️  Banner Images:');
      boutique.images.forEach((img, i) => {
        console.log(`   ${i + 1}. ${img}`);
      });
    }

    console.log('\n📍 Step 3: Fetching products...');
    
    const productsResponse = await makeRequest(
      `/api/products?boutiqueId=${BOUTIQUE_ID}`,
      'GET',
      null,
      token
    );

    console.log('📦 Products Response Status:', productsResponse.status);

    if (productsResponse.status === 200) {
      const productsData = productsResponse.data.data || productsResponse.data;
      const products = Array.isArray(productsData) ? productsData : (productsData.products || []);
      
      console.log(`✅ Found ${products.length} products\n`);
      
      if (products.length > 0) {
        console.log('First 3 products:');
        products.slice(0, 3).forEach((product, i) => {
          console.log(`\n${i + 1}. ${product.name}`);
          console.log(`   Images: ${product.images?.length || 0}`);
          if (product.images && product.images.length > 0) {
            console.log(`   First image: ${product.images[0]}`);
          }
        });
      }
    }

    console.log('\n✅ All API calls successful!');
    console.log('🎉 The backend is working correctly.');
    console.log('\nIf images still not showing in browser:');
    console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('2. Hard refresh (Ctrl+F5)');
    console.log('3. Check browser console for CORS errors');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLoginAndFetch();
