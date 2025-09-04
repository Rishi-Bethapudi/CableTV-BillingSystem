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
    const invoiceId = await Counter.getInvoiceId(req.user.operatorId);

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
const createCollection = async (req, res) => {
  const { customerId, amount, method, note } = req.body;

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

    // --- Generate Auto-Incrementing Receipt Number ---
    const receiptNumber = await Counter.getReceiptNumber(req.user.operatorId);

    // --- Create the Transaction Record ---
    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore - amount; // Subtract payment from balance

    const newTransaction = new Transaction({
      customerId,
      operatorId: req.user.operatorId,
      collectedBy: req.user.id,
      collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
      type: 'Collection',
      amount: -Math.abs(amount), // Record as a negative value
      balanceBefore,
      balanceAfter,
      method: method || 'Cash',
      receiptNumber,
      note,
    });

    // --- Update the Customer record ---
    // THIS DOES NOT AFFECT THE EXPIRY DATE
    customer.balanceAmount = balanceAfter;
    customer.lastPaymentAmount = amount;

    // --- Save changes and respond ---
    await newTransaction.save();
    await customer.save();

    // --- Prepare SMS message for the frontend ---
    const smsMessage = `Dear ${
      customer.name
    }, payment of Rs.${amount} received. Your new balance is Rs.${balanceAfter.toFixed(
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

module.exports = {
  createBilling,
  createCollection,
  getCustomerTransactions,
};
