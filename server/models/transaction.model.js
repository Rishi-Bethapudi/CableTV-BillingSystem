const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
    },

    date: { type: Date, default: Date.now }, // payment date
    recordTimestamp: { type: Date, default: Date.now }, // exact recording time

    paymentId: { type: String, unique: true }, // e.g. 20250601

    name: String, // customer snapshot
    customerCode: String, // snapshot at txn time

    paidAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },

    comment: String,
    mode: {
      type: String,
      enum: ['cash', 'online', 'cheque', 'other'],
      default: 'cash',
    },

    type: {
      type: String,
      enum: ['billing', 'collection', 'adjustment'],
      default: 'collection',
    },
    balanceAfter: Number,

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
