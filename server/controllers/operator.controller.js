const Operator = require('../models/operator.model');
const Agent = require('../models/agent.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

/*
================================================================================================
                                        OPERATOR PROFILE LOGIC
================================================================================================
*/

/**
 * @desc    Get the profile of the logged-in operator
 * @route   GET /api/operators/profile
 * @access  Private (Operator only)
 */
const getOperatorProfile = async (req, res) => {
  try {
    // req.user.id is the operator's ID from the JWT token
    const operator = await Operator.findById(req.user.id).select(
      '-password -resetPasswordOtp -resetPasswordExpires'
    );

    if (!operator) {
      return res.status(404).json({ message: 'Operator profile not found.' });
    }

    res.status(200).json(operator);
  } catch (error) {
    console.error('Error fetching operator profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

/**
 * @desc    Update the profile of the logged-in operator
 * @route   PUT /api/operators/profile
 * @access  Private (Operator only)
 */
const updateOperatorProfile = async (req, res) => {
  try {
    // Fields that should not be updatable via this route
    delete req.body.password;
    delete req.body.subscription;
    delete req.body.serialNumber;
    delete req.body.role;

    const updatedOperator = await Operator.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedOperator) {
      return res.status(404).json({ message: 'Operator not found.' });
    }

    res.status(200).json(updatedOperator);
  } catch (error) {
    console.error('Error updating operator profile:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

/*
================================================================================================
                                        AGENT MANAGEMENT LOGIC
================================================================================================
*/

/**
 * @desc    Create a new agent under the logged-in operator
 * @route   POST /api/operators/agents
 * @access  Private (Operator only)
 */
const createAgent = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({
        message:
          'Please provide name, email, password, and mobile for the agent.',
      });
    }

    // Check if an agent with this email already exists for this operator
    const existingAgent = await Agent.findOne({
      email,
      operatorId: req.user.id,
    });
    if (existingAgent) {
      return res.status(409).json({
        message: 'An agent with this email already exists under your account.',
      });
    }

    // Also check if email is used by an operator or admin
    const otherUser =
      (await Operator.findOne({ email })) ||
      (await require('../models/admin.model').findOne({ email }));
    if (otherUser) {
      return res
        .status(409)
        .json({ message: 'This email is already registered in the system.' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAgent = new Agent({
      name,
      email,
      password: hashedPassword,
      mobile,
      operatorId: req.user.id, // Link agent to the operator creating them
    });

    const savedAgent = await newAgent.save();

    // Don't send the password back in the response
    const agentResponse = savedAgent.toObject();
    delete agentResponse.password;

    res.status(201).json(agentResponse);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ message: 'Server error while creating agent.' });
  }
};

/**
 * @desc    Get all agents for the logged-in operator
 * @route   GET /api/operators/agents
 * @access  Private (Operator only)
 */
const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ operatorId: req.user.id }).select(
      '-password'
    );
    res.status(200).json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Server error while fetching agents.' });
  }
};

/**
 * @desc    Update an agent's details
 * @route   PUT /api/operators/agents/:agentId
 * @access  Private (Operator only)
 */
const updateAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ message: 'Invalid agent ID format.' });
    }

    // Prevent password from being updated here
    delete req.body.operatorId;

    const agent = await Agent.findOne({
      _id: agentId,
      operatorId: req.user.id,
    });

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found or you do not have permission to update.',
      });
    }
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;
    }
    const updatedAgent = await Agent.findByIdAndUpdate(
      agentId,
      { $set: req.body },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ message: 'Server error while updating agent.' });
  }
};

/**
 * @desc    Delete an agent
 * @route   DELETE /api/operators/agents/:agentId
 * @access  Private (Operator only)
 */
const deleteAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ message: 'Invalid agent ID format.' });
    }

    const agent = await Agent.findOne({
      _id: agentId,
      operatorId: req.user.id,
    });

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found or you do not have permission to delete.',
      });
    }

    await Agent.findByIdAndDelete(agentId);

    // Optional: Unassign this agent from any customers
    await Customer.updateMany({ agent: agentId }, { $unset: { agent: '' } });

    res.status(200).json({ message: 'Agent deleted successfully.' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ message: 'Server error while deleting agent.' });
  }
};

/**
 * @desc    Allows an operator to directly change an agent's password
 * @route   PATCH /api/operators/agents/:agentId/change-password
 * @access  Private (Operator only)
 */
const changeAgentPassword = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required.' });
    }
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ message: 'Invalid agent ID format.' });
    }

    const agent = await Agent.findOne({
      _id: agentId,
      operatorId: req.user.id,
    });

    if (!agent) {
      return res
        .status(404)
        .json({ message: 'Agent not found or you do not have permission.' });
    }

    const salt = await bcrypt.genSalt(10);
    agent.password = await bcrypt.hash(newPassword, salt);
    await agent.save();

    res.status(200).json({ message: "Agent's password updated successfully." });
  } catch (error) {
    console.error("Error changing agent's password:", error);
    res
      .status(500)
      .json({ message: "Server error while changing agent's password." });
  }
};

module.exports = {
  getOperatorProfile,
  updateOperatorProfile,
  createAgent,
  getAgents,
  updateAgent,
  deleteAgent,
  changeAgentPassword,
};
