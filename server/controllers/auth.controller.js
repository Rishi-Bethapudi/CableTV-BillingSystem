const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Operator = require('../models/operator.model');
const Agent = require('../models/agent.model');
const Admin = require('../models/admin.model');

const { sendOtp } = require('../services/otp.service');

/*
=============================================================================
TOKEN HELPERS
=============================================================================
*/

const generateAccessToken = (id, role, operatorId = null) => {
  return jwt.sign(
    {
      id,
      role,
      operatorId,
    },

    process.env.JWT_SECRET,

    {
      expiresIn: '15m',
    },
  );
};

const generateRefreshToken = (id) => {
  return jwt.sign(
    {
      id,
    },

    process.env.REFRESH_TOKEN_SECRET,

    {
      expiresIn: '7d',
    },
  );
};

/*
=============================================================================
PASSWORD VALIDATION
=============================================================================
*/

const validatePasswordStrength = (password) => {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  return strongPasswordRegex.test(password);
};

/*
=============================================================================
LOGIN
=============================================================================
*/

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: 'Identifier and password are required.',
      });
    }

    /*
    =========================================================================
    FIND USER
    =========================================================================
    */

    let user =
      (await Admin.findOne({
        email: identifier,
      }).select('+password +refreshTokens')) ||
      (await Operator.findOne({
        $or: [{ email: identifier }, { contactNumber: identifier }],
      }).select('+password +refreshTokens')) ||
      (await Agent.findOne({
        $or: [{ email: identifier }, { mobile: identifier }],
      }).select('+password +refreshTokens'));

    /*
    =========================================================================
    INVALID USER
    =========================================================================
    */

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials.',
      });
    }

    /*
    =========================================================================
    PASSWORD CHECK
    =========================================================================
    */

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials.',
      });
    }

    /*
    =========================================================================
    STATUS CHECK
    =========================================================================
    */

    if (user.status && ['inactive', 'suspended'].includes(user.status)) {
      return res.status(403).json({
        message: 'Account disabled.',
      });
    }

    /*
    =========================================================================
    OPERATOR SUBSCRIPTION CHECK
    =========================================================================
    */

    if (
      user.constructor.modelName === 'Operator' &&
      user.subscription?.status !== 'active'
    ) {
      return res.status(403).json({
        message: 'Subscription inactive.',
      });
    }

    /*
    =========================================================================
    ROLE SETUP
    =========================================================================
    */

    let role;
    let operatorId = null;

    if (user.constructor.modelName === 'Admin') {
      role = 'admin';
    } else if (user.constructor.modelName === 'Operator') {
      role = 'operator';
      operatorId = user._id;
    } else {
      role = 'agent';
      operatorId = user.operatorId;
    }

    /*
    =========================================================================
    TOKENS
    =========================================================================
    */

    const accessToken = generateAccessToken(user._id, role, operatorId);

    const refreshToken = generateRefreshToken(user._id);

    /*
    =========================================================================
    STORE REFRESH TOKEN
    =========================================================================
    */

    user.refreshTokens = user.refreshTokens || [];

    // Keep only latest 5 sessions
    user.refreshTokens = user.refreshTokens.slice(-5);

    user.refreshTokens.push(refreshToken);

    await user.save();

    /*
    =========================================================================
    COOKIE
    =========================================================================
    */

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,

      secure: process.env.NODE_ENV === 'production',

      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    /*
    =========================================================================
    RESPONSE
    =========================================================================
    */

    return res.status(200).json({
      message: 'Login successful',

      accessToken,

      refreshToken,

      user: {
        id: user._id,

        name: user.name,

        email: user.email,

        role,

        operatorId,
      },
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return res.status(500).json({
      message: 'Server error during login.',
    });
  }
};

/*
=============================================================================
REFRESH ACCESS TOKEN
=============================================================================
*/

const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: 'Refresh token missing.',
      });
    }

    /*
    =========================================================================
    VERIFY TOKEN
    =========================================================================
    */

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const userId = decoded.id;

    /*
    =========================================================================
    FIND USER
    =========================================================================
    */

    const user =
      (await Admin.findById(userId)) ||
      (await Operator.findById(userId)) ||
      (await Agent.findById(userId));

    if (!user) {
      return res.status(403).json({
        message: 'Invalid refresh token.',
      });
    }

    /*
    =========================================================================
    CHECK TOKEN EXISTS
    =========================================================================
    */

    const storedRefreshTokens = user.token || [];

    if (!storedRefreshTokens.includes(token)) {
      return res.status(401).json({
        message: 'Invalid refresh token',
      });
    }

    /*
    =========================================================================
    ROLE SETUP
    =========================================================================
    */

    let role;
    let operatorId = null;

    if (user.constructor.modelName === 'Admin') {
      role = 'admin';
    } else if (user.constructor.modelName === 'Operator') {
      role = 'operator';
      operatorId = user._id;
    } else {
      role = 'agent';
      operatorId = user.operatorId;
    }

    /*
    =========================================================================
    NEW ACCESS TOKEN
    =========================================================================
    */

    const newAccessToken = generateAccessToken(user._id, role, operatorId);

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('REFRESH TOKEN ERROR:', error);

    return res.status(403).json({
      message: 'Invalid or expired refresh token.',
    });
  }
};

