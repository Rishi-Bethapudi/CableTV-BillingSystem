const mongoose = require('mongoose');

/*
=============================================================================
SUB SCHEMAS
=============================================================================
*/

const bankDetailsSchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
  },

  { _id: false },
);

const subscriptionSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      trim: true,
    },

    renewalAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    billFrequency: {
      type: String,

      enum: ['monthly', 'quarterly', 'yearly'],

      default: 'monthly',
    },

    startDate: {
      type: Date,

      default: Date.now,
    },

    endDate: {
      type: Date,
    },

    status: {
      type: String,

      enum: ['active', 'inactive', 'expired'],

      default: 'inactive',
    },

    isPrimeUser: {
      type: Boolean,

      default: false,
    },
  },

  { _id: false },
);

/*
=============================================================================
MAIN OPERATOR SCHEMA
=============================================================================
*/

const operatorSchema = new mongoose.Schema(
  {
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

    cableName: {
      type: String,

      required: true,

      trim: true,

      index: true,
    },

    email: {
      type: String,

      trim: true,

      lowercase: true,

      unique: true,

      sparse: true,

      index: true,

      match: [/.+@.+\..+/, 'Please provide a valid email address'],
    },

    password: {
      type: String,

      required: true,

      minlength: 8,

      select: false,
    },

    contactNumber: {
      type: String,

      trim: true,

      index: true,
    },

    address: {
      type: String,
    },

    city: {
      type: String,
    },

    state: {
      type: String,
    },

    country: {
      type: String,

      default: 'India',
    },

    pincode: {
      type: String,
    },

    /*
    =========================================================================
    SUBSCRIPTION
    =========================================================================
    */

    subscription: subscriptionSchema,

    /*
    =========================================================================
    FINANCE & COMPLIANCE
    =========================================================================
    */

    gstNumber: {
      type: String,

      trim: true,
    },

    panNumber: {
      type: String,

      trim: true,
    },

    bankDetails: bankDetailsSchema,

    paymentGateway: {
      type: String,
    },

    /*
    =========================================================================
    BRANDING
    =========================================================================
    */

    logoUrl: {
      type: String,
    },

    bannerUrl: {
      type: String,
    },

    invoicePrefix: {
      type: String,

      trim: true,
    },

    billTemplate: {
      type: String,

      default: 'default',
    },

    themeColor: {
      type: String,

      default: '#000000',
    },

    smsDisplayName: {
      type: String,
    },

    /*
    =========================================================================
    COMMUNICATION
    =========================================================================
    */

    smsSenderId: {
      type: String,
    },

    smsUserName: {
      type: String,
    },

    messageContact: {
      type: String,
    },

    whatsappConsent: {
      type: Boolean,

      default: false,
    },

    /*
    =========================================================================
    OPERATIONAL LIMITS
    =========================================================================
    */

    customerLimit: {
      type: Number,

      default: 0,

      min: 0,
    },

    totalCustomers: {
      type: Number,

      default: 0,

      min: 0,
    },

    agentsAllowed: {
      type: Number,

      default: 0,

      min: 0,
    },

    agentsUsed: {
      type: Number,

      default: 0,

      min: 0,
    },

    supervisorsAllowed: {
      type: Number,

      default: 0,

      min: 0,
    },

    supervisorsUsed: {
      type: Number,

      default: 0,

      min: 0,
    },

    /*
    =========================================================================
    RELATIONS
    =========================================================================
    */

    agents: [
      {
        type: mongoose.Schema.Types.ObjectId,

        ref: 'Agent',
      },
    ],

    supervisors: [
      {
        type: mongoose.Schema.Types.ObjectId,

        ref: 'Supervisor',
      },
    ],

    /*
    =========================================================================
    ADDITIONAL ITEMS
    =========================================================================
    */

    additionalItems: [
      {
        name: {
          type: String,
          required: true,
        },

        sellingPrice: {
          type: Number,
          required: true,
          min: 0,
        },

        costPrice: {
          type: Number,
          min: 0,
        },

        defaultNote: {
          type: String,
        },
      },
    ],

    /*
    =========================================================================
    RBAC
    =========================================================================
    */

    permissions: {
      type: [String],

      default: [
        'VIEW_REPORTS',
        'VIEW_CUSTOMERS',
        'CREATE_CUSTOMERS',
        'EDIT_CUSTOMERS',
        'DELETE_CUSTOMERS',
        'COLLECT_PAYMENT',
        'VIEW_TRANSACTIONS',
        'CREATE_PRODUCTS',
        'VIEW_PRODUCTS',
        'EDIT_PRODUCTS',
        'DELETE_PRODUCTS',
        'MANAGE_SUBSCRIPTIONS',
        'VIEW_AGENTS',
        'CREATE_AGENTS',
        'EDIT_AGENTS',
        'DELETE_AGENTS',
        'VIEW_EXPENSES',
        'CREATE_EXPENSE',
        'EDIT_EXPENSE',
        'DELETE_EXPENSE',
      ],
    },

    accessScope: {
      type: String,

      enum: ['self', 'assigned', 'all'],

      default: 'all',
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

    /*
    =========================================================================
    FEEDBACK
    =========================================================================
    */

    rating: {
      type: Number,

      min: 1,

      max: 5,
    },

    feedback: {
      type: String,
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

operatorSchema.index({
  cableName: 1,
});

operatorSchema.index({
  email: 1,
});

operatorSchema.index({
  contactNumber: 1,
});

/*
=============================================================================
VALIDATION
=============================================================================
*/

operatorSchema.pre('validate', function (next) {
  if (!this.email && !this.contactNumber) {
    this.invalidate('email', 'Either email or contact number is required.');

    this.invalidate(
      'contactNumber',
      'Either contact number or email is required.',
    );
  }

  next();
});

/*
=============================================================================
LIMIT ENFORCEMENT
=============================================================================
*/

operatorSchema.pre('save', function (next) {
  /*
  ===========================================================================
  LIMIT REFRESH TOKENS
  ===========================================================================
  */

  if (this.refreshTokens?.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }

  /*
  ===========================================================================
  AGENT LIMIT
  ===========================================================================
  */

  if (this.agents && this.agents.length > this.agentsAllowed) {
    return next(
      new Error(`Cannot add more than ${this.agentsAllowed} agents.`),
    );
  }

  /*
  ===========================================================================
  SUPERVISOR LIMIT
  ===========================================================================
  */

  if (this.supervisors && this.supervisors.length > this.supervisorsAllowed) {
    return next(
      new Error(`Cannot add more than ${this.supervisorsAllowed} supervisors.`),
    );
  }

  /*
  ===========================================================================
  CUSTOMER LIMIT
  ===========================================================================
  */

  if (this.totalCustomers > this.customerLimit) {
    return next(new Error(`Customer limit exceeded.`));
  }

  next();
});

/*
=============================================================================
SAFE JSON RESPONSE
=============================================================================
*/

operatorSchema.methods.toJSON = function () {
  const operator = this.toObject();

  delete operator.password;

  delete operator.refreshTokens;

  delete operator.resetPasswordOtp;

  delete operator.resetPasswordExpires;

  return operator;
};

/*
=============================================================================
HELPER METHODS
=============================================================================
*/

operatorSchema.methods.addAgent = async function (agentId) {
  if (this.agents.length >= this.agentsAllowed) {
    throw new Error(`Agent limit reached.`);
  }

  this.agents.push(agentId);

  this.agentsUsed = this.agents.length;

  return this.save();
};

operatorSchema.methods.addSupervisor = async function (supervisorId) {
  if (this.supervisors.length >= this.supervisorsAllowed) {
    throw new Error(`Supervisor limit reached.`);
  }

  this.supervisors.push(supervisorId);

  this.supervisorsUsed = this.supervisors.length;

  return this.save();
};

operatorSchema.methods.updateTotalCustomers = async function (newTotal) {
  if (newTotal > this.customerLimit) {
    throw new Error(`Customer limit exceeded.`);
  }

  this.totalCustomers = newTotal;

  return this.save();
};

module.exports = mongoose.model('Operator', operatorSchema);
