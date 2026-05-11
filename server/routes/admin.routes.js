const express = require('express');

const router = express.Router();

/*
=============================================================================
CONTROLLERS
=============================================================================
*/

const {
  createOperator,
  getAllOperators,
  getOperatorById,
  updateOperatorSubscription,
} = require('../controllers/admin.controller');

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
GLOBAL ROUTE PROTECTION
=============================================================================
*/

router.use(authMiddleware);

router.use(allowRoles('admin'));

/*
=============================================================================
ADMIN OPERATOR MANAGEMENT
=============================================================================
*/

/**
 * @route   POST /api/v1/admin/operators
 * @desc    Create new operator (tenant)
 * @access  Admin
 */
router.post(
  '/operators',

  checkPermissions('CREATE_OPERATOR'),

  createOperator,
);

/**
 * @route   GET /api/v1/admin/operators
 * @desc    Get all operators
 * @access  Admin
 */
router.get(
  '/operators',

  checkPermissions('VIEW_OPERATORS'),

  getAllOperators,
);

/**
 * @route   GET /api/v1/admin/operators/:operatorId
 * @desc    Get single operator details
 * @access  Admin
 */
router.get(
  '/operators/:operatorId',

  checkPermissions('VIEW_OPERATORS'),

  getOperatorById,
);

/**
 * @route   PATCH /api/v1/admin/operators/:operatorId/subscription
 * @desc    Update operator subscription
 * @access  Admin
 */
router.patch(
  '/operators/:operatorId/subscription',

  checkPermissions('MANAGE_SUBSCRIPTIONS'),

  updateOperatorSubscription,
);

module.exports = router;
