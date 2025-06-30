const jwt = require('jsonwebtoken');
const Operator = require('../models/operator.model'); // Assuming you have an Operator model
const Agent = require('../models/agent.model'); // Assuming you have an Agent model

/**
 * @description Middleware to verify JWT token and attach user to request object.
 * This is the primary gatekeeper for all protected routes.
 */
const authMiddleware = async (req, res, next) => {
  let token;
  // Check for token in Authorization header (e.g., 'Bearer <token>')
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token using the secret from your .env file
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user information to the request object for downstream use.
      // We exclude the password from the user object we attach.
      // 'decoded.id' holds the user's MongoDB _id.
      // 'decoded.role' holds the user's role ('admin', 'operator', 'agent').
      req.user = {
        id: decoded.id,
        role: decoded.role,
        operatorId: decoded.operatorId, // This will be present for operators and agents
      };

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * @description Middleware to authorize users with the 'admin' role.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

/**
 * @description Middleware to authorize users with the 'operator' role.
 */
const operatorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'operator') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Operator access required' });
  }
};

/**
 * @description Middleware to authorize users with 'operator' or 'agent' roles.
 * This is useful for endpoints accessible by both, like viewing customer details.
 */
const operatorOrAgentOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'operator' || req.user.role === 'agent')) {
    next();
  } else {
    res
      .status(403)
      .json({ message: 'Forbidden: Operator or Agent access required' });
  }
};

module.exports = {
  authMiddleware,
  adminOnly,
  operatorOnly,
  operatorOrAgentOnly,
};
