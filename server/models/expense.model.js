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
    category: {
      type: String,
      required: [true, 'Expense category is required.'],
      enum: [
        'Salary',
        'Maintenance',
        'Office Rent',
        'Utilities',
        'Marketing',
        'Other',
      ],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required.'],
    },
    description: {
      type: String,
      trim: true,
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
