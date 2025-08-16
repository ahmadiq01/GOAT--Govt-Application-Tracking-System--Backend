const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/goat-system');
    console.log('✅ Connected to MongoDB for seeding');

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  SuperAdmin already exists, checking for other users...');
    } else {
      // Create superadmin user
      const superAdmin = new User({
        name: 'Super Admin',
        username: 'superadmin',
        email: 'superadmin@goat.gov.pk',
        nic: '1234567890123',
        phoneNo: '+92-300-1234567',
        password: 'SuperAdmin123!', // You might want to hash this
        role: 'superadmin',
        department: 'System Administration',
        designation: 'Super Administrator',
        isActive: true
      });

      await superAdmin.save();
      console.log('✅ SuperAdmin created successfully!');
    }

    // Dummy admins
    const dummyAdmins = [
      {
        name: 'Admin One',
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

    // Dummy users
    const dummyUsers = [
      {
        name: 'User One',
        username: 'user1',
        address: '123 Main St, Anytown, USA',
        email: 'user1@goat.gov.pk',
        nic: '1234567890127',
        phoneNo: '+92-300-1234571',
        password: '+92-300-1234571',
        role: 'user',
        isActive: true
      },
      {
        name: 'User Two',
        username: 'user2',
        address: '456 Oak St, Somewhere, USA',
        email: 'user2@goat.gov.pk',
        nic: '1234567890128',
        phoneNo: '+92-300-1234572',
        password: '+92-300-1234572',
        role: 'user',
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

    console.log('\n👤 Users (Login with NIC as username, phone as password):');
    console.log('   1. Username: user1, Password: +92-300-1234571, NIC: 1234567890127');
    console.log('   2. Username: user2, Password: +92-300-1234572, NIC: 1234567890128');

    console.log('\n🔐 Please change the passwords after first login!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

seedData();
