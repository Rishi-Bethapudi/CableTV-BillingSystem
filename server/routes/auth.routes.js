const express = require('express');
const router = express.Router();
const {
  loginUser,
  requestPasswordReset,
  verifyOtpAndResetPassword,
  changePassword,
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/auth/login
 * @desc    Login for any user (Admin, Operator, Agent)
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   POST /api/auth/change-password
 * @desc    Allows a logged-in user to change their own password using the old one
 * @access  Private (Any authenticated user)
 */
router.post('/change-password', authMiddleware, changePassword);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Step 1 of password reset: User requests an OTP via email/mobile
 * @access  Public
 */
router.post('/forgot-password', requestPasswordReset);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Step 2 of password reset: User provides OTP and new password
 * @access  Public
 */
router.post('/reset-password', verifyOtpAndResetPassword);

module.exports = router;
