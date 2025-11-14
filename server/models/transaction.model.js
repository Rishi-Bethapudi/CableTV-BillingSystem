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
      index: true,
    },

    // Who performed it (Operator / Agent)
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'collectedByType',
    },
    collectedByType: {
      type: String,
      required: true,
      enum: ['Operator', 'Agent'],
    },

    // Type of transaction (accrual style)
    type: {
      type: String,
      required: true,
      enum: ['INVOICE', 'PAYMENT', 'ADJUSTMENT', 'REVERSAL'],
      index: true,
    },

    /**
     * Signed amount:
     *  - INVOICE  => +ve (customer owes more)
     *  - PAYMENT  => -ve (customer owes less)
     *  - ADJUSTMENT/REVERSAL: depends on case
     */
    amount: { type: Number, required: true },

    // Ledger tracking
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },

    // Link to subscription & product (optional)
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription', // once you create it
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },

    // Period covered by this invoice (for renewals)
    startDate: Date,
    expiryDate: Date,

    // Invoice & receipt identifiers
    invoiceId: { type: String, index: true }, // e.g. 202511120001
    receiptNumber: { type: String, index: true },

    // Billing breakdown (for INVOICE)
    baseAmount: { type: Number, default: 0 }, // sum of plan prices
    extraCharge: { type: Number, default: 0 }, // second TV, wiring, etc.
    discount: { type: Number, default: 0 }, // customer-level discount
    netAmount: { type: Number, default: 0 }, // base + extra - discount

    // Profit calculation – accrual
    costOfGoodsSold: { type: Number, default: 0 }, // sum of operatorCost
    profit: { type: Number, default: 0 }, // netAmount - COGS

    // Flags
    isOpeningBalance: { type: Boolean, default: false },

    // Payment method (for PAYMENT)
    method: {
      type: String,
      enum: ['Cash', 'Online', 'Cheque', 'Adjustment', 'UPI'],
      default: 'Cash',
    },

    note: { type: String, trim: true },
  },
  { timestamps: true }
);

// Helpful indexes for reports
transactionSchema.index({ operatorId: 1, customerId: 1, createdAt: -1 });
transactionSchema.index({ operatorId: 1, type: 1, createdAt: -1 });
transactionSchema.index({ operatorId: 1, invoiceId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
