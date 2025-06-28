const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Cable TV Billing System API is running successfully.',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
