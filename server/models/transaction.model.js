const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },

    // Who performed it
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'collectedByType',
    },
    collectedByType: {
      type: String,
      required: true,
      enum: ['Operator', 'Agent'],
    },

    // Type of transaction
    type: {
      type: String,
      required: true,
      enum: ['Billing', 'Collection', 'Adjustment', 'AddOn'],
    },
    amount: { type: Number, required: true },

    // Ledger tracking
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },

    // Reference to subscriptions
    subscriptionId: { type: mongoose.Schema.Types.ObjectId }, // optional
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

    // Period covered
    startDate: Date,
    expiryDate: Date,

    // Invoice/receipts
    invoiceId: String,
    receiptNumber: String,

    // Profit calculation
    costOfGoodsSold: { type: Number, default: 0 },

    // Payment method
    method: {
      type: String,
      enum: ['Cash', 'Online', 'Cheque', 'Adjustment', 'UPI'],
      default: 'Cash',
    },

    note: { type: String, trim: true },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
