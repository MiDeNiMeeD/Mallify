const { MongoClient } = require('mongodb');
const https = require('https');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mallify:mallify_password@localhost:27017/?authSource=admin';
const DB_NAME = process.env.DB_NAME || 'mallify';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'products';
const IMAGES_PER_PRODUCT = Number(process.env.IMAGES_PER_PRODUCT || 3);

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : 0;

const UNSPLASH_SEARCH_PAGES = [
  'https://unsplash.com/s/photos/product',
  'https://unsplash.com/s/photos/product-photography',
  'https://unsplash.com/s/photos/fashion-product',
  'https://unsplash.com/s/photos/shoes-product',
  'https://unsplash.com/s/photos/cosmetic-product',
];

const FALLBACK_BASE_URLS = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f',
  'https://images.unsplash.com/photo-1503341338985-95ef96852d7b',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d',
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2',
  'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7',
  'https://images.unsplash.com/photo-1475180098004-ca77a66827be',
  'https://images.unsplash.com/photo-1479064555552-3ef4979f8908',
  'https://images.unsplash.com/photo-1445205170230-053b83016050',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e',
  'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93',
  'https://images.unsplash.com/photo-1518546305927-5a555bb7020d',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a',
  'https://images.unsplash.com/photo-1511556820780-d912e42b4980',
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a',
  'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504',
  'https://images.unsplash.com/photo-1526178613658-3f1622045557',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f',
  'https://images.unsplash.com/photo-1593032465171-8bd9f172f2d0',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
  'https://images.unsplash.com/photo-1585386959984-a41552231658',
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796',
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
  'https://images.unsplash.com/photo-1495435229349-e86db7bfa013',
  'https://images.unsplash.com/photo-1517336714739-489689fd1ca8',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661',
  'https://images.unsplash.com/photo-1503602642458-232111445657',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d',
  'https://images.unsplash.com/photo-1463107971871-fbac9ddb920f',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518',
  'https://images.unsplash.com/photo-1529653762956-b0a27278529c',
  'https://images.unsplash.com/photo-1505576399279-565b52d4ac71',
  'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
  'https://images.unsplash.com/photo-1526178613658-3f1622045557',
  'https://images.unsplash.com/photo-1539874754764-5a96559165b0',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
  'https://images.unsplash.com/photo-1562158070-57ad94c7f4b7',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
  'https://images.unsplash.com/photo-1572635196243-4dd75fbdbd7f',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90',
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa',
  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb',
  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519',
  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519',
  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db',
  'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd',
  'https://images.unsplash.com/photo-1611930021592-a8cfd5319ceb',
  'https://images.unsplash.com/photo-1618354691321-e851c56960d1',
  'https://images.unsplash.com/photo-1618354691229-88d47f285158',
  'https://images.unsplash.com/photo-1514996937319-344454492b37',
  'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd',
  'https://images.unsplash.com/photo-1547949003-9792a18a2601',
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2',
  'https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
  'https://images.unsplash.com/photo-1495106245177-55dc6f43e83f',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b',
  'https://images.unsplash.com/photo-1503341338985-95ef96852d7b',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
  'https://images.unsplash.com/photo-1526178613658-3f1622045557',
  'https://images.unsplash.com/photo-1539874754764-5a96559165b0',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b',
  'https://images.unsplash.com/photo-1562158070-57ad94c7f4b7',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
  'https://images.unsplash.com/photo-1572635196243-4dd75fbdbd7f',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90',
  'https://images.unsplash.com/photo-1586495777744-4413f21062fa',
  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb',
  'https://images.unsplash.com/photo-1606813907291-d86efa9b94db',
  'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd',
  'https://images.unsplash.com/photo-1611930021592-a8cfd5319ceb',
  'https://images.unsplash.com/photo-1618354691321-e851c56960d1',
  'https://images.unsplash.com/photo-1618354691229-88d47f285158',
  'https://images.unsplash.com/photo-1514996937319-344454492b37',
  'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd',
  'https://images.unsplash.com/photo-1547949003-9792a18a2601',
];

const MAX_VALIDATION_CHECKS = Number(process.env.MAX_VALIDATION_CHECKS || 250);

const getText = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });

const checkImageUrl = (url) =>
  new Promise((resolve) => {
    https
      .get(url, (res) => {
        const ok = Number(res.statusCode) === 200 && String(res.headers['content-type'] || '').includes('image/');
        res.resume();
        resolve(ok);
      })
      .on('error', () => resolve(false));
  });

