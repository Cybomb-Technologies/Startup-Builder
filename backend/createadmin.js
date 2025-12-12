// createAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createAdmin = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'test@cybomb.com';
    const adminPassword = 'Cybomb@1234'; // Plain password for login

    // 2️⃣ Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      await mongoose.disconnect();
      return;
    }

    // 3️⃣ Create new admin with hashed password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = new Admin({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword, // Store hashed password
      companyCode: 'CYBOMB001',
      permissions: ['manage_users', 'manage_templates', 'manage_newsletter']
    });

    await admin.save();

    // 4️⃣ Log the credentials for reference
    console.log('✅ Admin created successfully');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);

    // 5️⃣ Disconnect from MongoDB
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

// Run the script
createAdmin();
