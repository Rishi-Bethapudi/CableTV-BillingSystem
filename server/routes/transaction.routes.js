const express = require('express');
const router = express.Router();
const {
  createCollection,
  createBilling,
  getCustomerTransactions,
} = require('../controllers/transaction.controller');
const {
  authMiddleware,
  operatorOrAgentOnly,
} = require('../middleware/auth.middleware');

// All routes here are protected and can be accessed by an Operator or their Agent
router.use(authMiddleware, operatorOrAgentOnly);

/**
 * @route   POST /api/transactions/collection
 * @desc    Record a payment (collection) from a customer.
 * @access  Private (Operator or Agent)
 */
router.post('/collection', createCollection);

/**
 * @route   POST /api/transactions/billing
 * @desc    Record a charge (renewal, add-on bill) for a customer.
 * @access  Private (Operator or Agent)
 */
router.post('/billing', createBilling);

/**
 * @route   GET /api/transactions/customer/:customerId
 * @desc    Get the full ledger/transaction history for a single customer.
 * @access  Private (Operator or Agent)
 */
router.get('/customer/:customerId', getCustomerTransactions);

module.exports = router;
