const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Operator = require('../models/operator.model');
const Agent = require('../models/agent.model');
const Admin = require('../models/admin.model'); // Assuming an Admin model
const { sendOtp } = require('../services/otp.service'); // A mock service for sending OTPs

// A helper function to generate JWT
const generateToken = (id, role, operatorId = null) => {
  const payload = { id, role };
  // For agents, we also embed their operator's ID in the token for easy multi-tenancy checks
  if (operatorId) {
    payload.operatorId = operatorId;
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

/**
 * @desc    Login for any user type
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in all relevant collections. This can be optimized if emails are unique across all user types.
    let user =
      (await Admin.findOne({ email })) ||
      (await Operator.findOne({ email })) ||
      (await Agent.findOne({ email }));

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // For Operators, check if their subscription is active
    if (
      user.constructor === Operator &&
      user.subscription.status !== 'active'
    ) {
      return res
        .status(403)
        .json({ message: 'Your account is disabled. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Determine role and operatorId
    let role, operatorId;
    if (user.constructor === Admin) {
      role = 'admin';
    } else if (user.constructor === Operator) {
      role = 'operator';
      operatorId = user._id; // An operator's operatorId is their own ID
    } else {
      role = 'agent';
      operatorId = user.operatorId; // An agent's operatorId is their parent operator's ID
    }

    res.status(200).json({
      message: 'Login successful',
      token: generateToken(user._id, role, operatorId),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

/**
 * @desc    Allows a logged-in user to change their password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { id, role } = req.user; // from authMiddleware

    let UserCollection;
    if (role === 'admin') UserCollection = Admin;
    else if (role === 'operator') UserCollection = Operator;
    else UserCollection = Agent;

    const user = await UserCollection.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password.' });
  }
};

/**
 * @desc    Request a password reset OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    // Find user in Operator or Agent collections (Admins might have a different recovery process)
    let user =
      (await Operator.findOne({ email })) || (await Agent.findOne({ email }));

    if (!user) {
      // We send a success response even if the user doesn't exist to prevent email enumeration attacks
      return res
        .status(200)
        .json({
          message:
            'If a user with that email exists, a password reset OTP has been sent.',
        });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpires = new Date(new Date().getTime() + 10 * 60 * 1000); // OTP expires in 10 minutes

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = otpExpires;
    await user.save();

    // --- OTP Sending Logic ---
    // This is where you would integrate with a service like Twilio (for SMS) or Nodemailer/SendGrid (for email)
    // For now, we'll just log it to the console and return success.
    await sendOtp(user.email, otp); // Assumes sendOtp is an async function
    console.log(`Password reset OTP for ${user.email}: ${otp}`);
    // --- End OTP Sending Logic ---

    res
      .status(200)
      .json({
        message:
          'If a user with that email exists, a password reset OTP has been sent.',
      });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Verify OTP and set a new password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    let user =
      (await Operator.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordExpires: { $gt: Date.now() }, // Check if OTP is still valid
      })) ||
      (await Agent.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordExpires: { $gt: Date.now() },
      }));

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Invalid OTP or OTP has expired.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP fields after successful reset
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  loginUser,
  changePassword,
  requestPasswordReset,
  verifyOtpAndResetPassword,
};
