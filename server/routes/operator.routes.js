const express = require('express');

const router = express.Router();

/*
=============================================================================
CONTROLLERS
=============================================================================
*/

const {
  createAgent,
  getAgent,
  getAgents,
  updateAgent,
  deleteAgent,
  changeAgentPassword,
  getOperatorProfile,
  updateOperatorProfile,
} = require('../controllers/operator.controller');

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
PROFILE
=============================================================================
*/

router.get(
  '/profile',

  checkPermissions('VIEW_PROFILE'),

  getOperatorProfile,
);

router.put(
  '/profile',

  checkPermissions('EDIT_PROFILE'),

  updateOperatorProfile,
);

/*
=============================================================================
AGENTS
=============================================================================
*/

router.post(
  '/agents',

  checkPermissions('CREATE_AGENTS'),

  createAgent,
);
router.get(
  '/agents',

  checkPermissions('VIEW_AGENTS'),

  getAgents,
);
router.get('/agents/:agentId', checkPermissions('VIEW_AGENTS'), getAgent);

router.put(
  '/agents/:agentId',

  checkPermissions('EDIT_AGENTS'),

  updateAgent,
);

router.delete(
  '/agents/:agentId',

  checkPermissions('DELETE_AGENTS'),

  deleteAgent,
);

router.patch(
  '/agents/:agentId/change-password',

  checkPermissions('EDIT_AGENTS'),

  changeAgentPassword,
);

module.exports = router;
