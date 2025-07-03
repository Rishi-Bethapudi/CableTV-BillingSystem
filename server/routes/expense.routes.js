const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require('../controllers/expense.controller');
const {
  authMiddleware,
  operatorOnly,
} = require('../middleware/auth.middleware');

// All expense routes are for Operators only
router.use(authMiddleware, operatorOnly);

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense record
 * @access  Private (Operator only)
 */
router.post('/', createExpense);

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses for the operator, with filtering
 * @access  Private (Operator only)
 */
router.get('/', getExpenses);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an existing expense record
 * @access  Private (Operator only)
 */
router.put('/:id', updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense record
 * @access  Private (Operator only)
 */
router.delete('/:id', deleteExpense);

module.exports = router;
