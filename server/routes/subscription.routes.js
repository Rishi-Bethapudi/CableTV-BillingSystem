const express = require('express');

const router = express.Router();

/*
=============================================================================
CONTROLLERS
=============================================================================
*/

const {
  getCustomerSubscriptions,
  addSubscription,
  renewSubscription,
  changePlan,
  removeSubscription,
} = require('../controllers/subscription.controller');

/*
=============================================================================
MIDDLEWARES
=============================================================================
*/

const authMiddleware = require('../middleware/auth.middleware');

const allowRoles = require('../middleware/role.middleware');

const checkPermissions = require('../middleware/permission.middleware');

const checkAreaAccess = require('../middleware/areaAccess.middleware');

/*
=============================================================================
GLOBAL PROTECTION
=============================================================================
*/

router.use(authMiddleware);

router.use(allowRoles('operator', 'agent'));

/*
=============================================================================
GET CUSTOMER SUBSCRIPTIONS
=============================================================================
*/

router.get(
  '/customer/:customerId',

  checkPermissions('VIEW_SUBSCRIPTIONS'),

  getCustomerSubscriptions,
);

/*
=============================================================================
ADD SUBSCRIPTION
=============================================================================
*/

router.post(
  '/',

  checkPermissions('MANAGE_SUBSCRIPTIONS'),

  checkAreaAccess,

  addSubscription,
);

/*
=============================================================================
RENEW SUBSCRIPTION
=============================================================================
*/

router.post(
  '/:subscriptionId/renew',

  checkPermissions('MANAGE_SUBSCRIPTIONS'),

  renewSubscription,
);

/*
=============================================================================
CHANGE PLAN
=============================================================================
*/

router.post(
  '/:subscriptionId/change-plan',

  checkPermissions('MANAGE_SUBSCRIPTIONS'),

  changePlan,
);

/*
=============================================================================
REMOVE SUBSCRIPTION
=============================================================================
*/

router.delete(
  '/:subscriptionId',

  checkPermissions('MANAGE_SUBSCRIPTIONS'),

  removeSubscription,
);

module.exports = router;
