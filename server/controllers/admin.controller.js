const Operator = require('../models/operator.model');
const Agent = require('../models/agent.model');
const Admin = require('../models/admin.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

/**
 * @desc    Admin creates a new operator
 * @route   POST /api/admin/operators
 * @access  Private (Admin only)
 */
const createOperator = async (req, res) => {
  try {
    const { name, email, password, cableName, contactNumber, subscription } =
      req.body;

    if (
      !name ||
      (!email && !contactNumber) ||
      !password ||
      !cableName ||
      !subscription
    ) {
      return res.status(400).json({
        message:
          'Please provide name, email/contact, password, cableName, and subscription details.',
      });
    }

    // Check if user with this email already exists in any collection
    const existingUser =
      (await Operator.findOne({ email })) ||
      (await Agent.findOne({ email })) ||
      (await Admin.findOne({ email }));
    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'This email is already registered in the system.' });
    }

    // --- Auto-increment serialNumber ---
    // Find the operator with the highest serialNumber and add 1.
    // This is a simple but effective way to ensure uniqueness.
    const lastOperator = await Operator.findOne().sort({ serialNumber: -1 });
    const newSerialNumber = lastOperator ? lastOperator.serialNumber + 1 : 1001; // Start from 1001

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOperator = new Operator({
      name,
      email,
      contactNumber,
      password: hashedPassword,
      cableName,
      serialNumber: newSerialNumber,
      subscription: {
        startDate: new Date(subscription.startDate),
        endDate: new Date(subscription.endDate),
        status: 'active', // New operators are active by default
      },
    });

    const savedOperator = await newOperator.save();

    // Prepare response object, excluding sensitive data
    const operatorResponse = savedOperator.toObject();
    delete operatorResponse.password;

    res.status(201).json(operatorResponse);
  } catch (error) {
    console.error('Error creating operator:', error);
    res.status(500).json({ message: 'Server error while creating operator.' });
  }
};

/**
 * @desc    Admin gets all operators
 * @route   GET /api/admin/operators
 * @access  Private (Admin only)
 */
const getAllOperators = async (req, res) => {
  try {
    const operators = await Operator.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.status(200).json(operators);
  } catch (error) {
    console.error('Error fetching operators:', error);
    res.status(500).json({ message: 'Server error while fetching operators.' });
  }
};

/**
 * @desc    Admin gets a single operator by ID
 * @route   GET /api/admin/operators/:operatorId
 * @access  Private (Admin only)
 */
const getOperatorById = async (req, res) => {
  try {
    const { operatorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(operatorId)) {
      return res.status(400).json({ message: 'Invalid operator ID format.' });
    }

    const operator = await Operator.findById(operatorId).select('-password');
    if (!operator) {
      return res.status(404).json({ message: 'Operator not found.' });
    }

    res.status(200).json(operator);
  } catch (error) {
    console.error('Error fetching operator by ID:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Admin updates an operator's subscription
 * @route   PATCH /api/admin/operators/:operatorId/subscription
 * @access  Private (Admin only)
 */
const updateOperatorSubscription = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const { startDate, endDate, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(operatorId)) {
      return res.status(400).json({ message: 'Invalid operator ID format.' });
    }

    const operator = await Operator.findById(operatorId);
    if (!operator) {
      return res.status(404).json({ message: 'Operator not found.' });
    }

    // Update subscription fields if they are provided
    if (startDate) operator.subscription.startDate = new Date(startDate);
    if (endDate) operator.subscription.endDate = new Date(endDate);
    if (status) operator.subscription.status = status;

    const updatedOperator = await operator.save();

    const operatorResponse = updatedOperator.toObject();
    delete operatorResponse.password;

    res.status(200).json(operatorResponse);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res
      .status(500)
      .json({ message: 'Server error while updating subscription.' });
  }
};

module.exports = {
  createOperator,
  getAllOperators,
  getOperatorById,
  updateOperatorSubscription,
};
