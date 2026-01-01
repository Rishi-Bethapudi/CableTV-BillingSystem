const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getIncomeReport,
  getDashboardStats,
  getCollectionAreaSummary,
  getCollectionDetails,
} = require('../controllers/reports.controller');
const {
  authMiddleware,
  operatorOnly,
} = require('../middleware/auth.middleware');
router.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
// All reporting routes are for Operators only
router.use(authMiddleware, operatorOnly);

/**
 * @route   GET /api/reports/dashboard-summary
 * @desc    Get a full summary of all key metrics for the main dashboard.
 * @access  Private (Operator)
 */
router.get('/dashboard-summary', getDashboardSummary);

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
router.get('/collection-area-summary', getCollectionAreaSummary);
router.get('/collection-details', getCollectionDetails);
module.exports = router;
