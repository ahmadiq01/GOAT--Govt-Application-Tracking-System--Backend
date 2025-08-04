const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/goat-system');
    console.log('✅ Connected to MongoDB for seeding');

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  SuperAdmin already exists, checking for other users...');
    } else {
      // Create superadmin user
      const superAdmin = new User({
        username: 'superadmin',
        email: 'superadmin@goat.gov.pk',
        nic: '1234567890123',
        phoneNo: '+92-300-1234567',
        password: 'SuperAdmin123!',
        role: 'superadmin',
        department: 'System Administration',
        designation: 'Super Administrator',
        isActive: true
      });

      await superAdmin.save();
      console.log('✅ SuperAdmin created successfully!');
    }

    // Create dummy admins
    const dummyAdmins = [
      {
        username: 'admin1',
        email: 'admin1@goat.gov.pk',
        nic: '1234567890124',
        phoneNo: '+92-300-1234568',
        password: 'Admin123!',
        role: 'admin',
        department: 'IT Department',
        designation: 'System Administrator',
        isActive: true
      }
    ];

    for (const adminData of dummyAdmins) {
      const existingAdmin = await User.findOne({ 
        $or: [{ username: adminData.username }, { email: adminData.email }, { nic: adminData.nic }] 
      });
      
      if (!existingAdmin) {
        const admin = new User(adminData);
        await admin.save();
        console.log(`✅ Admin created: ${adminData.username}`);
      } else {
        console.log(`⚠️  Admin already exists: ${adminData.username}`);
      }
    }

    for (const userData of dummyUsers) {
      const existingUser = await User.findOne({ 
        $or: [{ username: userData.username }, { email: userData.email }, { nic: userData.nic }] 
      });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ User created: ${userData.username} (NIC: ${userData.nic})`);
      } else {
        console.log(`⚠️  User already exists: ${userData.username}`);
      }
    }

    console.log('\n📋 Login Credentials:');
    console.log('\n🔐 SuperAdmin:');
    console.log('   Username: superadmin');
    console.log('   Email: superadmin@goat.gov.pk');
    console.log('   Password: SuperAdmin123!');
    console.log('   NIC: 1234567890123');
    console.log('   Phone: +92-300-1234567');

    console.log('\n👨‍💼 Admins:');
    console.log('   1. Username: admin1, Password: Admin123!, NIC: 1234567890124');
    console.log('   2. Username: admin2, Password: Admin123!, NIC: 1234567890125');
    console.log('   3. Username: admin3, Password: Admin123!, NIC: 1234567890126');

    console.log('\n👤 Users (Login with NIC as username, phone as password):');
    console.log('   1. NIC: 1234567890127, Phone: +92-300-1234571');
    console.log('   2. NIC: 1234567890128, Phone: +92-300-1234572');
    console.log('   3. NIC: 1234567890129, Phone: +92-300-1234573');
    console.log('   4. NIC: 1234567890130, Phone: +92-300-1234574');
    console.log('   5. NIC: 1234567890131, Phone: +92-300-1234575');

    console.log('\n🔐 Please change the passwords after first login!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeder
seedData(); 