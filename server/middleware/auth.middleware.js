const jwt = require('jsonwebtoken');

const Operator = require('../models/operator.model');
const Agent = require('../models/agent.model');
const Admin = require('../models/admin.model');

/*
=============================================================================
TOKEN EXTRACTION
=============================================================================
*/

const extractToken = (req) => {
  // Authorization Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    return req.headers.authorization.split(' ')[1];
  }

  // Query Token (PDF / iframe)
  if (req.query?.token) {
    return req.query.token;
  }

  // Body Token
  if (req.body?.token) {
    return req.body.token;
  }

  return null;
};

/*
=============================================================================
MAIN AUTH MIDDLEWARE
=============================================================================
*/

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token missing',
      });
    }

    /*
    -------------------------------------------------------------------------
    VERIFY JWT
    -------------------------------------------------------------------------
    */

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /*
    -------------------------------------------------------------------------
    BASIC PAYLOAD VALIDATION
    -------------------------------------------------------------------------
    */

    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        message: 'Invalid authentication payload',
      });
    }

    let user = null;

    /*
    -------------------------------------------------------------------------
    LOAD USER BASED ON ROLE
    -------------------------------------------------------------------------
    */

    switch (decoded.role) {
      case 'admin':
        user = await Admin.findById(decoded.id).select('+permissions');
        break;

      case 'operator':
        user = await Operator.findById(decoded.id).select('+permissions');
        break;

      case 'agent':
        user = await Agent.findById(decoded.id).select('+permissions');
        break;

      default:
        return res.status(401).json({
          message: 'Invalid role',
        });
    }

    /*
    -------------------------------------------------------------------------
    USER VALIDATION
    -------------------------------------------------------------------------
    */

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      });
    }

    /*
    -------------------------------------------------------------------------
    SOFT DELETE CHECK
    -------------------------------------------------------------------------
    */

    if (user.isDeleted) {
      return res.status(403).json({
        message: 'Account deleted',
      });
    }

    /*
    -------------------------------------------------------------------------
    STATUS CHECK
    -------------------------------------------------------------------------
    */

    if (user.status && ['inactive', 'suspended'].includes(user.status)) {
      return res.status(403).json({
        message: `Account ${user.status}`,
      });
    }

    /*
    -------------------------------------------------------------------------
    TENANT SECURITY
    -------------------------------------------------------------------------
    */

    req.user = {
      id: user._id,

      role: decoded.role,

      operatorId:
        decoded.role === 'operator' ? user._id : user.operatorId || null,

      permissions: user.permissions || [],

      accessScope: user.accessScope || 'self',

      name: user.name,
    };

    next();
  } catch (error) {
    console.error('AUTH ERROR:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token',
      });
    }

    return res.status(500).json({
      message: 'Authentication failed',
    });
  }
};

module.exports = authMiddleware;
