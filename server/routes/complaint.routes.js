const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
} = require('../controllers/complaint.controller');
const {
  authMiddleware,
  operatorOrAgentOnly,
} = require('../middleware/auth.middleware');

// Complaints can be managed by operators or agents
router.use(authMiddleware, operatorOrAgentOnly);

/**
 * @route   POST /api/complaints
 * @desc    Log a new customer complaint
 * @access  Private (Operator or Agent)
 */
router.post('/', createComplaint);

/**
 * @route   GET /api/complaints
 * @desc    Get all complaints with filtering
 * @access  Private (Operator or Agent)
 */
router.get('/', getComplaints);

/**
 * @route   GET /api/complaints/:id
 * @desc    Get a single complaint by its ID
 * @access  Private (Operator or Agent)
 */
router.get('/:id', getComplaintById);

/**
 * @route   PUT /api/complaints/:id
 * @desc    Update a complaint's details (e.g., assign to an agent)
 * @access  Private (Operator or Agent)
 */
router.put('/:id', updateComplaint);

/**
 * @route   PATCH /api/complaints/:id/status
 * @desc    Update only the status of a complaint (e.g., resolve it)
 * @access  Private (Operator or Agent)
 */
router.patch('/:id/status', updateComplaintStatus);

module.exports = router;