/*
=============================================================================
CHANGE PASSWORD
=============================================================================
*/

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const { id, role } = req.user;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'All fields are required.',
      });
    }

    /*
    =========================================================================
    PASSWORD STRENGTH
    =========================================================================
    */

    if (!validatePasswordStrength(newPassword)) {
      return res.status(400).json({
        message:
          'Password must contain uppercase, lowercase, number and special character.',
      });
    }

    /*
    =========================================================================
    FIND USER
    =========================================================================
    */

    let UserCollection;

    if (role === 'admin') {
      UserCollection = Admin;
    } else if (role === 'operator') {
      UserCollection = Operator;
    } else {
      UserCollection = Agent;
    }

    const user = await UserCollection.findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    /*
    =========================================================================
    OLD PASSWORD CHECK
    =========================================================================
    */

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Incorrect old password.',
      });
    }

    /*
    =========================================================================
    UPDATE PASSWORD
    =========================================================================
    */

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(newPassword, salt);

    /*
    =========================================================================
    REVOKE ALL TOKENS
    =========================================================================
    */

    user.refreshTokens = [];

    await user.save();

    return res.status(200).json({
      message: 'Password changed successfully. Please login again.',
    });
  } catch (error) {
    console.error('CHANGE PASSWORD ERROR:', error);

    return res.status(500).json({
      message: 'Server error while changing password.',
    });
  }
};

/*
=============================================================================
FORGOT PASSWORD
=============================================================================
*/

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user =
      (await Operator.findOne({ email })) || (await Agent.findOne({ email }));

    /*
    =========================================================================
    PREVENT EMAIL ENUMERATION
    =========================================================================
    */

    if (!user) {
      return res.status(200).json({
        message: 'If account exists, OTP has been sent.',
      });
    }

    /*
    =========================================================================
    OTP
    =========================================================================
    */

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOtp = otp;

    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    /*
    =========================================================================
    SEND OTP
    =========================================================================
    */

    await sendOtp(user.email, otp);

    return res.status(200).json({
      message: 'If account exists, OTP has been sent.',
    });
  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);

    return res.status(500).json({
      message: 'Server error.',
    });
  }
};

/*
=============================================================================
VERIFY OTP & RESET PASSWORD
=============================================================================
*/

const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    /*
    =========================================================================
    PASSWORD STRENGTH
    =========================================================================
    */

    if (!validatePasswordStrength(newPassword)) {
      return res.status(400).json({
        message:
          'Password must contain uppercase, lowercase, number and special character.',
      });
    }

    /*
    =========================================================================
    FIND USER
    =========================================================================
    */

    const user =
      (await Operator.findOne({
        email,

        resetPasswordOtp: otp,

        resetPasswordExpires: {
          $gt: Date.now(),
        },
      })) ||
      (await Agent.findOne({
        email,

        resetPasswordOtp: otp,

        resetPasswordExpires: {
          $gt: Date.now(),
        },
      }));

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired OTP.',
      });
    }

    /*
    =========================================================================
    UPDATE PASSWORD
    =========================================================================
    */

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(newPassword, salt);

    /*
    =========================================================================
    CLEAR OTP
    =========================================================================
    */

    user.resetPasswordOtp = undefined;

    user.resetPasswordExpires = undefined;

    /*
    =========================================================================
    REVOKE TOKENS
    =========================================================================
    */

    user.refreshTokens = [];

    await user.save();

    return res.status(200).json({
      message: 'Password reset successful.',
    });
  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);

    return res.status(500).json({
      message: 'Server error.',
    });
  }
};

/*
=============================================================================
LOGOUT
=============================================================================
*/

const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(400).json({
        message: 'Refresh token missing.',
      });
    }

    /*
    =========================================================================
    VERIFY TOKEN
    =========================================================================
    */

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const userId = decoded.id;

    /*
    =========================================================================
    FIND USER
    =========================================================================
    */

    const user =
      (await Admin.findById(userId)) ||
      (await Operator.findById(userId)) ||
      (await Agent.findById(userId));

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    /*
    =========================================================================
    REMOVE TOKEN
    =========================================================================
    */

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);

    await user.save();

    /*
    =========================================================================
    CLEAR COOKIE
    =========================================================================
    */

    res.clearCookie('refreshToken');

    return res.status(200).json({
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('LOGOUT ERROR:', error);

    return res.status(500).json({
      message: 'Logout failed.',
    });
  }
};

/*
=============================================================================
EXPORTS
=============================================================================
*/

module.exports = {
  loginUser,

  refreshAccessToken,

  changePassword,

  requestPasswordReset,

  verifyOtpAndResetPassword,

  logoutUser,
};