const extractUnsplashBaseUrls = (html) => {
  const text = String(html || '').replace(/\\u0026/g, '&');
  const matches = text.match(/https:\/\/images\.unsplash\.com\/photo-[^"'\\s)]+/g) || [];
  const unique = new Set();

  for (const match of matches) {
    try {
      const parsed = new URL(match);
      unique.add(`${parsed.origin}${parsed.pathname}`);
    } catch {
      // Ignore malformed matches from page blobs.
    }
  }

  return Array.from(unique);
};

const buildUnsplashUrl = (baseUrl, width = 1200, height = 1200) =>
  `${baseUrl}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;

const hashString = (input) => {
  let hash = 0;
  const raw = String(input || '');
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const fetchUnsplashPool = async () => {
  const discovered = new Set();

  for (const pageUrl of UNSPLASH_SEARCH_PAGES) {
    try {
      const html = await getText(pageUrl);
      const urls = extractUnsplashBaseUrls(html);
      urls.forEach((url) => discovered.add(url));
      console.log(`Fetched ${urls.length} image candidates from ${pageUrl}`);
    } catch (error) {
      console.warn(`Failed to fetch from ${pageUrl}:`, error?.message || error);
    }
  }

  const result = Array.from(discovered);
  if (result.length < 30) {
    FALLBACK_BASE_URLS.forEach((url) => result.push(url));
  }

  return Array.from(new Set(result));
};

const buildValidatedPool = async (pool) => {
  const uniquePool = Array.from(new Set((pool || []).filter(Boolean)));
  const toCheck = uniquePool.slice(0, MAX_VALIDATION_CHECKS);
  const valid = [];

  for (let i = 0; i < toCheck.length; i += 1) {
    const testUrl = buildUnsplashUrl(toCheck[i], 500, 500);
    const ok = await checkImageUrl(testUrl);
    if (ok) {
      valid.push(toCheck[i]);
    }
  }

  if (valid.length >= 20) {
    return valid;
  }

  // Last safety fallback if network checks are blocked.
  return uniquePool.slice(0, Math.max(20, uniquePool.length));
};

async function run() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db(DB_NAME);
    const products = db.collection(COLLECTION_NAME);
    const unsplashPoolRaw = await fetchUnsplashPool();
    const unsplashPool = await buildValidatedPool(unsplashPoolRaw);

    if (unsplashPool.length === 0) {
      throw new Error('No Unsplash image URLs available.');
    }

    console.log(`Using ${unsplashPool.length} validated Unsplash image base URLs.`);

    const cursor = products.find({}, { projection: { _id: 1, name: 1 } });
    if (limit > 0) {
      cursor.limit(limit);
    }

    const docs = await cursor.toArray();

    if (docs.length === 0) {
      console.log('No products found.');
      return;
    }

    let updatedCount = 0;

    for (let i = 0; i < docs.length; i += 1) {
      const doc = docs[i];
      const seed = hashString(doc?._id);
      const images = Array.from({ length: Math.max(1, IMAGES_PER_PRODUCT) }, (_, idx) => {
        const poolIndex = (seed + idx * 17) % unsplashPool.length;
        return buildUnsplashUrl(unsplashPool[poolIndex], 1200, 1200);
      });
      const thumbIndex = (seed + 97) % unsplashPool.length;
      const thumbnail = buildUnsplashUrl(unsplashPool[thumbIndex], 400, 400);

      if (isDryRun) {
        console.log(`\n[DRY RUN] ${doc._id} | ${doc.name}`);
        console.log(`  Thumbnail: ${thumbnail}`);
        console.log(`  Images:`);
        images.forEach((url) => console.log(`    - ${url}`));
        continue;
      }

      const result = await products.updateOne(
        { _id: doc._id },
        {
          $set: {
            images,
            thumbnail,
          },
        }
      );

      if (result.modifiedCount > 0) {
        updatedCount += 1;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`Processed ${i + 1}/${docs.length} products...`);
      }
    }

    if (isDryRun) {
      console.log(`\nDry run complete. Previewed ${docs.length} product(s).`);
    } else {
      console.log(`\nDone. Updated images for ${updatedCount}/${docs.length} product(s).`);
    }
  } catch (error) {
    console.error('Failed to update product images:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
