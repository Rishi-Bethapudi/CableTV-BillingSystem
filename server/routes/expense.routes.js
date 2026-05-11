const express = require('express');

const router = express.Router();

/*
=============================================================================
CONTROLLERS
=============================================================================
*/

const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require('../controllers/expense.controller');

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

router.use(allowRoles('operator'));

/*
=============================================================================
ROUTES
=============================================================================
*/

router.post(
  '/',

  checkPermissions('CREATE_EXPENSE'),

  createExpense,
);

router.get(
  '/',

  checkPermissions('VIEW_EXPENSES'),

  getExpenses,
);

router.get(
  '/:id',

  checkPermissions('VIEW_EXPENSES'),

  getExpenseById,
);

router.put(
  '/:id',

  checkPermissions('EDIT_EXPENSE'),

  updateExpense,
);

router.delete(
  '/:id',

  checkPermissions('DELETE_EXPENSE'),

  deleteExpense,
);

module.exports = router;
