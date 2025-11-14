const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      index: true,
      required: true,
    },

    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      index: true,
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },

    // Copy of product planType for quick filtering (no join required)
    planType: {
      type: String,
      enum: ['BASE', 'ADDON'],
      required: true,
      index: true,
    },

    // Subscription duration
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true, index: true },

    // Duration (copied from product at time of creation)
    billingInterval: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ['days', 'months'], required: true },
    },

    // Price snapshot (locking price in history)
    customerPrice: { type: Number, required: true },
    operatorCost: { type: Number, required: true },

    // Status
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'PAUSED', 'TERMINATED'],
      default: 'ACTIVE',
      index: true,
    },

    // Audit tracking (for history)
    renewalNumber: { type: Number, default: 1 }, // 1 = first purchase, 2 = first renewal...

    // For pause/resume
    pauseDate: Date,
    resumeDate: Date,

    // Invoice link for that renewal
    invoiceId: { type: String }, // purely for quick UI reference

    notes: String,
  },
  { timestamps: true }
);

// Helpful indexes
subscriptionSchema.index({ operatorId: 1, expiryDate: 1 });
subscriptionSchema.index({ operatorId: 1, customerId: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
