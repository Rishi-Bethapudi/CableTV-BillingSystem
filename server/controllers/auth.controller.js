const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Operator = require('../models/operator.model');
const Agent = require('../models/agent.model');
const Admin = require('../models/admin.model'); // Assuming an Admin model
const { sendOtp } = require('../services/otp.service'); // A mock service for sending OTPs

// --- HELPER FUNCTIONS ---
// Generates a short-lived Access Token
const generateAccessToken = (id, role, operatorId = null) => {
  const payload = { id, role, operatorId };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });
};

// Generates a long-lived Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * @desc    Login for any user type (MERGED & COMPLETE)
 * @route   POST /api/auth/login
 * @access  Public
 */

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or contactNumber

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: 'Identifier and password are required.' });
    }

    // Step 1: Find user across all collections
    let user =
      (await Admin.findOne({ email: identifier })) ||
      (await Operator.findOne({
        $or: [{ email: identifier }, { contactNumber: identifier }],
      })) ||
      (await Agent.findOne({
        $or: [{ email: identifier }, { contactNumber: identifier }],
      }));

    // Step 2: If user doesn't exist or password is wrong
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Step 3: Operator-specific validation
    if (
      user.constructor.modelName === 'Operator' &&
      user.subscription?.status !== 'active'
    ) {
      return res.status(403).json({
        message: 'Your account is disabled. Please contact support.',
      });
    }

    // Step 4: Set role and operatorId for token payload
    let role,
      operatorId = null;

    if (user.constructor.modelName === 'Admin') {
      role = 'admin';
    } else if (user.constructor.modelName === 'Operator') {
      role = 'operator';
      operatorId = user._id;
    } else {
      role = 'agent';
      operatorId = user.operatorId;
    }

    // Step 5: Generate Tokens
    const accessToken = generateAccessToken(user._id, role, operatorId);
    const refreshToken = generateRefreshToken(user._id);

    // Optional: Store refreshToken in DB (for token revocation later)
    // Example: user.refreshTokens.push(refreshToken); await user.save();
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();
    // Step 6: Set refreshToken in secure cookie (Web)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      // sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Step 7: Send token and user info to frontend
    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken, // for mobile apps
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        role,
        operatorId,
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
      return res.status(200).json({
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

    res.status(200).json({
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

/**
 * @desc    Logout user (UPDATED)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) return res.status(400).json({ message: 'No token found.' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const userId = decoded.userId;

    const user =
      (await Admin.findById(userId)) ||
      (await Operator.findById(userId)) ||
      (await Agent.findById(userId));

    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
      await user.save();
    }

    res.clearCookie('refreshToken');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token.' });
  }
};
const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token)
    return res.status(401).json({ message: 'Refresh token missing.' });

  try {
    // 1. Verify token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // 2. Find user
    const userId = decoded.userId;

    const user =
      (await Admin.findById(userId)) ||
      (await Operator.findById(userId)) ||
      (await Agent.findById(userId));

    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    // 3. Generate new access token
    let role,
      operatorId = null;
    if (user.constructor.modelName === 'Admin') role = 'admin';
    else if (user.constructor.modelName === 'Operator') {
      role = 'operator';
      operatorId = user._id;
    } else {
      role = 'agent';
      operatorId = user.operatorId;
    }

    const newAccessToken = generateAccessToken(user._id, role, operatorId);

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Token expired or invalid.' });
  }
};
module.exports = {
  loginUser,
  refreshAccessToken,
  changePassword,
  requestPasswordReset,
  verifyOtpAndResetPassword,
  logoutUser,
  refreshAccessToken,
};
