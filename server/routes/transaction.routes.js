const express = require('express');
const router = express.Router();
const {
  createCollection,
  createBilling,
} = require('../controllers/transaction.controller');
const {
  authMiddleware,
  operatorOrAgentOnly,
} = require('../middleware/auth.middleware');

// All routes here are protected and can be accessed by an Operator or their Agent
router.use(authMiddleware, operatorOrAgentOnly);

/**
 * @route   POST /api/transactions/billing
 * @desc    Record a charge (renewal, add-on bill) for a customer.
 * @access  Private (Operator or Agent)
 */
router.post('/billing', createBilling);
/**
 * @route   POST /api/transactions/collection
 * @desc    Record a payment (collection) from a customer.
 * @access  Private (Operator or Agent)
 */
router.post('/collection', createCollection);

module.exports = router;
