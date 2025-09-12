const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    // The person who recorded the expense (operator or an authorized agent)
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recordedByType',
    },
    recordedByType: {
      type: String,
      required: true,
      enum: ['Operator', 'Agent'],
    },

    // Auto-generated or custom expense number (e.g. EXP009)
    expenseNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    // Expense date (from frontend, not default now)
    expenseDate: {
      type: Date,
      required: true,
    },

    category: {
      type: String,
      required: [true, 'Expense category is required.'],
      enum: [
        'Rent',
        'Salary',
        'Maintenance',
        'Office Rent',
        'Utilities',
        'Marketing',
        'Training',
        'Software',
        'Other',
      ],
      trim: true,
    },

    vendor: {
      type: String,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        'Cash',
        'Credit Card',
        'Debit Card',
        'Bank Transfer',
        'UPI',
        'Other',
      ],
      default: 'Cash',
    },

    amount: {
      type: Number,
      required: [true, 'Expense amount is required.'],
    },

    description: {
      type: String,
      trim: true,
    },

    receiptNumber: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
