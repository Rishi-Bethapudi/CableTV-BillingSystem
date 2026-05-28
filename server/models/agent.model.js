const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    // --- Identification & Hierarchy ---
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

    // --- Profile Information ---
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

    // --- RBAC & Access Control ---
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
    assignedAreas: {
      type: [String],
      default: [],
    },

    // --- Account Status & Activity ---
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

    // --- Security Tokens & Lifecycle ---
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

    // --- Soft Delete ---
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
agentSchema.index({ operatorId: 1, mobile: 1 });
agentSchema.index({ operatorId: 1, assignedAreas: 1 });

/*
=============================================================================
MIDDLEWARE (PRE-SAVE)
=============================================================================
*/
// Limit concurrent active refresh tokens to the last 5 sessions
agentSchema.pre('save', function (next) {
  if (this.refreshTokens?.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  next();
});

/*
=============================================================================
INSTANCE METHODS
=============================================================================
*/
// Sanitizes the document before converting it to JSON (removes sensitive data)
agentSchema.methods.toJSON = function () {
  const agent = this.toObject();

  delete agent.password;
  delete agent.refreshTokens;
  delete agent.resetPasswordOtp;
  delete agent.resetPasswordExpires;

  return agent;
};

module.exports = mongoose.model('Agent', agentSchema);
