const mongoose = require('mongoose');

/*
=============================================================================
AGENT SCHEMA
=============================================================================
*/

const agentSchema = new mongoose.Schema(
  {
    /*
    =========================================================================
    TENANT OWNERSHIP
    =========================================================================
    */

    operatorId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: 'Operator',

      required: true,

      index: true,
    },

    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: 'Supervisor',

      default: null,
    },

    /*
    =========================================================================
    IDENTITY
    =========================================================================
    */

    name: {
      type: String,

      required: true,

      trim: true,
    },

    email: {
      type: String,

      trim: true,

      lowercase: true,

      sparse: true,

      index: true,
    },

    mobile: {
      type: String,

      required: true,

      trim: true,

      unique: true,

      index: true,
    },

    password: {
      type: String,

      required: true,

      minlength: 8,

      select: false,
    },

    employeeCode: {
      type: String,

      trim: true,

      sparse: true,
    },

    profileImage: {
      type: String,
    },

    address: {
      type: String,
    },

    /*
    =========================================================================
    ROLE
    =========================================================================
    */

    role: {
      type: String,

      enum: [
        'field_agent',
        'collection_agent',
        'support_agent',
        'technical_agent',
        'manager',
      ],

      default: 'field_agent',
    },

    /*
    =========================================================================
    PERMISSIONS
    =========================================================================
    */

    permissions: {
      type: [String],

      default: [
        'VIEW_CUSTOMERS',
        'COLLECT_PAYMENT',
        'VIEW_TRANSACTIONS',
        'VIEW_SUBSCRIPTIONS',
      ],
    },

    accessScope: {
      type: String,

      enum: ['self', 'assigned', 'all'],

      default: 'assigned',
    },

    /*
    =========================================================================
    AREA ACCESS
    =========================================================================
    */

    assignedAreas: {
      type: [String],

      default: [],
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

      index: true,
    },

    isOnline: {
      type: Boolean,

      default: false,
    },

    lastLoginAt: {
      type: Date,
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

    resetPasswordOtp: {
      type: String,

      select: false,
    },

    resetPasswordExpires: {
      type: Date,

      select: false,
    },

    /*
    =========================================================================
    SOFT DELETE
    =========================================================================
    */

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
INDEXES
=============================================================================
*/

agentSchema.index({
  operatorId: 1,
  mobile: 1,
});

agentSchema.index({
  operatorId: 1,
  assignedAreas: 1,
});

/*
=============================================================================
LIMIT REFRESH TOKENS
=============================================================================
*/

agentSchema.pre('save', function (next) {
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

agentSchema.methods.toJSON = function () {
  const agent = this.toObject();

  delete agent.password;

  delete agent.refreshTokens;

  delete agent.resetPasswordOtp;

  delete agent.resetPasswordExpires;

  return agent;
};

module.exports = mongoose.model('Agent', agentSchema);
