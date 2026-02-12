const express = require('express');
const router = express.Router();

const {
  authMiddleware,
  operatorOrAgentOnly,
} = require('../middleware/auth.middleware');

const {
  getCustomerSubscriptions,
  addSubscription,
  renewSubscription,
  changePlan,
  removeSubscription,
} = require('../controllers/subscription.controller');

/**
 * All routes are private & operator-only
 */
router.use(authMiddleware, operatorOrAgentOnly);

/**
 * ---------------------------------------------------------
 * GET CUSTOMER SUBSCRIPTIONS
 * ---------------------------------------------------------
 * @route   GET /api/subscriptions/customer/:customerId
 * @desc    Get all subscriptions (active + history) of a customer
 */
router.get('/customer/:customerId', getCustomerSubscriptions);

/**
 * ---------------------------------------------------------
 * ADD NEW SUBSCRIPTION (FIRST TIME OR ADDON)
 * ---------------------------------------------------------
 * @route   POST /api/subscriptions
 * @desc    Add new subscription with billing
 */
router.post('/', addSubscription);

/**
 * ---------------------------------------------------------
 * RENEW SUBSCRIPTION
 * ---------------------------------------------------------
 * @route   POST /api/subscriptions/:subscriptionId/renew
 * @desc    Renew an existing subscription
 */
router.post('/:subscriptionId/renew', renewSubscription);

/**
 * ---------------------------------------------------------
 * CHANGE PLAN
 * ---------------------------------------------------------
 * @route   POST /api/subscriptions/:subscriptionId/change-plan
 * @desc    Change subscription plan (creates new billing)
 */
router.post('/:subscriptionId/change-plan', changePlan);

/**
 * ---------------------------------------------------------
 * TERMINATE / REMOVE SUBSCRIPTION
 * ---------------------------------------------------------
 * @route   DELETE /api/subscriptions/:subscriptionId
 * @desc    Permanently terminate subscription
 */
router.delete('/:subscriptionId', removeSubscription);

module.exports = router;
