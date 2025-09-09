const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true, // Index for faster lookups
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    // Record who performed the action
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'collectedByType', // Dynamic reference to either Operator or Agent
    },
    collectedByType: {
      type: String,
      required: true,
      enum: ['Operator', 'Agent'],
    },
    // The core transaction details
    type: {
      type: String,
      required: true,
      enum: ['Billing', 'Collection', 'Adjustment', 'AddOn'], // Billing=Charge, Collection=Payment
    },
    amount: {
      type: Number,
      required: true,
    },
    // Ledger state for auditing
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    invoiceId: {
      type: String,
      // This should be unique per operator, enforced in the controller logic
    },
    // For "Collection" transactions, can be manually entered by the operator
    receiptNumber: {
      type: String,
    },
    // To record the cost of the service for profit calculation
    costOfGoodsSold: {
      type: Number,
      default: 0,
    },
    // Additional details
    method: {
      type: String,
      enum: ['Cash', 'Online', 'Cheque', 'Adjustment', 'UPI'],
      default: 'Cash',
    },
    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
