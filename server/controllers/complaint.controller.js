const Complaint = require('../models/complaint.model');
const Customer = require('../models/customer.model');
const mongoose = require('mongoose');

/**
 * @desc    Create a new complaint
 * @route   POST /api/complaints
 * @access  Private (Operator or Agent)
 */
const createComplaint = async (req, res) => {
  try {
    const { customerId, description, assignedTo } = req.body;
    if (!customerId || !description) {
      return res
        .status(400)
        .json({ message: 'Customer and description are required.' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer || customer.operatorId.toString() !== req.user.operatorId) {
      return res
        .status(404)
        .json({ message: 'Customer not found for this operator.' });
    }

    const newComplaint = new Complaint({
      ...req.body,
      operatorId: req.user.operatorId,
      loggedBy: req.user.id,
      loggedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
    });

    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Get all complaints
 * @route   GET /api/complaints
 * @access  Private (Operator or Agent)
 */
const getComplaints = async (req, res) => {
  try {
    const { status, agentId } = req.query;
    const query = { operatorId: req.user.operatorId };

    if (status) query.status = status;
    if (agentId) query.assignedTo = agentId;

    const complaints = await Complaint.find(query)
      .populate('customerId', 'name locality')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Get a single complaint by ID
 * @route   GET /api/complaints/:id
 * @access  Private (Operator or Agent)
 */
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('customerId', 'name locality mobile')
      .populate('assignedTo', 'name')
      .populate('loggedBy', 'name');

    if (!complaint || complaint.operatorId.toString() !== req.user.operatorId) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }
    res.status(200).json(complaint);
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Update a complaint (e.g., assign it)
 * @route   PUT /api/complaints/:id
 * @access  Private (Operator or Agent)
 */
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint || complaint.operatorId.toString() !== req.user.operatorId) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Update a complaint's status
 * @route   PATCH /api/complaints/:id/status
 * @access  Private (Operator or Agent)
 */
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint || complaint.operatorId.toString() !== req.user.operatorId) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    complaint.status = status;
    if (resolutionNotes) {
      complaint.resolutionNotes = resolutionNotes;
    }
    if (status === 'Resolved' || status === 'Closed') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();
    res.status(200).json(complaint);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
};
