const Transaction = require('../models/transaction.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Counter = require('../models/counter.model');
const mongoose = require('mongoose');

/**
 * @desc    Record a charge (renewal/billing) for a customer, which extends their service period.
 * @route   POST /api/transactions/billing
 * @access  Private (Operator or Agent)
 */
const createBilling = async (req, res) => {
  // The productId is now mandatory for billing, as it defines the service.
  const { customerId, productId, note } = req.body;

  if (!customerId || !productId) {
    return res.status(400).json({
      message: 'Customer ID and Product ID are required for billing.',
    });
  }

  try {
    // --- 1. Fetch all necessary documents ---
    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: 'Customer not found.' });
    if (customer.operatorId.toString() !== req.user.operatorId) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to bill this customer.',
      });
    }

    const product = await Product.findById(productId);
    if (!product || product.operatorId.toString() !== req.user.operatorId) {
      return res
        .status(404)
        .json({ message: 'Product not found or not authorized.' });
    }

    // --- 2. Calculate the final billing amount ---
    const basePrice = product.customerPrice;
    const additionalCharges = customer.additionalCharge || 0;
    const discount = customer.discount || 0;
    const finalBillingAmount = basePrice + additionalCharges - discount;

    // --- 3. Calculate the new Expiry Date ---
    // Determine the starting point for the new subscription period.
    // If current expiry is in the past, start from today. Otherwise, stack the subscription.
    const today = new Date();
    const currentExpiry = customer.expiryDate
      ? new Date(customer.expiryDate)
      : today;
    const startDateForNewPeriod = currentExpiry > today ? currentExpiry : today;

    const newExpiryDate = new Date(startDateForNewPeriod);
    newExpiryDate.setDate(newExpiryDate.getDate() + product.billingInterval);

    // --- 4. Generate unique Invoice ID ---
    const invoiceId = await Counter.getReceiptNumber(req.user.operatorId);

    // --- 5. Create the Transaction Record ---
    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + finalBillingAmount;

    const newTransaction = new Transaction({
      customerId,
      operatorId: req.user.operatorId,
      collectedBy: req.user.id,
      collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
      type: 'Billing',
      amount: finalBillingAmount, // The charge amount
      balanceBefore,
      balanceAfter,
      invoiceId,
      costOfGoodsSold: product.operatorCost, // For profit tracking
      note,
    });

    // --- 6. Update the Customer record ---
    customer.balanceAmount = balanceAfter;
    customer.lastPaymentDate = new Date();
    customer.expiryDate = newExpiryDate;
    customer.productId = productId; // Update to the new product/plan
    customer.active = true; // Ensure customer is marked active on billing

    // --- 7. Save all changes atomically ---
    await newTransaction.save();
    await customer.save();

    res.status(201).json({
      message: 'Customer billed successfully. Service period extended.',
      transaction: newTransaction,
      updatedCustomer: customer,
    });
  } catch (error) {
    console.error('Error creating billing:', error);
    res.status(500).json({ message: 'Server error while recording billing.' });
  }
};

/**
 * @desc    Record a payment (collection) from a customer to settle their balance.
 * @route   POST /api/transactions/collection
 * @access  Private (Operator or Agent)
 */
// POST /api/transactions/collection
const createCollection = async (req, res) => {
  const {
    customerId,
    amount,
    discount = 0,
    method,
    note,
    recordedAt,
  } = req.body;

  if (!customerId || !amount) {
    return res
      .status(400)
      .json({ message: 'Customer ID and amount are required.' });
  }

  if (amount <= 0) {
    return res
      .status(400)
      .json({ message: 'Collection amount must be positive.' });
  }

  try {
    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: 'Customer not found.' });

    if (customer.operatorId.toString() !== req.user.operatorId) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    // Apply discount if provided
    const finalAmount = amount - discount;
    if (finalAmount <= 0) {
      return res
        .status(400)
        .json({ message: 'Final amount after discount must be positive.' });
    }

    // Generate receipt number
    const receiptNumber = await Counter.getReceiptNumber(req.user.operatorId);

    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore - finalAmount;

    const newTransaction = new Transaction({
      customerId,
      operatorId: req.user.operatorId,
      collectedBy: req.user.id,
      collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
      type: 'Collection',
      amount: -Math.abs(finalAmount), // negative for collected payment
      discount: discount || 0,
      balanceBefore,
      balanceAfter,
      method: method || 'Cash',
      receiptNumber,
      note,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    });

    // Update customer
    customer.balanceAmount = balanceAfter;
    customer.lastPaymentAmount = finalAmount;
    customer.lastPaymentDate = new Date();

    await newTransaction.save();
    await customer.save();

    const smsMessage = `Dear ${
      customer.name
    }, payment of Rs.${finalAmount} received. Your new balance is Rs.${balanceAfter.toFixed(
      2
    )}. Thank you.`;

    res.status(201).json({
      message: 'Collection recorded successfully.',
      transaction: newTransaction,
      updatedCustomer: customer,
      smsMessage,
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res
      .status(500)
      .json({ message: 'Server error while recording collection.' });
  }
};

