const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined.');
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connection successful.');

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected.');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`Mongoose connection error: ${err.message}`);
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection closed due to app termination.');
      process.exit(0);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
