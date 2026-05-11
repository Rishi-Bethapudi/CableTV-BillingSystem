const express = require('express');

const multer = require('multer');

const router = express.Router();

/*
=============================================================================
CONTROLLERS
=============================================================================
*/

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  importCustomersFromExcel,
  exportCustomersToExcel,
} = require('../controllers/customer.controller');

const {
  adjustBalance,
  getCustomerTransactions,
  createAddonBilling,
} = require('../controllers/transaction.controller');

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
UPLOADS
=============================================================================
*/

const upload = multer({
  dest: 'uploads/',
});

/*
=============================================================================
GLOBAL PROTECTION
=============================================================================
*/

router.use(authMiddleware);

router.use(allowRoles('operator', 'agent'));

/*
=============================================================================
CUSTOMER CRUD
=============================================================================
*/

/**
 * CREATE CUSTOMER
 */
router.post(
  '/',

  checkPermissions('CREATE_CUSTOMERS'),

  checkAreaAccess,

  createCustomer,
);

/**
 * GET CUSTOMERS
 */
router.get(
  '/',

  checkPermissions('VIEW_CUSTOMERS'),

  getCustomers,
);

/**
 * GET SINGLE CUSTOMER
 */
router.get(
  '/:id',

  checkPermissions('VIEW_CUSTOMERS'),

  getCustomerById,
);

/**
 * UPDATE CUSTOMER
 */
router.put(
  '/:id',

  checkPermissions('EDIT_CUSTOMERS'),

  checkAreaAccess,

  updateCustomer,
);

/**
 * DELETE CUSTOMER
 */
router.delete(
  '/:id',

  checkPermissions('DELETE_CUSTOMERS'),

  deleteCustomer,
);

/*
=============================================================================
BALANCE ADJUSTMENT
=============================================================================
*/

router.post(
  '/:id/adjust-balance',

  checkPermissions('COLLECT_PAYMENT'),

  adjustBalance,
);

/*
=============================================================================
ADDON BILLING
=============================================================================
*/

router.post(
  '/transactions/addon',

  checkPermissions('COLLECT_PAYMENT'),

  createAddonBilling,
);

/*
=============================================================================
CUSTOMER TRANSACTIONS
=============================================================================
*/

router.get(
  '/:customerId/transactions',

  checkPermissions('VIEW_TRANSACTIONS'),

  getCustomerTransactions,
);

/*
=============================================================================
IMPORT CUSTOMERS
=============================================================================
*/

router.post(
  '/import',

  allowRoles('operator'),

  checkPermissions('IMPORT_CUSTOMERS'),

  upload.single('file'),

  importCustomersFromExcel,
);

/*
=============================================================================
EXPORT CUSTOMERS
=============================================================================
*/

router.get(
  '/export',

  allowRoles('operator'),

  checkPermissions('EXPORT_CUSTOMERS'),

  exportCustomersToExcel,
);

module.exports = router;
