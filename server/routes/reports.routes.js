const express = require('express');
const router = express.Router();
const {
  getCollectionSummary,
  getDashboardSummary,
  getCollectionReport,
  getIncomeReport,
  getDashboardStats,
} = require('../controllers/reports.controller');
const {
  authMiddleware,
  operatorOnly,
} = require('../middleware/auth.middleware');

// All reporting routes are for Operators only
router.use(authMiddleware, operatorOnly);

/**
 * @route   GET /api/reports/collection-summary
 * @desc    Get a detailed, aggregated summary of collections over a date range.
 * @access  Private (Operator)
 * @query   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&area=...&collectedBy=...&paymentMode=...
 */
router.get('/collection-summary', getCollectionSummary);
/**
 * @route   GET /api/reports/dashboard-summary
 * @desc    Get a full summary of all key metrics for the main dashboard.
 * @access  Private (Operator)
 */
router.get('/dashboard-summary', getDashboardSummary);
/**
 * @route   GET /api/reports/collections
 * @desc    Get a detailed report of all collections with filters.
 * @access  Private (Operator only)
 * @query   ?period=today|monthly&agentId=...&method=...&area=...
 */
router.get('/collections', getCollectionReport);

/**
 * @route   GET /api/reports/income
 * @desc    Get a summary of income, costs, and profit.
 * @access  Private (Operator only)
 * @query   ?period=monthly|yearly
 */
router.get('/income', getIncomeReport);

/**
 * @route   GET /api/reports/dashboard-stats
 * @desc    Get key performance indicators (KPIs) for the operator's dashboard.
 * @access  Private (Operator only)
 */
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
