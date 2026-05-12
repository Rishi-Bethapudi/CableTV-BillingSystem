const Operator = require('../models/operator.model');
const Agent = require('../models/agent.model');
const Admin = require('../models/admin.model');
const { getDefaultPermissions } = require('../utils/permissions');
const Transaction = require('../models/transaction.model');
const Customer = require('../models/customer.model');
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
    const { name, email, password, mobile, role } = req.body;

    /*
    =========================================================================
    VALIDATION
    =========================================================================
    */

    if (!name || !mobile || !password) {
      return res.status(400).json({
        message: 'Name, mobile and password are required',
      });
    }

    /*
    =========================================================================
    PASSWORD VALIDATION
    =========================================================================
    */

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters',
      });
    }

    /*
    =========================================================================
    OPERATOR VALIDATION
    =========================================================================
    */

    const operator = await Operator.findById(req.user.id);

    if (!operator) {
      return res.status(404).json({
        message: 'Operator not found',
      });
    }

    /*
    =========================================================================
    AGENT LIMIT CHECK
    =========================================================================
    */

    if (operator.agentsUsed >= operator.agentsAllowed) {
      return res.status(400).json({
        message: `Agent limit of ${operator.agentsAllowed} reached`,
      });
    }

    /*
    =========================================================================
    MOBILE DUPLICATE CHECK
    =========================================================================
    */

    const existingMobile = await Agent.findOne({
      mobile,
      isDeleted: false,
    });

    if (existingMobile) {
      return res.status(409).json({
        message: 'Mobile number already registered',
      });
    }

    /*
    =========================================================================
    EMAIL DUPLICATE CHECK
    =========================================================================
    */

    if (email) {
      const existingEmail =
        (await Agent.findOne({
          email,
          isDeleted: false,
        })) ||
        (await Operator.findOne({
          email,
        })) ||
        (await Admin.findOne({
          email,
        }));

      if (existingEmail) {
        return res.status(409).json({
          message: 'Email already exists',
        });
      }
    }

    /*
    =========================================================================
    HASH PASSWORD
    =========================================================================
    */

    const hashedPassword = await bcrypt.hash(password, 10);

    /*
    =========================================================================
    EMPLOYEE CODE
    =========================================================================
    */

    const employeeCode = `AG-${Date.now().toString().slice(-6)}`;

    /*
    =========================================================================
    ROLE
    =========================================================================
    */

    const finalRole = role || 'field_agent';

    /*
    =========================================================================
    CREATE AGENT
    =========================================================================
    */

    const newAgent = await Agent.create({
      operatorId: req.user.id,

      name: name.trim(),

      email: email?.trim()?.toLowerCase(),

      mobile: mobile.trim(),

      password: hashedPassword,

      role: finalRole,

      employeeCode,

      permissions: getDefaultPermissions(finalRole),

      accessScope: 'assigned',

      assignedAreas: [],

      status: 'active',
    });

    /*
    =========================================================================
    UPDATE OPERATOR COUNTS
    =========================================================================
    */

    operator.agents.push(newAgent._id);

    operator.agentsUsed = operator.agents.length;

    await operator.save();

    /*
    =========================================================================
    RESPONSE
    =========================================================================
    */

    return res.status(201).json({
      message: 'Agent created successfully',

      agent: newAgent,
    });
  } catch (error) {
    console.error('CREATE AGENT ERROR:', error);

    return res.status(500).json({
      message: 'Server error while creating agent',
    });
  }
};

/*
=============================================================================
GET SINGLE AGENT DETAILS
=============================================================================
*/

const getAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    /*
    -------------------------------------------------------------------------
    VALIDATE OBJECT ID
    -------------------------------------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({
        message: 'Invalid agent ID',
      });
    }

    /*
    -------------------------------------------------------------------------
    FETCH AGENT
    -------------------------------------------------------------------------
    */

    const agent = await Agent.findOne({
      _id: agentId,
      operatorId: req.user.id,
      isDeleted: false,
    }).select('-password -refreshTokens');

    if (!agent) {
      return res.status(404).json({
        message: 'Agent not found',
      });
    }

    /*
    -------------------------------------------------------------------------
    COLLECTION STATS
    -------------------------------------------------------------------------
    */

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(
      todayStart.getFullYear(),
      todayStart.getMonth(),
      1,
    );

    const [
      totalCollections,
      todayCollections,
      monthCollections,
      totalAmountResult,
      todayAmountResult,
      monthAmountResult,
      recentTransactions,
      customerCount,
    ] = await Promise.all([
      /*
      -----------------------------------------------------------------------
      TOTAL COLLECTION COUNT
      -----------------------------------------------------------------------
      */

      Transaction.countDocuments({
        collectedBy: agent._id,
        type: 'collection',
      }),

      /*
      -----------------------------------------------------------------------
      TODAY COLLECTION COUNT
      -----------------------------------------------------------------------
      */

      Transaction.countDocuments({
        collectedBy: agent._id,
        type: 'collection',
        createdAt: {
          $gte: todayStart,
        },
      }),

      /*
      -----------------------------------------------------------------------
      MONTH COLLECTION COUNT
      -----------------------------------------------------------------------
      */

      Transaction.countDocuments({
        collectedBy: agent._id,
        type: 'collection',
        createdAt: {
          $gte: monthStart,
        },
      }),

      /*
      -----------------------------------------------------------------------
      TOTAL AMOUNT
      -----------------------------------------------------------------------
      */

      Transaction.aggregate([
        {
          $match: {
            collectedBy: agent._id,
            type: 'collection',
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$amount',
            },
          },
        },
      ]),

      /*
      -----------------------------------------------------------------------
      TODAY AMOUNT
      -----------------------------------------------------------------------
      */

      Transaction.aggregate([
        {
          $match: {
            collectedBy: agent._id,
            type: 'collection',
            createdAt: {
              $gte: todayStart,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$amount',
            },
          },
        },
      ]),

      /*
      -----------------------------------------------------------------------
      MONTH AMOUNT
      -----------------------------------------------------------------------
      */

      Transaction.aggregate([
        {
          $match: {
            collectedBy: agent._id,
            type: 'collection',
            createdAt: {
              $gte: monthStart,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$amount',
            },
          },
        },
      ]),

      /*
      -----------------------------------------------------------------------
      RECENT TRANSACTIONS
      -----------------------------------------------------------------------
      */

      Transaction.find({
        collectedBy: agent._id,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select(
          'amount paymentMethod status customerId createdAt transactionId',
        )
        .populate('customerId', 'name mobile localArea'),

      /*
      -----------------------------------------------------------------------
      CUSTOMER COUNT
      -----------------------------------------------------------------------
      */

      Customer.countDocuments({
        operatorId: req.user.id,
        localArea: {
          $in: agent.assignedAreas || [],
        },
      }),
    ]);

    /*
    -------------------------------------------------------------------------
    RESPONSE
    -------------------------------------------------------------------------
    */

    res.status(200).json({
      agent,

      stats: {
        totalCollections,
        todayCollections,
        monthCollections,

        totalAmountCollected: totalAmountResult[0]?.total || 0,

        todayAmount: todayAmountResult[0]?.total || 0,

        monthAmount: monthAmountResult[0]?.total || 0,

        totalCustomers: customerCount,
      },

      recentTransactions,
    });
  } catch (error) {
    console.error('GET AGENT ERROR:', error);

    res.status(500).json({
      message: 'Server error while fetching agent',
    });
  }
};
/*
=============================================================================
GET AGENTS
=============================================================================
*/

const getAgents = async (req, res) => {
  try {
    /*
    =============================================================================
    FETCH AGENTS
    =============================================================================
    */

    const agents = await Agent.find({
      operatorId: req.user.id,

      isDeleted: false,
    })
      .select('-password -refreshTokens')
      .sort({
        createdAt: -1,
      })
      .lean();

    /*
    =============================================================================
    COLLECTION ANALYTICS
    =============================================================================
    */

    const enrichedAgents = await Promise.all(
      agents.map(async (agent) => {
        /*
            ---------------------------------------------------------------------
            TOTAL COLLECTION
            ---------------------------------------------------------------------
            */

        const totalCollectionAgg = await Transaction.aggregate([
          {
            $match: {
              collectedBy: agent._id,

              type: 'collection',
            },
          },

          {
            $group: {
              _id: null,

              total: {
                $sum: '$amount',
              },
            },
          },
        ]);

        /*
            ---------------------------------------------------------------------
            MONTHLY COLLECTION
            ---------------------------------------------------------------------
            */

        const startOfMonth = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        );

        const monthlyCollectionAgg = await Transaction.aggregate([
          {
            $match: {
              collectedBy: agent._id,

              type: 'collection',

              createdAt: {
                $gte: startOfMonth,
              },
            },
          },

          {
            $group: {
              _id: null,

              total: {
                $sum: '$amount',
              },
            },
          },
        ]);

        /*
            ---------------------------------------------------------------------
            TODAY COLLECTION
            ---------------------------------------------------------------------
            */

        const startOfToday = new Date();

        startOfToday.setHours(0, 0, 0, 0);

        const todaysCollectionAgg = await Transaction.aggregate([
          {
            $match: {
              collectedBy: agent._id,

              type: 'collection',

              createdAt: {
                $gte: startOfToday,
              },
            },
          },

          {
            $group: {
              _id: null,

              total: {
                $sum: '$amount',
              },
            },
          },
        ]);

        /*
            ---------------------------------------------------------------------
            FINAL RESPONSE
            ---------------------------------------------------------------------
            */

        return {
          ...agent,

          totalCollection: totalCollectionAgg[0]?.total || 0,

          monthlyCollection: monthlyCollectionAgg[0]?.total || 0,

          todaysCollection: todaysCollectionAgg[0]?.total || 0,
        };
      }),
    );

    /*
    =============================================================================
    RESPONSE
    =============================================================================
    */

    res.status(200).json({
      success: true,

      count: enrichedAgents.length,

      agents: enrichedAgents,
    });
  } catch (error) {
    console.error('GET AGENTS ERROR:', error);

    res.status(500).json({
      success: false,

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
  getAgent,
  getAgents,
  updateAgent,
  deleteAgent,
  changeAgentPassword,
};
