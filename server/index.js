const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// --- Route Imports ---
const adminRoutes = require('./routes/admin.routes');
const operatorRoutes = require('./routes/operator.routes');
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const transactionRoutes = require('./routes/transaction.routes');
const complaintRoutes = require('./routes/complaint.routes');
const reportRoutes = require('./routes/reports.routes');
const expenseRoutes = require('./routes/expense.routes');
const { initCronJobs } = require('./services/scheduler.service');
// --- Load Environment Variables ---
dotenv.config();

// --- Initialize Express App ---
const app = express();

// --- Database Connection ---
connectDB();
initCronJobs();
// --- Core Middleware ---
// Enable CORS (Cross-Origin Resource Sharing)
// This is crucial for allowing your React frontend to communicate with the backend.
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:4173',
  'capacitor://localhost',
  'https://p37z1hxb-5000.inc1.devtunnels.ms/',
  'https://cable-tv-billing-system.vercel.app', // Replace with actual deployed frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse cookies, essential for handling the refresh token
app.use(cookieParser());

// --- API Routes ---
// Mount the imported route files to their specific base paths.
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/expenses', expenseRoutes);
// --- Root Endpoint for Health Check ---
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Cable TV Billing System API is running successfully.',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
app.head('/health', (req, res) => {
  res.sendStatus(200); // sends only headers
});
// --- Not Found and Error Handling Middleware ---
// Handle 404 - Not Found
app.use((req, res, next) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// Generic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// --- Server Initialization ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
