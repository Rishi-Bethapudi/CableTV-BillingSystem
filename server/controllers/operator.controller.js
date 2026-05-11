const Operator = require('../models/operator.model');
const Agent = require('../models/agent.model');
const Admin = require('../models/admin.model');

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

/*
=============================================================================
GET OPERATOR PROFILE
=============================================================================
*/

const getOperatorProfile = async (req, res) => {
  try {
    const operator = await Operator.findById(req.user.id).select(
      '-password -refreshTokens',
    );

    if (!operator) {
      return res.status(404).json({
        message: 'Operator not found',
      });
    }

    res.status(200).json(operator);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error while fetching operator profile',
    });
  }
};

/*
=============================================================================
UPDATE OPERATOR PROFILE
=============================================================================
*/

const updateOperatorProfile = async (req, res) => {
  try {
    delete req.body.password;
    delete req.body.subscription;
    delete req.body.refreshTokens;
    delete req.body.agentsAllowed;
    delete req.body.supervisorsAllowed;
    delete req.body.agentsUsed;
    delete req.body.supervisorsUsed;

    const updatedOperator = await Operator.findByIdAndUpdate(
      req.user.id,
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-password');

    res.status(200).json(updatedOperator);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error while updating profile',
    });
  }
};

/*
=============================================================================
CREATE AGENT
=============================================================================
*/

const createAgent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile,
      role,
      permissions,
      assignedAreas,
      supervisorId,
    } = req.body;

    if (!name || !password || !mobile) {
      return res.status(400).json({
        message: 'Name, password and mobile are required',
      });
    }

    /*
    -------------------------------------------------------------------------
    CHECK OPERATOR
    -------------------------------------------------------------------------
    */

    const operator = await Operator.findById(req.user.id);

    if (!operator) {
      return res.status(404).json({
        message: 'Operator not found',
      });
    }

    /*
    -------------------------------------------------------------------------
    ENFORCE AGENT LIMITS
    -------------------------------------------------------------------------
    */

    if (operator.agentsUsed >= operator.agentsAllowed) {
      return res.status(400).json({
        message: `Agent limit of ${operator.agentsAllowed} reached`,
      });
    }

    /*
    -------------------------------------------------------------------------
    CHECK EXISTING MOBILE
    -------------------------------------------------------------------------
    */

    const existingMobile = await Agent.findOne({
      mobile,
      isDeleted: false,
    });

    if (existingMobile) {
      return res.status(409).json({
        message: 'Mobile already registered',
      });
    }

    /*
    -------------------------------------------------------------------------
    CHECK EXISTING EMAIL
    -------------------------------------------------------------------------
    */

    if (email) {
      const existingEmail =
        (await Agent.findOne({ email })) ||
        (await Operator.findOne({ email })) ||
        (await Admin.findOne({ email }));

      if (existingEmail) {
        return res.status(409).json({
          message: 'Email already exists',
        });
      }
    }

    /*
    -------------------------------------------------------------------------
    HASH PASSWORD
    -------------------------------------------------------------------------
    */

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    /*
    -------------------------------------------------------------------------
    CREATE AGENT
    -------------------------------------------------------------------------
    */

    const newAgent = await Agent.create({
      operatorId: req.user.id,
      supervisorId: supervisorId || null,

      name,
      email,
      mobile,

      password: hashedPassword,

      role: role || 'field_agent',

      permissions: permissions || [],

      assignedAreas: assignedAreas || [],
    });

    /*
    -------------------------------------------------------------------------
    UPDATE OPERATOR COUNTS
    -------------------------------------------------------------------------
    */

    operator.agents.push(newAgent._id);
    operator.agentsUsed = operator.agents.length;

    await operator.save();

    /*
    -------------------------------------------------------------------------
    RESPONSE
    -------------------------------------------------------------------------
    */

    const response = newAgent.toObject();

    delete response.password;
    delete response.refreshTokens;

    res.status(201).json(response);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error while creating agent',
    });
  }
};

/*
=============================================================================
GET ALL AGENTS
=============================================================================
*/

const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find({
      operatorId: req.user.id,
      isDeleted: false,
    })
      .select('-password -refreshTokens')
      .populate('assignedAreas', 'name code')
      .populate('supervisorId', 'name');

    res.status(200).json(agents);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error while fetching agents',
    });
  }
};

/*
=============================================================================
UPDATE AGENT
=============================================================================
*/

const updateAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        message: 'Invalid agent ID',
      });
    }

    const agent = await Agent.findOne({
      _id: agentId,
      operatorId: req.user.id,
      isDeleted: false,
    });

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found',
      });
    }

    /*
    -------------------------------------------------------------------------
    PROTECTED FIELDS
    -------------------------------------------------------------------------
    */

    delete req.body.operatorId;
    delete req.body.refreshTokens;
    delete req.body.isDeleted;
    delete req.body.deletedAt;

    /*
    -------------------------------------------------------------------------
    HASH PASSWORD IF PRESENT
    -------------------------------------------------------------------------
    */

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);

      req.body.password = await bcrypt.hash(req.body.password, salt);

      req.body.passwordChangedAt = new Date();
    }

    const updatedAgent = await Agent.findByIdAndUpdate(
      agentId,
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .select('-password -refreshTokens')
      .populate('assignedAreas', 'name code');

    res.status(200).json(updatedAgent);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error while updating agent',
    });
  }
};

/*
=============================================================================
DELETE AGENT (SOFT DELETE)
=============================================================================
*/

const deleteAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        message: 'Invalid agent ID',
      });
    }

    const agent = await Agent.findOne({
      _id: agentId,
      operatorId: req.user.id,
      isDeleted: false,
    });

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found',
      });
    }

    /*
    -------------------------------------------------------------------------
    SOFT DELETE
    -------------------------------------------------------------------------
    */

    agent.isDeleted = true;
    agent.deletedAt = new Date();
    agent.status = 'inactive';

    await agent.save();

    /*
    -------------------------------------------------------------------------
    UPDATE OPERATOR COUNTS
    -------------------------------------------------------------------------
    */

    await Operator.findByIdAndUpdate(req.user.id, {
      $pull: {
        agents: agent._id,
      },
      $inc: {
        agentsUsed: -1,
      },
    });

    res.status(200).json({
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error while deleting agent',
    });
  }
};

/*
=============================================================================
CHANGE AGENT PASSWORD
=============================================================================
*/

const changeAgentPassword = async (req, res) => {
  try {
    const { agentId } = req.params;

    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        message: 'New password required',
      });
    }

    const agent = await Agent.findOne({
      _id: agentId,
      operatorId: req.user.id,
      isDeleted: false,
    });

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found',
      });
    }

    const salt = await bcrypt.genSalt(10);

    agent.password = await bcrypt.hash(newPassword, salt);

    agent.passwordChangedAt = new Date();

    await agent.save();

    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error while changing password',
    });
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
