const express = require('express');

const router = express.Router();

/*
=============================================================================
CONTROLLERS
=============================================================================
*/

const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
} = require('../controllers/complaint.controller');

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
ROUTES
=============================================================================
*/

/**
 * CREATE COMPLAINT
 */
router.post(
  '/',

  checkPermissions('CREATE_COMPLAINT'),

  checkAreaAccess,

  createComplaint,
);

/**
 * GET COMPLAINTS
 */
router.get(
  '/',

  checkPermissions('VIEW_COMPLAINTS'),

  getComplaints,
);

/**
 * GET SINGLE COMPLAINT
 */
router.get(
  '/:id',

  checkPermissions('VIEW_COMPLAINTS'),

  getComplaintById,
);

/**
 * UPDATE COMPLAINT
 */
router.put(
  '/:id',

  checkPermissions('UPDATE_COMPLAINT'),

  updateComplaint,
);

/**
 * UPDATE STATUS
 */
router.patch(
  '/:id/status',

  checkPermissions('UPDATE_COMPLAINT_STATUS'),

  updateComplaintStatus,
);

module.exports = router;
