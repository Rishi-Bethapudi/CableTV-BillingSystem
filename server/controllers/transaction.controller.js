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
  const { customerId, productId, note, isAddon = false, startDate } = req.body;

  if (!customerId || !productId) {
    return res.status(400).json({
      message: 'Customer ID and Product ID are required for billing.',
    });
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
        .json({ message: 'Product not found or not authorized.' });
    }

    // --- 1. Billing Calculation ---
    const basePrice = product.customerPrice;
    const additionalCharges = customer.additionalCharge || 0;
    const discount = customer.discount || 0;
    const finalBillingAmount = basePrice + additionalCharges - discount;

    // take startDate from frontend (default: today if missing)
    const billingDate = startDate ? new Date(startDate) : new Date();
    let newExpiryDate = customer.expiryDate
      ? new Date(customer.expiryDate)
      : null;

    // --- 2. Expiry & Product Logic ---
    if (!isAddon) {
      if (!customer.expiryDate || newExpiryDate < billingDate) {
        // expired → reset plan
        newExpiryDate = new Date(billingDate);
        newExpiryDate.setDate(
          newExpiryDate.getDate() + product.billingInterval
        );
        customer.productId = [productId];
      } else {
        // active → replace product but keep expiry
        customer.productId = [productId];
      }
    } else {
      // addon → keep expiry unchanged
      if (!customer.productId.includes(productId)) {
        customer.productId.push(productId);
      }
    }

    // --- 3. Transaction & Invoice ---
    const invoiceId = await Counter.getReceiptNumber(req.user.operatorId);
    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + finalBillingAmount;

    const newTransaction = new Transaction({
      customerId,
      operatorId: req.user.operatorId,
      collectedBy: req.user.id,
      collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
      type: isAddon ? 'AddOn' : 'Billing',
      amount: finalBillingAmount,
      balanceBefore,
      balanceAfter,
      invoiceId,
      costOfGoodsSold: product.operatorCost,
      note,
      createdAt: billingDate, // 👈 tie transaction date to frontend date
    });

    // --- 4. Update customer ---
    customer.balanceAmount = balanceAfter;
    customer.lastPaymentDate = billingDate;
    if (!isAddon) customer.expiryDate = newExpiryDate;
    customer.active = true;

    await newTransaction.save();
    await customer.save();

    res.status(201).json({
      message: isAddon
        ? 'Customer billed successfully for addon.'
        : 'Customer billed successfully for main plan.',
      transaction: newTransaction,
      updatedCustomer: customer,
    });
  } catch (error) {
    console.error('Error creating billing:', error);
    res.status(500).json({ message: 'Server error while recording billing.' });
  }
};

const createAdditionalCharge = async (req, res) => {
  const { id: customerId } = req.params;
  const { amount, note } = req.body;

  if (!customerId || !amount) {
    return res
      .status(400)
      .json({ message: 'Customer ID and amount are required.' });
  }

  try {
    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: 'Customer not found.' });

    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + amount;

    const newTransaction = new Transaction({
      customerId,
      operatorId: req.user.operatorId,
      collectedBy: req.user.id,
      collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
      type: 'AdditionalCharge',
      amount,
      balanceBefore,
      balanceAfter,
      note,
    });

    customer.balanceAmount = balanceAfter;
    await newTransaction.save();
    await customer.save();

    res.status(201).json({
      message: 'Additional charge applied successfully.',
      transaction: newTransaction,
      updatedCustomer: customer,
    });
  } catch (error) {
    console.error('Error creating additional charge:', error);
    res
      .status(500)
      .json({ message: 'Server error while applying additional charge.' });
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
 * @route   GET /api/customer/:customerId/transactions
 * @access  Private (Operator or Agent)
 */
const getCustomerTransactions = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10, startDate, endDate, mode } = req.query;

    // Validate customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    if (customer.operatorId.toString() !== req.user.operatorId) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    // Build filter query
    const query = { customerId };

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (mode) {
      query.mode = mode; // e.g. 'cash', 'online'
    }

    // Pagination calculation
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch transactions
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('collectedBy', 'name'),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
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
  createAdditionalCharge,
  createCollection,
  getCustomerTransactions,
  adjustBalance,
  addOnBilling,
};
