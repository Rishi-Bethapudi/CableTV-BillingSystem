const jwt = require('jsonwebtoken');

/**
 * @description Auth middleware that supports:
 *  - Authorization: Bearer <token>
 *  - ?token=<token> in URL params (for PDF iframe)
 *  - token in request body
 */
const authMiddleware = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;

  // 🆕 Support token from ?token= and body.token
  if (!token) token = req.query.token;
  if (!token) token = req.body?.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach payload to req.user
    req.user = {
      id: decoded.id,
      role: decoded.role,
      operatorId: decoded.operatorId,
    };

    return next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  req.user?.role === 'admin'
    ? next()
    : res.status(403).json({ message: 'Forbidden: Admin access required' });
};

const operatorOnly = (req, res, next) => {
  req.user?.role === 'operator'
    ? next()
    : res.status(403).json({ message: 'Forbidden: Operator access required' });
};

const operatorOrAgentOnly = (req, res, next) => {
  req.user && (req.user.role === 'operator' || req.user.role === 'agent')
    ? next()
    : res
        .status(403)
        .json({ message: 'Forbidden: Operator or Agent access required' });
};

module.exports = {
  authMiddleware,
  adminOnly,
  operatorOnly,
  operatorOrAgentOnly,
};
