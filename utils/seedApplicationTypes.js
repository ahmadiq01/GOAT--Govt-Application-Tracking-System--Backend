const mongoose = require('mongoose');
const ApplicationType = require('../models/ApplicationType');
require('dotenv').config();

const seedApplicationTypes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/goat-system');
    console.log('✅ Connected to MongoDB for seeding application types');

    // Application types data from the image
    const applicationTypes = [
      { name: 'Revenue matters', description: 'Applications related to revenue and taxation matters' },
      { name: 'Income Certificate', description: 'Applications for income certificate issuance' },
      { name: 'Record correction', description: 'Applications for correction of official records' },
      { name: 'Issuance of Fard', description: 'Applications for issuance of property documents' },
      { name: 'Demarcation', description: 'Applications for land demarcation services' },
      { name: 'Registry', description: 'Applications for property registry services' },
      { name: 'Sharja-e-Kishtwar', description: 'Applications for land ownership documents' },
      { name: 'Khasra Girdwari', description: 'Applications for land survey records' },
      { name: 'Domicile', description: 'Applications for domicile certificate' },
      { name: 'Birth Certificate', description: 'Applications for birth certificate' },
      { name: 'Death Certificate', description: 'Applications for death certificate' },
      { name: 'Driving license', description: 'Applications for driving license services' },
      { name: 'Cleanliness', description: 'Applications related to cleanliness and sanitation' },
      { name: 'General Complaints', description: 'General complaint applications' },
      { name: 'Others', description: 'Other miscellaneous applications' }
    ];

    // Clear existing data
    await ApplicationType.deleteMany({});
    console.log('🗑️  Cleared existing application types');

    // Insert new data
    const insertedTypes = await ApplicationType.insertMany(applicationTypes);
    console.log(`✅ Successfully seeded ${insertedTypes.length} application types`);

    console.log('\n📋 Seeded Application Types:');
    insertedTypes.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type.name}`);
    });

  } catch (error) {
    console.error('❌ Seeding application types error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeder
seedApplicationTypes(); 