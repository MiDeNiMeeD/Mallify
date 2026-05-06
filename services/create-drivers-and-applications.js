const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mallify';
const DB_NAME = process.env.MONGODB_DB || 'mallify';
const SEED_COUNT = Number(process.env.SEED_COUNT || 10);
const PASSWORD_PLAIN = process.env.SEED_PASSWORD || 'driver123';

const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Skyler', 'Dakota'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'WA', 'CO'];
const vehicleMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia', 'BMW', 'Audi', 'Volkswagen'];
const vehicleModels = ['Corolla', 'Civic', 'Focus', 'Malibu', 'Altima', 'Elantra', 'Soul', '3 Series', 'A4', 'Golf'];
const vehicleColors = ['Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Gold', 'Orange', 'Brown'];
const vehicleTypes = ['car', 'motorcycle', 'van', 'truck'];

function pick(list, index) {
  return list[index % list.length];
}

function padNumber(value, length = 3) {
  return String(value).padStart(length, '0');
}

function makePhone(index) {
  const block = 200 + (index % 700);
  return `+1${block}555${padNumber(index + 1, 4)}`;
}

function makeDateOfBirth(index) {
  const year = 1980 + (index % 15);
  const month = (index % 12);
  const day = 1 + (index % 28);
  return new Date(year, month, day);
}

function makeLicenseExpiry(index) {
  const now = new Date();
  return new Date(now.getFullYear() + 2, (index % 12), 15);
}

function makeDriverNumber(index) {
  return `DRV-SEED-${padNumber(index + 1, 3)}`;
}

function makeLicenseNumber(index) {
  return `LIC-SEED-${padNumber(100 + index, 3)}`;
}

function makePlateNumber(index) {
  return `PLT-${padNumber(1000 + index, 4)}`;
}

async function seedDriversAndApplications() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const users = db.collection('users');
    const drivers = db.collection('drivers');
    const applications = db.collection('driverapplications');

    const passwordHash = await bcrypt.hash(PASSWORD_PLAIN, 10);

    let createdUsers = 0;
    let createdDrivers = 0;
    let createdApplications = 0;

    for (let i = 0; i < SEED_COUNT; i += 1) {
      const firstName = pick(firstNames, i);
      const lastName = pick(lastNames, i * 3);
      const email = `driver.seed${i + 1}@mallify.com`.toLowerCase();
      const phone = makePhone(i);
      const city = pick(cities, i * 2);
      const state = pick(states, i * 2);

      const userDoc = {
        name: `${firstName} ${lastName}`,
        email,
        password: passwordHash,
        phone,
        role: 'delivery_person',
        addresses: [
          {
            street: `${100 + i} ${pick(['Main St', 'Oak Ave', 'Maple Dr', 'Park Blvd'], i)}`,
            city,
            state,
            zipCode: `${90000 + i}`,
            country: 'USA',
            isDefault: true
          }
        ],
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const userResult = await users.updateOne(
        { email },
        { $setOnInsert: userDoc },
        { upsert: true }
      );

      if (userResult.upsertedId) {
        createdUsers += 1;
      }

      const user = await users.findOne({ email }, { projection: { _id: 1 } });
      if (!user) {
        throw new Error(`Failed to resolve user for ${email}`);
      }

      const existingDriver = await drivers.findOne({ userId: user._id });
      if (!existingDriver) {
        const status = i % 2 === 0 ? 'active' : 'pending_verification';
        const availability = status === 'active' ? (i % 3 === 0 ? 'available' : 'offline') : 'offline';

        const driverDoc = {
          userId: user._id,
          driverNumber: makeDriverNumber(i),
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth: makeDateOfBirth(i),
          licenseNumber: makeLicenseNumber(i),
          licenseExpiry: makeLicenseExpiry(i),
          vehicleInfo: {
            make: pick(vehicleMakes, i),
            model: pick(vehicleModels, i),
            year: 2016 + (i % 8),
            plateNumber: makePlateNumber(i),
            color: pick(vehicleColors, i),
            type: pick(vehicleTypes, i)
          },
          status,
          availability,
          currentLocation: {
            coordinates: {
              lat: 40.7 + i * 0.01,
              lng: -73.9 - i * 0.01
            },
            timestamp: new Date()
          },
          rating: 4.5 + (i % 5) * 0.1,
          totalDeliveries: 20 + i * 3,
          completedDeliveries: 18 + i * 3,
          cancelledDeliveries: i % 3,
          earnings: {
            total: 1200 + i * 150,
            pending: 200 + i * 25,
            paid: 1000 + i * 125
          },
          bankDetails: {
            accountName: `${firstName} ${lastName}`,
            accountNumber: `000${9000 + i}`,
            bankName: 'Mallify Bank',
            routingNumber: `11000${i}`
          },
          documents: {
            licenseUrl: `https://example.com/licenses/license-${i + 1}.pdf`,
            vehicleRegistrationUrl: `https://example.com/vehicles/registration-${i + 1}.pdf`,
            insuranceUrl: `https://example.com/insurance/insurance-${i + 1}.pdf`,
            photoUrl: `https://example.com/photos/driver-${i + 1}.jpg`
          },
          workingHours: {
            start: '08:00',
            end: '18:00'
          },
          verificationDate: status === 'active' ? new Date() : undefined,
          metadata: {
            seeded: true,
            seedIndex: i + 1
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await drivers.insertOne(driverDoc);
        createdDrivers += 1;
      }

      const existingApplication = await applications.findOne({
        email,
        status: { $in: ['pending', 'under_review'] }
      });

      if (!existingApplication) {
        const applicationStatus = i % 3 === 0 ? 'approved' : (i % 3 === 1 ? 'pending' : 'under_review');
        const applicationDoc = {
          fullName: `${firstName} ${lastName}`,
          email,
          phone,
          address: `${200 + i} ${pick(['Elm St', 'Pine Ave', 'Cedar Dr', 'Sunset Blvd'], i)}`,
          city,
          cinDocument: `cin-${i + 1}.pdf`,
          licenseDocument: `license-${i + 1}.pdf`,
          status: applicationStatus,
          submittedAt: new Date(),
          reviewedAt: applicationStatus === 'approved' ? new Date() : undefined,
          notes: applicationStatus === 'approved' ? 'Approved during seed run.' : undefined
        };

        await applications.insertOne(applicationDoc);
        createdApplications += 1;
      }
    }

    console.log('✅ Seed complete');
    console.log(`Users created: ${createdUsers}`);
    console.log(`Drivers created: ${createdDrivers}`);
    console.log(`Driver applications created: ${createdApplications}`);
    console.log(`Password for seeded users: ${PASSWORD_PLAIN}`);
  } finally {
    await client.close();
  }
}

seedDriversAndApplications().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
