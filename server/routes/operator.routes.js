const express = require('express');
const router = express.Router();
const {
  createAgent,
  getAgents,
  updateAgent,
  deleteAgent,
  changeAgentPassword,
  getOperatorProfile,
  updateOperatorProfile,
} = require('../controllers/operator.controller');
const {
  authMiddleware,
  operatorOnly,
} = require('../middleware/auth.middleware');

// All routes in this file are for logged-in operators
router.use(authMiddleware, operatorOnly);

/*
================================================================================================
                                        OPERATOR PROFILE ROUTES
================================================================================================
*/

/**
 * @route   GET /api/operators/profile
 * @desc    Get the profile of the currently logged-in operator
 * @access  Private (Operator only)
 */
router.get('/profile', getOperatorProfile);

/**
 * @route   PUT /api/operators/profile
 * @desc    Update the profile of the currently logged-in operator
 * @access  Private (Operator only)
 */
router.put('/profile', updateOperatorProfile);

/*
================================================================================================
                                        AGENT MANAGEMENT ROUTES
================================================================================================
*/

/**
 * @route   POST /api/operators/agents
 * @desc    Create a new agent under the logged-in operator
 * @access  Private (Operator only)
 */
router.post('/agents', createAgent);

/**
 * @route   GET /api/operators/agents
 * @desc    Get all agents belonging to the logged-in operator
 * @access  Private (Operator only)
 */
router.get('/agents', getAgents);

/**
 * @route   PUT /api/operators/agents/:agentId
 * @desc    Update an agent's details
 * @access  Private (Operator only)
 */
router.put('/agents/:agentId', updateAgent);

/**
 * @route   DELETE /api/operators/agents/:agentId
 * @desc    Delete an agent
 * @access  Private (Operator only)
 */
router.delete('/agents/:agentId', deleteAgent);

/**
 * @route   PATCH /api/operators/agents/:agentId/change-password
 * @desc    Allows an operator to directly change an agent's password
 * @access  Private (Operator only)
 */
router.patch('/agents/:agentId/change-password', changeAgentPassword);

module.exports = router;
