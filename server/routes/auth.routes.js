const express = require('express');

const router = express.Router();

/*
=============================================================================
CONTROLLERS
=============================================================================
*/

const {
  loginUser,
  refreshAccessToken,
  requestPasswordReset,
  verifyOtpAndResetPassword,
  changePassword,
  logoutUser,
  // logoutAllSessions,
} = require('../controllers/auth.controller');

/*
=============================================================================
MIDDLEWARES
=============================================================================
*/

const authMiddleware = require('../middleware/auth.middleware');

const rateLimit = require('express-rate-limit');

/*
=============================================================================
RATE LIMITERS
=============================================================================
*/

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many requests. Please try again later.',
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many refresh attempts.',
});

/*
=============================================================================
AUTH ROUTES
=============================================================================
*/

/**
 * LOGIN
 */
router.post(
  '/login',

  authLimiter,

  loginUser,
);

/**
 * REFRESH ACCESS TOKEN
 */
router.post(
  '/refresh',

  refreshLimiter,

  refreshAccessToken,
);

/**
 * CHANGE PASSWORD
 */
router.post(
  '/change-password',

  authMiddleware,

  changePassword,
);

/**
 * FORGOT PASSWORD
 */
router.post(
  '/forgot-password',

  authLimiter,

  requestPasswordReset,
);

/**
 * RESET PASSWORD
 */
router.post(
  '/reset-password',

  authLimiter,

  verifyOtpAndResetPassword,
);

/**
 * LOGOUT CURRENT SESSION
 */
router.post(
  '/logout',

  authMiddleware,

  logoutUser,
);

/**
 * LOGOUT ALL DEVICES
 */
// router.post(
//   '/logout-all',

//   authMiddleware,

//   logoutAllSessions,
// );

module.exports = router;
