const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    category: String,
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
