const Transaction = require('../models/transaction.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Counter = require('../models/counter.model');
const mongoose = require('mongoose');
const { addDays, addMonths } = require('date-fns');

/**
 * @desc    Record a charge (renewal or new subscription) for a customer.
 * @route   POST /api/transactions/billing
 * @access  Private (Operator or Agent)
 */
const createBilling = async (req, res) => {
  const { customerId, productId, note, startDate } = req.body;

  if (!customerId || !productId) {
    return res.status(400).json({
      message: 'Customer ID and Product ID are required for billing.',
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await Customer.findById(customerId).session(session);
    const product = await Product.findById(productId).session(session);

    if (!customer) throw new Error('Customer not found.');
    if (!product) throw new Error('Product not found.');
    if (
      customer.operatorId.toString() !== req.user.operatorId ||
      product.operatorId.toString() !== req.user.operatorId
    ) {
      throw new Error(
        'Forbidden: You are not authorized for this customer or product.'
      );
    }

    const subscriptionIndex = customer.subscriptions.findIndex(
      (sub) => sub.productId.toString() === productId
    );

    const billingDate = startDate ? new Date(startDate) : new Date();
    let newExpiryDate;
    let periodStartDate;

    if (subscriptionIndex > -1) {
      const existingSubscription = customer.subscriptions[subscriptionIndex];
      const baseDate =
        existingSubscription.expiryDate > billingDate
          ? existingSubscription.expiryDate
          : billingDate;
      periodStartDate = baseDate;

      if (product.billingInterval.unit === 'months') {
        newExpiryDate = addMonths(baseDate, product.billingInterval.value);
      } else {
        newExpiryDate = addDays(baseDate, product.billingInterval.value);
      }
    } else {
      periodStartDate = billingDate;
      if (product.billingInterval.unit === 'months') {
        newExpiryDate = addMonths(billingDate, product.billingInterval.value);
      } else {
        newExpiryDate = addDays(billingDate, product.billingInterval.value);
      }
    }

    const finalBillingAmount =
      product.customerPrice +
      (customer.additionalCharge || 0) -
      (customer.discount || 0);
    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + finalBillingAmount;

    if (subscriptionIndex > -1) {
      customer.subscriptions[subscriptionIndex].expiryDate = newExpiryDate;
      customer.subscriptions[subscriptionIndex].status = 'active';
    } else {
      customer.subscriptions.push({
        productId: product._id,
        startDate: billingDate,
        expiryDate: newExpiryDate,
        price: product.customerPrice,
        billingInterval: product.billingInterval,
        status: 'active',
      });
    }

    const invoiceId = await Counter.getReceiptNumber(req.user.operatorId);
    const newTransaction = new Transaction({
      customerId,
      operatorId: req.user.operatorId,
      collectedBy: req.user.id,
      collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
      type: 'Billing',
      amount: finalBillingAmount,
      balanceBefore,
      balanceAfter,
      invoiceId,
      productId: product._id,
      startDate: periodStartDate,
      expiryDate: newExpiryDate,
      costOfGoodsSold: product.operatorCost,
      note,
    });

    customer.balanceAmount = balanceAfter;
    customer.active = true;

    await newTransaction.save({ session });
    await customer.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: 'Customer billed successfully.',
      transaction: newTransaction,
      customer,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating billing:', error);
    res
      .status(500)
      .json({
        message: error.message || 'Server error while recording billing.',
      });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Record a payment (collection) from a customer
 * @route   POST /api/transactions/collection
 * @access  Private (Operator or Agent)
 */
const createCollection = async (req, res) => {
  const { customerId, amount, discount = 0, method, note } = req.body;

  if (!customerId || !amount || amount <= 0) {
    return res
      .status(400)
      .json({ message: 'Customer ID and a positive amount are required.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) throw new Error('Customer not found.');
    if (customer.operatorId.toString() !== req.user.operatorId)
      throw new Error('Forbidden.');

    const finalAmount = amount - discount;
    if (finalAmount <= 0)
      throw new Error('Final amount after discount must be positive.');

    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore - finalAmount;
    const receiptNumber = await Counter.getReceiptNumber(req.user.operatorId);

    const newTransaction = new Transaction({
      customerId,
      operatorId: req.user.operatorId,
      collectedBy: req.user.id,
      collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
      type: 'Collection',
      amount: -Math.abs(finalAmount),
      balanceBefore,
      balanceAfter,
      method: method || 'Cash',
      receiptNumber,
      note,
    });

    customer.balanceAmount = balanceAfter;

    await newTransaction.save({ session });
    await customer.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Collection recorded successfully.',
      transaction: newTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating collection:', error);
    res
      .status(500)
      .json({
        message: error.message || 'Server error while recording collection.',
      });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Apply a manual charge to a customer's balance.
 * @route   POST /api/transactions/charge
 * @access  Private (Operator or Agent)
 */
const createAdditionalCharge = async (req, res) => {
  const { customerId, amount, note } = req.body;

  if (!customerId || !amount || amount <= 0) {
    return res
      .status(400)
      .json({ message: 'Customer ID and a positive amount are required.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) throw new Error('Customer not found.');
    if (customer.operatorId.toString() !== req.user.operatorId)
      throw new Error('Forbidden.');

    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + amount;

    const newTransaction = new Transaction({
      customerId,
      operatorId: req.user.operatorId,
      collectedBy: req.user.id,
      collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
      type: 'Adjustment', // Using 'Adjustment' as it's a valid enum value in your schema
      amount: amount,
      balanceBefore,
      balanceAfter,
      note: note || 'Additional Charge',
    });

    customer.balanceAmount = balanceAfter;

    await newTransaction.save({ session });
    await customer.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Additional charge applied successfully.',
      transaction: newTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating additional charge:', error);
    res
      .status(500)
      .json({
        message: error.message || 'Server error while applying charge.',
      });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Adjust balance with a credit or debit.
 * @route   POST /api/transactions/adjust
 * @access  Private (Operator only)
 */
const adjustBalance = async (req, res) => {
  const { customerId, amount, type, note } = req.body;

  if (!customerId || !amount || amount <= 0) {
    return res
      .status(400)
      .json({ message: 'Customer ID and a positive amount are required.' });
  }
  if (!['credit', 'debit'].includes(type)) {
    return res
      .status(400)
      .json({ message: "Type must be 'credit' or 'debit'." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) throw new Error('Customer not found.');
    if (customer.operatorId.toString() !== req.user.operatorId)
      throw new Error('Forbidden.');

    // Credit reduces balance (like a payment), Debit increases balance (like a charge)
    const adjustmentAmount =
      type === 'credit' ? -Math.abs(amount) : Math.abs(amount);

    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + adjustmentAmount;

    const newTransaction = new Transaction({
      customerId,
      operatorId: req.user.operatorId,
      collectedBy: req.user.id,
      collectedByType: 'Operator',
      type: 'Adjustment',
      amount: adjustmentAmount,
      balanceBefore,
      balanceAfter,
      note: note || `Manual ${type} adjustment`,
    });

    customer.balanceAmount = balanceAfter;

    await newTransaction.save({ session });
    await customer.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      message: 'Balance adjusted successfully.',
      transaction: newTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error adjusting balance:', error);
    res
      .status(500)
      .json({
        message: error.message || 'Server error while adjusting balance.',
      });
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Get transaction history (ledger) for a customer.
 * @route   GET /api/transactions/:customerId
 * @access  Private (Operator or Agent)
 */
const getCustomerTransactions = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    if (customer.operatorId.toString() !== req.user.operatorId) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const query = { customerId };
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('collectedBy', 'name')
      .populate('productId', 'name') // Added populate for product name
      .lean();

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      data: transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  createBilling,
  createCollection,
  createAdditionalCharge,
  adjustBalance,
  getCustomerTransactions,
};
