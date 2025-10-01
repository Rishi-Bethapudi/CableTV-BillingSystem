const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    billingInterval: {
      value: { type: Number, required: true }, // e.g. 30
      unit: { type: String, enum: ['days', 'months'], default: 'days' }, // e.g. 'days'
    },
    price: { type: Number, required: true }, // locked price at time of subscription
    status: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active',
    },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    // Multi-tenant references
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
    },

    // Core identity
    customerCode: { type: String, required: true },
    name: { type: String, required: true },
    locality: String,
    mobile: String,
    billingAddress: String,
    connectionStartDate: Date,
    sequenceNo: Number,
    // Box details
    stbName: String,
    stbNumber: String,
    cardNumber: String,

    // Active subscriptions only
    subscriptions: [subscriptionSchema],
    // Financial tracking
    balanceAmount: { type: Number, default: 0 },
    additionalCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    remark: String,
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
