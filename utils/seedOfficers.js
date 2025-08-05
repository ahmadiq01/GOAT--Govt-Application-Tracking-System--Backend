const mongoose = require('mongoose');
const Officer = require('../models/Officer');
require('dotenv').config();

const seedOfficers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/goat-system');
    console.log('✅ Connected to MongoDB for seeding officers');

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
    await Officer.deleteMany({});
    console.log('🗑️  Cleared existing officers');

    // Insert new data
    const insertedOfficers = await Officer.insertMany(officers);
    console.log(`✅ Successfully seeded ${insertedOfficers.length} officers`);

    console.log('\n📋 Seeded Officers:');
    insertedOfficers.forEach((officer, index) => {
      console.log(`   ${index + 1}. ${officer.name} - ${officer.designation}`);
    });

  } catch (error) {
    console.error('❌ Seeding officers error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeder
seedOfficers(); 