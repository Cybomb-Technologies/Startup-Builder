import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@startup.com';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create new admin
    const admin = new Admin({
      name: 'Admin User',
      email: adminEmail,
      password: 'admin123', // hashed automatically by pre-save hook
      isAdmin: true
    });

    await admin.save();
    console.log('✅ Admin created successfully');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password: admin123');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
