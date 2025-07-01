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
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
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
    const { email, password, contactNumber } = req.body;
    // 1. Look for the user across all three collections (from your previous code)
    let user =
      (await Admin.findOne({ email })) ||
      (await Operator.findOne({
        $or: [{ email }, { contactNumber }],
      })) ||
      (await Agent.findOne({
        $or: [{ email: email }, { contactNumber: contactNumber }],
      }));
    // 2. Check if user exists and password is correct

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. For Operators, check if their subscription is active (from your previous code)
    if (
      user.constructor === Operator &&
      user.subscription.status !== 'active'
    ) {
      return res
        .status(403)
        .json({ message: 'Your account is disabled. Please contact support.' });
    }

    // 4. Determine role and operatorId for all user types (from your previous code)
    let role, operatorId;
    if (user.constructor === Admin) {
      role = 'admin';
      // operatorId remains null for admin
    } else if (user.constructor === Operator) {
      role = 'operator';
      operatorId = user._id; // An operator's operatorId is their own ID
    } else {
      // Agent
      role = 'agent';
      operatorId = user.operatorId; // An agent's operatorId is their parent operator's ID
    }

    // 5. Generate BOTH access and refresh tokens (from the new strategy)
    const accessToken = generateAccessToken(user._id, role, operatorId);
    const refreshToken = generateRefreshToken(user._id);

    // TODO: Store the refresh token in your database against the user's ID to allow for revocation.
    // Example: user.refreshTokens.push(refreshToken); await user.save();

    // 6. Send tokens to the client universally (from the new strategy)
    // Set refresh token in a secure, httpOnly cookie for web clients
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send tokens in the response body for ALL clients (mobile will use this)
    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken, // For mobile app consumption
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
 * @desc    Generate a new access token using a refresh token (Essential for this strategy)
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = async (req, res) => {
  // Get refresh token from EITHER cookie (web) OR body (mobile)
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No refresh token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // TODO: Verify the refresh token exists in your database for this user.

    // Find user to get their role and operatorId
    const user =
      (await Admin.findById(decoded.id)) ||
      (await Operator.findById(decoded.id)) ||
      (await Agent.findById(decoded.id));
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    let role, operatorId;
    if (user.constructor === Admin) {
      role = 'admin';
    } else if (user.constructor === Operator) {
      role = 'operator';
      operatorId = user._id;
    } else {
      role = 'agent';
      operatorId = user.operatorId;
    }

    // Issue a new access token
    const newAccessToken = generateAccessToken(user._id, role, operatorId);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid refresh token.' });
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
  // TODO: Remove the specific refresh token from the user's record in the database.

  // Clear the cookie for web clients
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully.' });
};
module.exports = {
  loginUser,
  refreshToken,
  changePassword,
  requestPasswordReset,
  verifyOtpAndResetPassword,
  logoutUser,
};
