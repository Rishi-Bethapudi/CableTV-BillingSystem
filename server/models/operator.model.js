const mongoose = require('mongoose');

// Sub-schemas for modularity
const bankDetailsSchema = new mongoose.Schema({
  accountName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
});

const subscriptionSchema = new mongoose.Schema({
  planName: { type: String },
  renewalAmount: { type: Number, min: 0 },
  billFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly',
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'inactive',
  },
  isPrimeUser: { type: Boolean, default: false },
});

const operatorSchema = new mongoose.Schema(
  {
    // 🔹 Identity
    name: { type: String, required: true, trim: true },
    cableName: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/.+@.+\..+/, 'Please provide a valid email address'],
    },
    password: { type: String, required: true, minlength: 6 },
    contactNumber: { type: String, trim: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    pincode: { type: String },

    // 🔹 Subscription / Plan
    subscription: subscriptionSchema,

    // 🔹 Finance & Compliance
    gstNumber: { type: String },
    panNumber: { type: String },
    bankDetails: bankDetailsSchema,
    paymentGateway: { type: String },

    // 🔹 Branding
    logoUrl: { type: String },
    bannerUrl: { type: String },
    invoicePrefix: { type: String },
    billTemplate: { type: String, default: 'default' },
    themeColor: { type: String, default: '#000000' },
    smsDisplayName: { type: String },

    // 🔹 Communication
    smsSenderId: { type: String },
    smsUserName: { type: String },
    messageContact: { type: String },
    whatsappConsent: { type: Boolean, default: false },

    // 🔹 Operational Metrics & Limits
    customerLimit: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    agentsAllowed: { type: Number, default: 0 },
    agentsUsed: { type: Number, default: 0 },
    supervisorsAllowed: { type: Number, default: 0 },
    supervisorsUsed: { type: Number, default: 0 },

    // 🔹 Agents & Supervisors (small arrays for filtering / management pages)
    agents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }],
    supervisors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor' }],

    // 🔹 Additional Items / Add-ons
    additionalItems: [
      {
        name: { type: String, required: true },
        sellingPrice: { type: Number, required: true, min: 0 },
        costPrice: { type: Number, min: 0 },
        defaultNote: { type: String },
      },
    ],

    // 🔹 Ratings / Feedback
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },

    // 🔹 Security
    refreshTokens: [String],
  },
  { timestamps: true },
);

// ✅ Custom validator: either email or contactNumber must exist
operatorSchema.pre('validate', function (next) {
  if (!this.email && !this.contactNumber) {
    this.invalidate(
      'email',
      'Either email or contact number must be provided.',
    );
    this.invalidate(
      'contactNumber',
      'Either contact number or email must be provided.',
    );
  }
  next();
});

// ✅ Pre-save hook to enforce limits
operatorSchema.pre('save', function (next) {
  if (this.agents && this.agents.length > this.agentsAllowed) {
    return next(
      new Error(`Cannot add more than ${this.agentsAllowed} agents.`),
    );
  }
  if (this.supervisors && this.supervisors.length > this.supervisorsAllowed) {
    return next(
      new Error(`Cannot add more than ${this.supervisorsAllowed} supervisors.`),
    );
  }
  if (this.totalCustomers && this.totalCustomers > this.customerLimit) {
    return next(
      new Error(`Cannot have more than ${this.customerLimit} customers.`),
    );
  }
  next();
});

// ✅ Helper methods to safely add/update entities
operatorSchema.methods.addAgent = async function (agentId) {
  if (this.agents.length >= this.agentsAllowed) {
    throw new Error(`Agent limit of ${this.agentsAllowed} reached.`);
  }
  this.agents.push(agentId);
  this.agentsUsed = this.agents.length;
  return this.save();
};

operatorSchema.methods.addSupervisor = async function (supervisorId) {
  if (this.supervisors.length >= this.supervisorsAllowed) {
    throw new Error(`Supervisor limit of ${this.supervisorsAllowed} reached.`);
  }
  this.supervisors.push(supervisorId);
  this.supervisorsUsed = this.supervisors.length;
  return this.save();
};

operatorSchema.methods.updateTotalCustomers = async function (newTotal) {
  if (newTotal > this.customerLimit) {
    throw new Error(`Customer limit of ${this.customerLimit} exceeded.`);
  }
  this.totalCustomers = newTotal;
  return this.save();
};

const Operator = mongoose.model('Operator', operatorSchema);

module.exports = Operator;
