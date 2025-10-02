const mongoose = require('mongoose');
const Product = require('./models/product.model');
const products = require('./products.json');
const Customer = require('./models/customer.model');
const customers = require('./customers.json');
const Transaction = require('./models/transaction.model');
const transactions = require('./transactions.json');
async function seedProducts() {
  try {
    await mongoose.connect(
      'mongodb+srv://CableTV-Billing:xHfUOkDYo7RgK1bm@cluster0.9znc3.mongodb.net/CableTV_Billing?retryWrites=true&w=majority&appName=Cluster0'
    );

    // Add operatorId here if you already have one
    const operatorId = '68c0295cb96f5d9c9eadb918'; // replace with actual ObjectId

    const productsWithOperator = products.map((p) => ({
      ...p,
      operatorId: operatorId,
    }));

    await Product.insertMany(productsWithOperator);

    console.log('✅ Products seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedProducts();
