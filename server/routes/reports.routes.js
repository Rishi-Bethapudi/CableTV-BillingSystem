const express = require('express');

const router = express.Router();

/*
=============================================================================
CONTROLLERS
=============================================================================
*/

const {
  getDashboardSummary,
  getIncomeReport,
  getDashboardStats,
  getCollectionAreaSummary,
  getCollectionDetails,
} = require('../controllers/reports.controller');

/*
=============================================================================
MIDDLEWARES
=============================================================================
*/

const authMiddleware = require('../middleware/auth.middleware');

const allowRoles = require('../middleware/role.middleware');

const checkPermissions = require('../middleware/permission.middleware');

/*
=============================================================================
GLOBAL PROTECTION
=============================================================================
*/

router.use(authMiddleware);

router.use(allowRoles('operator', 'agent'));

/*
=============================================================================
DASHBOARD
=============================================================================
*/

router.get(
  '/dashboard-summary',

  checkPermissions('VIEW_REPORTS'),

  getDashboardSummary,
);

router.get(
  '/dashboard-stats',

  checkPermissions('VIEW_REPORTS'),

  getDashboardStats,
);

/*
=============================================================================
FINANCIAL REPORTS
=============================================================================
*/

router.get(
  '/income',

  checkPermissions('VIEW_FINANCIAL_REPORTS'),

  getIncomeReport,
);

/*
=============================================================================
COLLECTION REPORTS
=============================================================================
*/

router.get(
  '/collection-area-summary',

  checkPermissions('VIEW_COLLECTION_REPORTS'),

  getCollectionAreaSummary,
);

router.get(
  '/collection-details',

  checkPermissions('VIEW_COLLECTION_REPORTS'),

  getCollectionDetails,
);

module.exports = router;