/**
 * @desc    Get the full ledger for a single customer.
 * @route   GET /api/transactions/customer/:customerId
 * @access  Private (Operator or Agent)
 */
const getCustomerTransactions = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findById(customerId);

    if (!customer)
      return res.status(404).json({ message: 'Customer not found.' });
    if (customer.operatorId.toString() !== req.user.operatorId) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const transactions = await Transaction.find({ customerId })
      .sort({ createdAt: -1 })
      .populate('collectedBy', 'name');

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const adjustBalance = async (req, res) => {
  const { id: customerId } = req.params;
  const { amount, type, note } = req.body;

  if (!amount || !type) {
    return res.status(400).json({ message: 'Amount and type are required.' });
  }
  if (!['credit', 'debit'].includes(type)) {
    return res.status(400).json({ message: 'Type must be credit or debit.' });
  }

  try {
    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: 'Customer not found.' });
    if (customer.operatorId.toString() !== req.user.operatorId) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const balanceBefore = customer.balanceAmount;
    const adjustmentAmount = type === 'credit' ? amount : -amount;
    const balanceAfter = balanceBefore + adjustmentAmount;
    const invoiceId = await Counter.getReceiptNumber(req.user.operatorId);

    const newTransaction = new Transaction({
      customerId,
      operatorId: req.user.operatorId,
      collectedBy: req.user.id,
      collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
      type: 'Adjustment',
      amount: adjustmentAmount,
      balanceBefore,
      balanceAfter,
      invoiceId,
      note: note || `${type.toUpperCase()} adjustment`,
    });

    customer.balanceAmount = balanceAfter;

    await newTransaction.save();
    await customer.save();

    res.status(201).json({
      message: 'Balance adjustment recorded successfully.',
      transaction: newTransaction,
      updatedCustomer: customer,
    });
  } catch (error) {
    console.error('Error adjusting balance:', error);
    res.status(500).json({ message: 'Server error while adjusting balance.' });
  }
};

const addOnBilling = async (req, res) => {
  const { id: customerId } = req.params;
  const { productId, note } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  try {
    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: 'Customer not found.' });
    if (customer.operatorId.toString() !== req.user.operatorId) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const product = await Product.findById(productId);
    if (!product || product.operatorId.toString() !== req.user.operatorId) {
      return res
        .status(404)
        .json({ message: 'Product not found or unauthorized.' });
    }

    const basePrice = product.customerPrice;
    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + basePrice;

    const invoiceId = await Counter.getReceiptNumber(req.user.operatorId);

    const newTransaction = new Transaction({
      customerId,
      operatorId: req.user.operatorId,
      collectedBy: req.user.id,
      collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
      type: 'AddOn',
      amount: basePrice,
      balanceBefore,
      balanceAfter,
      invoiceId,
      costOfGoodsSold: product.operatorCost,
      note: note || `Add-on: ${product.name}`,
    });

    customer.balanceAmount = balanceAfter;

    await newTransaction.save();
    await customer.save();

    res.status(201).json({
      message: 'Add-on billed successfully.',
      transaction: newTransaction,
      updatedCustomer: customer,
    });
  } catch (error) {
    console.error('Error creating add-on billing:', error);
    res
      .status(500)
      .json({ message: 'Server error while creating add-on billing.' });
  }
};

module.exports = {
  createBilling,
  createCollection,
  getCustomerTransactions,
  adjustBalance,
  addOnBilling,
};
