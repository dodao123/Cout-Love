import { connectToDatabase } from '../src/app/api/config/initMongoDB.js';
import bcrypt from 'bcryptjs';

async function seedAdminAccounts() {
  try {
    const { db } = await connectToDatabase();
    
    // Check if admins already exist
    const existingAdmins = await db.collection('admins').countDocuments();
    if (existingAdmins > 0) {
      console.log('Admin accounts already exist. Skipping seed.');
      return;
    }

    // Create admin accounts
    const adminAccounts = [
      {
        adminAccount: 'admin',
        password: 'admin123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        adminAccount: 'superadmin',
        password: 'superadmin123',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const admin of adminAccounts) {
      const hashPassword = await bcrypt.hash(admin.password, 12);
      
      await db.collection('admins').insertOne({
        adminAccount: admin.adminAccount,
        hashPassword: hashPassword,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      });
      
      console.log(`Created admin account: ${admin.adminAccount}`);
    }

    console.log('Admin accounts seeded successfully!');
    console.log('Default accounts:');
    console.log('1. admin / admin123');
    console.log('2. superadmin / superadmin123');
    
  } catch (error) {
    console.error('Error seeding admin accounts:', error);
  }
}

// Run the seed function
seedAdminAccounts();