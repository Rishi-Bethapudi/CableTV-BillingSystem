// routes/operator.routes.js

const express = require('express');

const router = express.Router();

/*
=============================================================================
CONTROLLERS
=============================================================================
*/

const {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  updateAgentPermissions,
  updateAgentAreas,
  updateAgentStatus,
  resetAgentPassword,
  loginAsAgent,
  deleteAgent,
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
AGENT CRUD
=============================================================================
*/

router.post('/agents', checkPermissions('CREATE_AGENTS'), createAgent);

router.get('/agents', checkPermissions('VIEW_AGENTS'), getAgents);

router.get('/agents/:agentId', checkPermissions('VIEW_AGENTS'), getAgentById);

router.patch('/agents/:agentId', checkPermissions('EDIT_AGENTS'), updateAgent);

router.delete(
  '/agents/:agentId',
  checkPermissions('DELETE_AGENTS'),
  deleteAgent,
);

/*
=============================================================================
AGENT PERMISSIONS
=============================================================================
*/

router.patch(
  '/agents/:agentId/permissions',
  checkPermissions('EDIT_AGENTS'),
  updateAgentPermissions,
);

/*
=============================================================================
AGENT AREA ASSIGNMENT
=============================================================================
*/

router.patch(
  '/agents/:agentId/areas',
  checkPermissions('ASSIGN_AREAS'),
  updateAgentAreas,
);

/*
=============================================================================
AGENT STATUS
=============================================================================
*/

router.patch(
  '/agents/:agentId/status',
  checkPermissions('EDIT_AGENTS'),
  updateAgentStatus,
);

/*
=============================================================================
RESET AGENT PASSWORD
=============================================================================
*/

router.post(
  '/agents/:agentId/reset-password',
  checkPermissions('EDIT_AGENTS'),
  resetAgentPassword,
);

/*
=============================================================================
LOGIN AS AGENT
=============================================================================
*/

router.post(
  '/agents/:agentId/impersonate',
  checkPermissions('VIEW_AGENTS'),
  loginAsAgent,
);

module.exports = router;
