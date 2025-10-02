const mongoose = require('mongoose');
const Customer = require('../../models/customer.model'); // Adjust path as per your folder structure
const connectDB = require('../../config/db');
const customers = require('./customers.json'); // Your JSON file with customer data
const MONGO_URI =
  'mongodb+srv://CableTV-Billing:xHfUOkDYo7RgK1bm@cluster0.9znc3.mongodb.net/CableTV_Billing?retryWrites=true&w=majority&appName=Cluster0'; // Update with your DB URI

const operatorId = '68c0295cb96f5d9c9eadb918';

async function seedCustomers() {
  try {
    await mongoose.connect(
      'mongodb+srv://CableTV-Billing:xHfUOkDYo7RgK1bm@cluster0.9znc3.mongodb.net/CableTV_Billing?retryWrites=true&w=majority&appName=Cluster0'
    );

    const customerToSeed = customers.map((customer, index) => ({
      ...customer,
      operatorId: operatorId,
    }));
    const inserted = await Customer.insertMany(customerToSeed);
    console.log(`✅ Successfully inserted ${inserted.length} customers.`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedCustomers();
