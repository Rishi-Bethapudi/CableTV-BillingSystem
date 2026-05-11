const mongoose = require('mongoose');

/*
=============================================================================
ADMIN SCHEMA
=============================================================================
*/

const adminSchema = new mongoose.Schema(
  {
    /*
    =========================================================================
    IDENTITY
    =========================================================================
    */

    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Admin email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,

      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Invalid email address',
      ],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,

      select: false,
    },

    /*
    =========================================================================
    ROLE
    =========================================================================
    */

    role: {
      type: String,
      default: 'admin',
      immutable: true,
    },

    /*
    =========================================================================
    RBAC
    =========================================================================
    */

    permissions: {
      type: [String],

      default: [
        'CREATE_OPERATOR',
        'VIEW_OPERATORS',
        'MANAGE_SUBSCRIPTIONS',
        'VIEW_REPORTS',
        'MANAGE_SYSTEM',
      ],
    },

    /*
    =========================================================================
    SECURITY
    =========================================================================
    */

    refreshTokens: {
      type: [String],

      default: [],

      select: false,
    },

    passwordChangedAt: {
      type: Date,
    },

    /*
    =========================================================================
    ACCOUNT STATUS
    =========================================================================
    */

    status: {
      type: String,

      enum: ['active', 'inactive', 'suspended'],

      default: 'active',
    },

    isDeleted: {
      type: Boolean,

      default: false,
    },

    deletedAt: {
      type: Date,

      default: null,
    },
  },

  {
    timestamps: true,

    minimize: false,
  },
);

/*
=============================================================================
LIMIT REFRESH TOKENS
=============================================================================
*/

adminSchema.pre('save', function (next) {
  if (this.refreshTokens?.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }

  next();
});

/*
=============================================================================
SAFE JSON RESPONSE
=============================================================================
*/

adminSchema.methods.toJSON = function () {
  const admin = this.toObject();

  delete admin.password;

  delete admin.refreshTokens;

  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);
