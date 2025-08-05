const mongoose = require('mongoose');
const ApplicationType = require('../models/ApplicationType');
const Officer = require('../models/Officer');
require('dotenv').config();

const seedAll = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/goat-system');
    console.log('✅ Connected to MongoDB for seeding all data');

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

    // Officers data from the image
    const officers = [
      { name: 'DC Office', office: 'dc office', designation: 'Deputy Commissioner Office' },
      { name: 'AC Office', office: 'ac office', designation: 'Assistant Commissioner Office' },
      { name: 'Saholat Center', office: 'Saholat Center', designation: 'Saholat Center' },
      { name: 'Dispatch Branch', office: 'Dispatch Branch', designation: 'Dispatch Branch' },
      { name: 'ADC (G) Bannu', office: 'ADC (G) Bannu', designation: 'Additional Deputy Commissioner (General) Bannu' },
      { name: 'ADC (F) Bannu', office: 'ADC (F) Bannu', designation: 'Additional Deputy Commissioner (Finance) Bannu' },
      { name: 'AC Bannu', office: 'AC Bannu', designation: 'Assistant Commissioner Bannu' },
      { name: 'AC SDW', office: 'AC SDW', designation: 'Assistant Commissioner SDW' },
      { name: 'AAC-I', office: 'AAC-I', designation: 'Additional Assistant Commissioner I' },
      { name: 'AAC-II', office: 'AAC-II', designation: 'Additional Assistant Commissioner II' },
      { name: 'AAC-III', office: 'AAC-III', designation: 'Additional Assistant Commissioner III' },
      { name: 'AAC-IV', office: 'AAC-IV', designation: 'Additional Assistant Commissioner IV' },
      { name: 'AAC-Revenue', office: 'AAC-Revenue', designation: 'Additional Assistant Commissioner Revenue' },
      { name: 'Supdtt Branch', office: 'Supdtt Branch', designation: 'Superintendent Branch' }
    ];

    // Clear existing data
    await ApplicationType.deleteMany({});
    await Officer.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert new data
    const insertedTypes = await ApplicationType.insertMany(applicationTypes);
    const insertedOfficers = await Officer.insertMany(officers);
    
    console.log(`✅ Successfully seeded ${insertedTypes.length} application types`);
    console.log(`✅ Successfully seeded ${insertedOfficers.length} officers`);

    console.log('\n📋 Seeded Application Types:');
    insertedTypes.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type.name}`);
    });

    console.log('\n📋 Seeded Officers:');
    insertedOfficers.forEach((officer, index) => {
      console.log(`   ${index + 1}. ${officer.name} - ${officer.designation}`);
    });

    console.log('\n🚀 API Endpoints:');
    console.log('   GET /api/application-types - Get all application types');
    console.log('   GET /api/officers - Get all officers');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeder
seedAll(); 