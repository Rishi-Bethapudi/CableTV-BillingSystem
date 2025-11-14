const mongoose = require('mongoose');
const Subscription = require('./subscription.model');
const deviceSchema = new mongoose.Schema(
  {
    stbNumber: String,
    cardNumber: String,
    deviceModel: String,
    membershipNumber: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const customerSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
      index: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      index: true,
    },

    name: { type: String, required: true, trim: true },
    fatherName: String,
    contactNumber: { type: String, required: true, index: true },
    alternateContact: String,
    messageNumber: String,

    billingAddress: String,
    deliveryAddress: String,
    locality: String,
    latitude: Number,
    longitude: Number,

    customerCode: { type: String, index: true },
    connectionStartDate: { type: Date, default: Date.now },
    sequenceNo: { type: Number, default: 0 },

    /**
     * Subscription summary for fast UI
     * Full details stored in Subscription collection
     */
    activeSubscriptions: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    ],
    earliestExpiry: { type: Date, index: true },
    planNamesSummary: [String], // optional UI boost ["Basic Pack", "Sports Addon"]

    devices: [deviceSchema],

    balanceAmount: { type: Number, default: 0 }, // auto-updated from transactions
    unbilledAmount: { type: Number, default: 0 },
    lastBillDate: Date,
    lastBillAmount: Number,

    lastPaymentAmount: Number,
    lastPaymentDate: Date,
    lastPaymentMethod: String,

    // Customer-specific additional charge & discount defaults
    defaultExtraCharge: { type: Number, default: 0 },
    defaultDiscount: { type: Number, default: 0 },

    billFrequency: { type: Number, default: 30 },
    automaticBilling: { type: Boolean, default: false },

    securityDeposit: { type: Number, default: 0 },
    gstNumber: String,

    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },

    remark: String,
  },
  { timestamps: true }
);

customerSchema.index({ operatorId: 1, contactNumber: 1 });

module.exports = mongoose.model('Customer', customerSchema);
