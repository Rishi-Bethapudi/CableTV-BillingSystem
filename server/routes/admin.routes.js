const express = require('express');
const router = express.Router();
const {
  createOperator,
  getAllOperators,
  getOperatorById,
  updateOperatorSubscription,
} = require('../controllers/admin.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth.middleware');

// Apply auth and admin-only middleware to all routes in this file
router.use(authMiddleware, adminOnly);

/**
 * @route   POST /api/admin/operators
 * @desc    Admin creates a new operator (tenant)
 * @access  Private (Admin only)
 */
router.post('/operators', createOperator);

/**
 * @route   GET /api/admin/operators
 * @desc    Admin gets a list of all operators
 * @access  Private (Admin only)
 */
router.get('/operators', getAllOperators);

/**
 * @route   GET /api/admin/operators/:operatorId
 * @desc    Admin gets a single operator's details
 * @access  Private (Admin only)
 */
router.get('/operators/:operatorId', getOperatorById);

/**
 * @route   PATCH /api/admin/operators/:operatorId/subscription
 * @desc    Admin updates an operator's subscription status or dates
 * @access  Private (Admin only)
 */
router.patch('/operators/:operatorId/subscription', updateOperatorSubscription);

module.exports = router;
