const express = require('express');

const router = express.Router();

/*
=============================================================================
CONTROLLERS
=============================================================================
*/

const {
  createCollection,
  createAddonBilling,
  getTransactionDetails,
  getTransactionPDF,
} = require('../controllers/transaction.controller');

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
COLLECTIONS
=============================================================================
*/

router.post(
  '/collection',
  checkPermissions('COLLECT_PAYMENT'),
  createCollection,
);

/*
=============================================================================
ADDON BILLING
=============================================================================
*/

router.post(
  '/addon',

  checkPermissions('COLLECT_PAYMENT'),

  createAddonBilling,
);

/*
=============================================================================
TRANSACTION DETAILS
=============================================================================
*/

router.get(
  '/:id',

  checkPermissions('VIEW_TRANSACTIONS'),

  getTransactionDetails,
);

/*
=============================================================================
TRANSACTION PDF
=============================================================================
*/

router.get(
  '/:transactionId/pdf',

  checkPermissions('VIEW_TRANSACTIONS'),

  getTransactionPDF,
);

module.exports = router;
