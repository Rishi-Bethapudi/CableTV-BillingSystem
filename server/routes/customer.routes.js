const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  importCustomersFromExcel,
  exportCustomersToExcel,
} = require('../controllers/customer.controller'); // Assuming controller functions are defined elsewhere
const {
  adjustBalance,
  getCustomerTransactions,
  createAddonBilling,
} = require('../controllers/transaction.controller');
const {
  authMiddleware,
  operatorOnly,
  operatorOrAgentOnly,
} = require('../middleware/auth.middleware');

// Multer middleware for handling file uploads (for Excel import)
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // A temporary folder for uploads

/*
================================================================================================
                                        CUSTOMER CRUD ROUTES
================================================================================================
*/

/**
 * @route   POST /api/customers
 * @desc    Create a new customer for the logged-in operator
 * @access  Private (Operator only)
 * @note    The controller will use `req.user.id` as the `operatorId` to ensure
 * the new customer is correctly associated with the correct tenant.
 */
router.post('/', authMiddleware, operatorOnly, createCustomer);

/**
 * @route   GET /api/customers
 * @desc    Get all customers for the logged-in operator. Supports pagination and filtering.
 * @access  Private (Operator or Agent)
 * @note    The controller will use `req.user.operatorId` to query the database,
 * ensuring an operator/agent can only see customers from their own organization.
 * Example Query: /api/customers?page=1&limit=10&search=John&status=active
 */
router.get('/', authMiddleware, operatorOrAgentOnly, getCustomers);
// router.get('/', getCustomers);

/**
 * @route   GET /api/customers/:id
 * @desc    Get a single customer by their ID
 * @access  Private (Operator or Agent)
 * @note    CRITICAL: The controller MUST verify that the requested customer's `operatorId`
 * matches `req.user.operatorId` to prevent data leakage between tenants.
 */
router.get('/:id', authMiddleware, operatorOrAgentOnly, getCustomerById);

/**
 * @route   PUT /api/customers/:id
 * @desc    Update a customer's details
 * @access  Private (Operator only)
 * @note    The controller must also perform the same check as GET /:id to ensure
 * an operator can only update customers within their own tenant.
 */
router.put('/:id', authMiddleware, operatorOnly, updateCustomer);

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete a customer
 * @access  Private (Operator only)
 * @note    The controller must also perform the same check as GET /:id.
 */
router.delete('/:id', authMiddleware, operatorOnly, deleteCustomer);

// @route   POST /api/customers/:id/adjust-balance
router.post(
  '/:id/adjust-balance',
  authMiddleware,
  operatorOrAgentOnly,
  adjustBalance
);

// @route   POST /api/customers/:id/additionalCharge
router.post(
  '/transactions/addon',
  authMiddleware,
  operatorOrAgentOnly,
  createAddonBilling
);

/**
 * @route   GET /api/customers/:customerId/transactions
 * @desc    Get the full ledger/transaction history for a single customer.
 * @access  Private (Operator or Agent)
 */
router.get(
  '/:customerId/transactions',
  authMiddleware,
  operatorOrAgentOnly,
  getCustomerTransactions
);

/*
================================================================================================
                                    SPECIALIZED CUSTOMER ROUTES
================================================================================================
*/

/**
 * @route   POST /api/customers/import
 * @desc    Bulk import customers from an Excel file
 * @access  Private (Operator only)
 * @note    Uses multer middleware to handle the 'file' field from a multipart/form-data request.
 */
router.post(
  '/import',
  authMiddleware,
  operatorOnly,
  upload.single('file'),
  importCustomersFromExcel
);

/**
 * @route   GET /api/customers/export
 * @desc    Export all of an operator's customers to an Excel file
 * @access  Private (Operator only)
 */
router.get('/export', authMiddleware, operatorOnly, exportCustomersToExcel);

module.exports = router;
