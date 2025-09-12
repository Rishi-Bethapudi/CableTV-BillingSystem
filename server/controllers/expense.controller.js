const Expense = require('../models/expense.model');
const mongoose = require('mongoose');
const Counter = require('../models/counter.model'); // if you want auto expenseNumber

/**
 * @desc    Create a new expense
 * @route   POST /api/expenses
 * @access  Private (Operator only)
 */
const createExpense = async (req, res) => {
  try {
    const {
      category,
      amount,
      description,
      expenseDate,
      vendor,
      paymentMethod,
      receiptNumber,
      notes,
    } = req.body;

    if (!category || !amount) {
      return res
        .status(400)
        .json({ message: 'Category and amount are required.' });
    }

    // Auto-generate expenseNumber if not provided
    let expenseNumber = req.body.expenseNumber;
    if (!expenseNumber) {
      const seq = await Counter.getNextSequence('expenseNumber');
      expenseNumber = `EXP${seq.toString().padStart(4, '0')}`;
    }

    const newExpense = new Expense({
      operatorId: req.user.id,
      recordedBy: req.user.id,
      recordedByType: 'Operator', // extend later for agents if needed
      expenseNumber,
      expenseDate,
      category,
      vendor,
      paymentMethod,
      amount,
      description,
      receiptNumber,
      notes,
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Server error while creating expense.' });
  }
};

/**
 * @desc    Get all expenses for an operator
 * @route   GET /api/expenses
 * @access  Private (Operator only)
 */
const getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, paymentMethod, vendor } = req.query;
    const query = { operatorId: req.user.id };

    if (category) query.category = category;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (vendor) query.vendor = new RegExp(vendor, 'i');
    if (startDate && endDate) {
      query.expenseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const expenses = await Expense.find(query).sort({ expenseDate: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server error while fetching expenses.' });
  }
};

/**
 * @desc    Get a single expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private (Operator only)
 */
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid expense ID.' });
    }

    const expense = await Expense.findById(id);
    if (!expense || expense.operatorId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    res.status(200).json(expense);
  } catch (error) {
    console.error('Error fetching expense by ID:', error);
    res.status(500).json({ message: 'Server error while fetching expense.' });
  }
};

/**
 * @desc    Update an expense
 * @route   PUT /api/expenses/:id
 * @access  Private (Operator only)
 */
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid expense ID.' });
    }

    const expense = await Expense.findById(id);
    if (!expense || expense.operatorId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Server error while updating expense.' });
  }
};

/**
 * @desc    Delete an expense
 * @route   DELETE /api/expenses/:id
 * @access  Private (Operator only)
 */
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid expense ID.' });
    }

    const expense = await Expense.findById(id);
    if (!expense || expense.operatorId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    await Expense.findByIdAndDelete(id);
    res.status(200).json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Server error while deleting expense.' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
