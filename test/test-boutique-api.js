const http = require('http');

const API_BASE_URL = 'localhost';
const API_PORT = 4000;
const BOUTIQUE_ID = '69b2399b8f52d551743f27eb';

function testBoutiqueAPI() {
  console.log('Testing Boutique API...\n');
  console.log(`GET http://${API_BASE_URL}:${API_PORT}/api/boutiques/${BOUTIQUE_ID}\n`);

  const options = {
    hostname: API_BASE_URL,
    port: API_PORT,
    path: `/api/boutiques/${BOUTIQUE_ID}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('✅ Response Status:', res.statusCode);
      
      try {
        const jsonData = JSON.parse(data);
        console.log('\n📦 Full Response:', JSON.stringify(jsonData, null, 2));
        
        const boutique = jsonData.data || jsonData;
        console.log('\n📊 Boutique Details:');
        console.log('   Name:', boutique.name || 'MISSING ❌');
        console.log('   Logo:', boutique.logo || 'MISSING ❌');
        console.log('   Images:', boutique.images?.length || 0, 'images');
        console.log('   Description:', boutique.description ? `${boutique.description.substring(0, 60)}...` : 'MISSING ❌');
        console.log('   Address:', boutique.address?.street || 'MISSING ❌');
      } catch (error) {
        console.error('❌ Error parsing JSON:', error.message);
        console.log('Raw data:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
  });

  req.end();
}

testBoutiqueAPI();
