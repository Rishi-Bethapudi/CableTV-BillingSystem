const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('../../config/db');
const Admin = require('../../models/admin.model');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const seedAdmin = async () => {
  try {
    // --- DEFINE YOUR ADMIN CREDENTIALS HERE ---
    const adminEmail = 'admin@cableTV.com';
    const adminPassword = 'password123'; // Use a strong password in production
    // -----------------------------------------

    // Check if an admin already exists
    const adminExists = await Admin.findOne({ email: adminEmail });

    if (adminExists) {
      console.log('Admin user already exists. No action taken.');
      process.exit();
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create the new admin user
    const newAdmin = new Admin({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
    });

    await newAdmin.save();

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    process.exit();
  } catch (error) {
    console.error(`❌ Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder function
seedAdmin();
