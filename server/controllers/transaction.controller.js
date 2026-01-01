const Transaction = require('../models/transaction.model');
const Product = require('../models/product.model');
const Customer = require('../models/customer.model');
const Subscription = require('../models/subscription.model');
const Operator = require('../models/operator.model');
const Counter = require('../models/counter.model');
const mongoose = require('mongoose');
const { addDays, addMonths } = require('date-fns');
const { generateInvoicePDF } = require('../services/invoicePDF');

/**
 * @desc  Generate invoice + renew subscription for a customer
 * @route POST /api/transactions/billing
 * @access Private (Operator or Agent)
 */
const createBilling = async (req, res) => {
  const { customerId, productId, startDate, endDate, durationDays, note } =
    req.body;

  if (!customerId || !productId) {
    return res.status(400).json({
      message: 'Customer ID and Product ID are required.',
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
      throw new Error('Forbidden.');
    }

    // Determine billing start date
    const billingDate = startDate ? new Date(startDate) : new Date();

    // Find last ACTIVE subscription for this product
    const lastSub = await Subscription.findOne({
      customerId,
      productId,
      status: 'ACTIVE',
    })
      .sort({ expiryDate: -1 })
      .session(session);

    let newStartDate, newExpiryDate, renewalNumber;

    if (!lastSub) {
      // First time subscription
      newStartDate = billingDate;
      renewalNumber = 1;
    } else {
      const baseStart =
        lastSub.expiryDate > billingDate ? lastSub.expiryDate : billingDate;
      newStartDate = baseStart;
      renewalNumber = lastSub.renewalNumber + 1;
    }

    // Calculate expiry date
    if (durationDays && durationDays > 0) {
      newExpiryDate = addDays(newStartDate, durationDays);
    } else if (endDate) {
      newExpiryDate = new Date(endDate);
    } else if (product.billingInterval.unit === 'months') {
      newExpiryDate = addMonths(newStartDate, product.billingInterval.value);
    } else {
      newExpiryDate = addDays(newStartDate, product.billingInterval.value);
    }

    // Pricing (scaled if multiple renewal duration)
    const daysInProduct =
      product.billingInterval.unit === 'months'
        ? product.billingInterval.value * 30
        : product.billingInterval.value;

    const totalDays =
      durationDays && durationDays > 0
        ? durationDays
        : Math.ceil((newExpiryDate - newStartDate) / (1000 * 60 * 60 * 24));

    const factor = totalDays / daysInProduct; // e.g. 90 days / 30 days → 3x
    const baseAmount = product.customerPrice * factor;

    const extraCharge = customer.defaultExtraCharge || 0;
    const discount = customer.defaultDiscount || 0;

    const netAmount = baseAmount + extraCharge - discount;
    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + netAmount;

    // Generate invoice number
    const invoiceId = await Counter.getInvoiceNumber(req.user.operatorId);

    // Create transaction record
    const transaction = await Transaction.create(
      [
        {
          customerId,
          operatorId: req.user.operatorId,
          collectedBy: req.user.id,
          collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
          type: 'INVOICE',
          amount: netAmount,
          balanceBefore,
          balanceAfter,
          invoiceId,
          productId,
          startDate: newStartDate,
          expiryDate: newExpiryDate,
          baseAmount,
          extraCharge,
          discount,
          netAmount,
          costOfGoodsSold: product.operatorCost * factor,
          profit: netAmount - product.operatorCost * factor,
          note,
        },
      ],
      { session }
    );

    // Create subscription entry
    const subscription = await Subscription.create(
      [
        {
          customerId,
          operatorId: req.user.operatorId,
          productId,
          planType: product.planType,
          startDate: newStartDate,
          expiryDate: newExpiryDate,
          billingInterval: product.billingInterval,
          customerPrice: product.customerPrice,
          operatorCost: product.operatorCost,
          status: 'ACTIVE',
          renewalNumber,
          invoiceId,
        },
      ],
      { session }
    );

    // Update customer summary
    customer.balanceAmount = balanceAfter;
    customer.lastBillDate = new Date();
    customer.lastBillAmount = netAmount;
    customer.active = true;

    // Push new subscription ID (remove old duplicates)
    customer.activeSubscriptions = [
      ...new Set([
        ...customer.activeSubscriptions.map(String),
        subscription[0]._id.toString(),
      ]),
    ];

    // Compute new earliest expiry
    const allActiveSubs = await Subscription.find({
      customerId,
      status: 'ACTIVE',
    })
      .select('expiryDate')
      .session(session);

    customer.earliestExpiry = allActiveSubs.length
      ? allActiveSubs.map((s) => s.expiryDate).sort()[0]
      : null;

    await customer.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: 'Billing completed successfully.',
      invoiceId,
      transaction: transaction[0],
      subscription: subscription[0],
      customer,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: error.message || 'Failed to complete billing.',
    });
  }
};

/**
 * @desc   Record a payment received from a customer
 * @route  POST /api/transactions/collection
 * @access Private (Operator or Agent)
 */
const createCollection = async (req, res) => {
  const { customerId, amount, method, note } = req.body;

  if (!customerId || !amount || amount <= 0) {
    return res.status(400).json({
      message: 'Customer ID and a positive payment amount are required.',
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) throw new Error('Customer not found.');
    if (customer.operatorId.toString() !== req.user.operatorId)
      throw new Error('Forbidden.');

    const paymentAmount = Number(amount);
    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore - paymentAmount; // always reduces balance

    // Generate receipt number
    const receiptNumber = await Counter.getReceiptNumber(req.user.operatorId);

    // Create transaction (PAYMENT)
    const transaction = await Transaction.create(
      [
        {
          customerId,
          operatorId: req.user.operatorId,
          collectedBy: req.user.id,
          collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
          type: 'PAYMENT',
          amount: -paymentAmount, // signed
          balanceBefore,
          balanceAfter,
          method: method || 'Cash',
          receiptNumber,
          profit: 0, // payment never affects profit
          note,
        },
      ],
      { session }
    );

    // Update customer summary
    customer.balanceAmount = balanceAfter;
    customer.lastPaymentAmount = paymentAmount;
    customer.lastPaymentDate = new Date();
    customer.lastPaymentMethod = method || 'Cash';
    customer.active = true;

    await customer.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: 'Payment recorded successfully.',
      receiptNumber,
      transaction: transaction[0],
      customer,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: error.message || 'Failed to record payment.',
    });
  }
};

/**
 * @desc   Apply an additional charge to a customer's account
 * @route  POST /api/transactions/charge
 * @access Private (Operator or Agent)
 */
const createAddonBilling = async (req, res) => {
  const { customerId, itemIndex, amount, note } = req.body;

  if (!customerId)
    return res.status(400).json({ message: 'Customer ID is required.' });

  if (itemIndex === undefined && (!amount || amount <= 0))
    return res.status(400).json({ message: 'Valid amount required.' });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) throw new Error('Customer not found');
    if (customer.operatorId.toString() !== req.user.operatorId)
      throw new Error('Forbidden');

    const operator = await Operator.findById(req.user.operatorId).session(
      session
    );

    let sellingPrice, costPrice, autoNote;

    // Case 1: Billing via stored item
    if (itemIndex !== undefined && operator.additionalItems[itemIndex]) {
      const item = operator.additionalItems[itemIndex];
      sellingPrice = item.sellingPrice;
      costPrice = item.costPrice;
      autoNote = item.name;
    }

    // Case 2: Manual billing amount
    if (!sellingPrice) {
      sellingPrice = Number(amount);
      costPrice = 0; // no COGS for manual misc charges
    }

    const netAmount = sellingPrice;
    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + netAmount;

    // invoice number
    const invoiceId = await Counter.getInvoiceNumber(req.user.operatorId);

    const transaction = await Transaction.create(
      [
        {
          customerId,
          operatorId: req.user.operatorId,
          collectedBy: req.user.id,
          collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
          type: 'ADDON',
          invoiceId,
          amount: netAmount,
          balanceBefore,
          balanceAfter,
          costOfGoodsSold: costPrice,
          profit: netAmount - costPrice,
          note: note || autoNote || 'Add-on charge',
        },
      ],
      { session }
    );

    // Update customer ledger summary
    customer.balanceAmount = balanceAfter;
    customer.lastBillDate = new Date();
    customer.lastBillAmount = netAmount;
    customer.active = true; // Any billing reactivates

    await customer.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: 'Add-on billing completed successfully',
      invoiceId,
      transaction: transaction[0],
      customer,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: error.message || 'Failed to complete add-on billing.',
    });
  }
};

/**
 * @desc   Adjust customer's balance manually (credit or debit)
 * @route  POST /api/transactions/adjust
 * @access Private (Operator only)
 */
const adjustBalance = async (req, res) => {
  const { customerId, amount, type, note } = req.body;

  if (!customerId || !amount || amount <= 0) {
    return res.status(400).json({
      message: 'Customer ID and positive amount are required.',
    });
  }
  if (!['credit', 'debit'].includes(type)) {
    return res.status(400).json({
      message: "Type must be either 'credit' or 'debit'.",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) throw new Error('Customer not found.');

    // Only operator can manually adjust
    if (customer.operatorId.toString() !== req.user.operatorId)
      throw new Error('Forbidden.');
    if (req.user.role !== 'operator')
      throw new Error('Only operator can perform manual adjustment.');

    // Signed logic: CREDIT decreases balance, DEBIT increases balance
    const signedAmount =
      type === 'credit' ? -Math.abs(amount) : Math.abs(amount);

    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + signedAmount;

    const transaction = await Transaction.create(
      [
        {
          customerId,
          operatorId: req.user.operatorId,
          collectedBy: req.user.id,
          collectedByType: 'Operator',
          type: 'ADJUSTMENT',
          amount: signedAmount,
          balanceBefore,
          balanceAfter,
          profit: 0,
          note: note || `Manual ${type} adjustment`,
        },
      ],
      { session }
    );

    customer.balanceAmount = balanceAfter;
    await customer.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: `Balance ${type} applied successfully.`,
      transaction: transaction[0],
      customer,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: error.message || 'Failed to adjust balance.',
    });
  }
};

/**
 * @desc   Get transaction history (ledger) for a customer with filters + totals
 * @route  GET /api/transactions/customer/:customerId
 * @access Private (Operator or Agent)
 */
const getCustomerTransactions = async (req, res) => {
  try {
    const { customerId } = req.params;
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      type,
      invoiceId,
      receiptNumber,
    } = req.query;

    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: 'Customer not found.' });
    if (customer.operatorId.toString() !== req.user.operatorId)
      return res.status(403).json({ message: 'Forbidden.' });

    const query = { customerId };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (type) query.type = type.toUpperCase();
    if (invoiceId) query.invoiceId = invoiceId;
    if (receiptNumber) query.receiptNumber = receiptNumber;

    const numericLimit = Math.max(5, parseInt(limit));
    const numericPage = Math.max(1, parseInt(page));
    const skip = (numericPage - 1) * numericLimit;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(numericLimit)
        .populate('productId', 'name')
        .populate('collectedBy', 'name')
        .lean(),
      Transaction.countDocuments(query),
    ]);

    return res.status(200).json({
      transactions,
      pagination: {
        total: totalCount,
        page: numericPage,
        pages: Math.ceil(totalCount / numericLimit),
        limit: numericLimit,
      },
      balance: customer.balanceAmount,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      message: 'Server error while fetching transactions.',
    });
  }
};

/**
 * @desc   Reverse an invoice (cancel billing) safely
 * @route  POST /api/transactions/reverse-invoice
 * @access Private (Operator only)
 */
const reverseInvoice = async (req, res) => {
  const { invoiceId, reason } = req.body;

  if (!invoiceId) {
    return res.status(400).json({ message: 'Invoice ID is required.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the original invoice transaction
    const originalTx = await Transaction.findOne({
      invoiceId,
      type: 'INVOICE',
    }).session(session);

    if (!originalTx) throw new Error('Invoice not found.');
    if (originalTx.operatorId.toString() !== req.user.operatorId)
      throw new Error('Forbidden.');

    // Only operator can reverse invoices
    if (req.user.role !== 'operator')
      throw new Error('Only operator can reverse invoices.');

    const customer = await Customer.findById(originalTx.customerId).session(
      session
    );
    if (!customer) throw new Error('Customer not found.');

    // 2. Check if any later transaction exists (meaning payment/renewal happened after)
    const conflict = await Transaction.findOne({
      customerId: originalTx.customerId,
      createdAt: { $gt: originalTx.createdAt },
    }).session(session);

    if (conflict)
      throw new Error(
        'Invoice cannot be reversed because later transactions exist.'
      );

    // 3. Reverse subscription
    const subscription = await Subscription.findOne({
      invoiceId,
      status: 'ACTIVE',
    }).session(session);

    if (!subscription)
      throw new Error('Linked subscription not found or not active.');

    // 4. Ledger reversal math
    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore - originalTx.amount; // undo billing

    // 5. Create reversal transaction
    const reversalTx = await Transaction.create(
      [
        {
          customerId: originalTx.customerId,
          operatorId: req.user.operatorId,
          collectedBy: req.user.id,
          collectedByType: 'Operator',
          type: 'REVERSAL',
          amount: -originalTx.amount, // reverse invoice
          balanceBefore,
          balanceAfter,
          invoiceId: originalTx.invoiceId,
          productId: originalTx.productId,
          startDate: originalTx.startDate,
          expiryDate: originalTx.expiryDate,
          baseAmount: originalTx.baseAmount,
          extraCharge: originalTx.extraCharge,
          discount: originalTx.discount,
          netAmount: -originalTx.netAmount,
          costOfGoodsSold: originalTx.costOfGoodsSold,
          profit: -originalTx.profit, // reverse profit
          note: `Invoice reversed: ${reason || 'No reason provided'}`,
        },
      ],
      { session }
    );

    // 6. Remove the subscription record (restores previous state)
    await Subscription.deleteOne({ _id: subscription._id }).session(session);

    // 7. Update customer summary
    customer.balanceAmount = balanceAfter;

    // recompute activeSubscriptions list & earliestExpiry
    const remainingSubs = await Subscription.find({
      customerId: customer._id,
      status: 'ACTIVE',
    }).session(session);

    customer.activeSubscriptions = remainingSubs.map((s) => s._id);
    customer.earliestExpiry = remainingSubs.length
      ? remainingSubs.map((s) => s.expiryDate).sort()[0]
      : null;

    await customer.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: 'Invoice reversed successfully.',
      reversalTransaction: reversalTx[0],
      invoiceId,
      customer,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: error.message || 'Failed to reverse invoice.',
    });
  }
};
/**
 * @desc   Reverse a payment (cancel a receipt) safely
 * @route  POST /api/transactions/reverse-payment
 * @access Private (Operator only)
 */
const reversePayment = async (req, res) => {
  const { receiptNumber, reason } = req.body;

  if (!receiptNumber) {
    return res.status(400).json({ message: 'Receipt number is required.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find original payment transaction
    const originalTx = await Transaction.findOne({
      receiptNumber,
      type: 'PAYMENT',
    }).session(session);

    if (!originalTx) throw new Error('Payment receipt not found.');
    if (originalTx.operatorId.toString() !== req.user.operatorId)
      throw new Error('Forbidden.');

    // Only operator can reverse payments
    if (req.user.role !== 'operator')
      throw new Error('Only operator can reverse payments.');

    const customer = await Customer.findById(originalTx.customerId).session(
      session
    );
    if (!customer) throw new Error('Customer not found.');

    // 2. Block if later transactions exist
    const conflict = await Transaction.findOne({
      customerId: originalTx.customerId,
      createdAt: { $gt: originalTx.createdAt },
    }).session(session);

    if (conflict)
      throw new Error(
        'Reversal blocked: a later transaction exists after this payment.'
      );

    // 3. Check reversal won't break accounting
    const balanceBefore = customer.balanceAmount;
    const reversalAmount = -originalTx.amount; // PAYMENT was negative, so reversal is positive
    const balanceAfter = balanceBefore + reversalAmount;

    // If reversal causes negative owed-to-customer balance → block (must use refund API instead)
    if (balanceAfter < 0) {
      throw new Error(
        'Payment reversal not permitted: would result in credit balance. Use refund API instead.'
      );
    }

    // 4. Create reversal transaction
    const reversalTx = await Transaction.create(
      [
        {
          customerId: originalTx.customerId,
          operatorId: req.user.operatorId,
          collectedBy: req.user.id,
          collectedByType: 'Operator',
          type: 'REVERSAL',
          amount: reversalAmount, // +ve (restores debt)
          balanceBefore,
          balanceAfter,
          method: originalTx.method,
          receiptNumber: originalTx.receiptNumber,
          profit: 0,
          note: `Payment reversed: ${reason || 'No reason provided'}`,
        },
      ],
      { session }
    );

    // 5. Update customer balance
    customer.balanceAmount = balanceAfter;
    await customer.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: 'Payment reversed successfully.',
      reversalTransaction: reversalTx[0],
      receiptNumber,
      customer,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: error.message || 'Failed to reverse payment.',
    });
  }
};
/**
 * @desc   Refund money to customer (operator pays customer)
 * @route  POST /api/transactions/refund
 * @access Private (Operator only)
 */
const refundPayment = async (req, res) => {
  const { customerId, amount, reason, method } = req.body;

  if (!customerId || !amount || amount <= 0) {
    return res.status(400).json({
      message: 'Customer ID and a positive refund amount are required.',
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) throw new Error('Customer not found.');
    if (customer.operatorId.toString() !== req.user.operatorId)
      throw new Error('Forbidden.');

    // Only operator can issue refund
    if (req.user.role !== 'operator')
      throw new Error('Only operator can issue refund.');

    const refundAmount = Number(amount);
    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore - refundAmount; // refund reduces balance

    // Prevent negative beyond 0 (operator should never refund more than customer owes)
    if (balanceAfter < 0) {
      throw new Error(
        "Refund amount is greater than customer's outstanding balance. Issue credit note instead."
      );
    }

    // Generate refund ID — based on counter like receipt
    const refundId = await Counter.getNextSequence(
      `refund-${req.user.operatorId}`
    );

    // Create refund transaction
    const transaction = await Transaction.create(
      [
        {
          customerId,
          operatorId: req.user.operatorId,
          collectedBy: req.user.id,
          collectedByType: 'Operator',
          type: 'REFUND',
          amount: -refundAmount, // money flows to customer
          balanceBefore,
          balanceAfter,
          method: method || 'Cash',
          refundId,
          profit: 0,
          note: reason || 'Refund issued',
        },
      ],
      { session }
    );

    // Update customer summary
    customer.balanceAmount = balanceAfter;
    await customer.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: 'Refund issued successfully.',
      refundId,
      transaction: transaction[0],
      customer,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message: error.message || 'Failed to issue refund.',
    });
  }
};
/**
 * @desc   Get full details for invoice or receipt
 * @route  GET /api/transactions/details
 * @access Private (Operator or Agent)
 * query: invoiceId OR receiptNumber OR transactionId
 */
const getTransactionDetails = async (req, res) => {
  try {
    const { invoiceId, receiptNumber, transactionId } = req.query;

    if (!invoiceId && !receiptNumber && !transactionId) {
      return res.status(400).json({
        message: 'invoiceId or receiptNumber or transactionId is required.',
      });
    }

    let txQuery = {};
    if (invoiceId) txQuery.invoiceId = invoiceId;
    if (receiptNumber) txQuery.receiptNumber = receiptNumber;
    if (transactionId) txQuery._id = transactionId;

    // Fetch transaction
    const tx = await Transaction.findOne(txQuery)
      .populate('productId', 'name planType customerPrice operatorCost')
      .populate('collectedBy', 'name')
      .lean();

    if (!tx) return res.status(404).json({ message: 'Transaction not found.' });
    if (tx.operatorId.toString() !== req.user.operatorId)
      return res.status(403).json({ message: 'Forbidden.' });

    // Fetch customer
    const customer = await Customer.findById(tx.customerId)
      .select('name contactNumber locality balanceAmount customerCode')
      .lean();

    // Fetch subscription only if invoice
    let subscription = null;
    if (tx.type === 'INVOICE' && tx.productId) {
      subscription = await Subscription.findOne({ invoiceId: tx.invoiceId })
        .select('startDate expiryDate planType renewalNumber customerPrice')
        .lean();
    }

    res.status(200).json({
      transaction: tx,
      customer,
      subscription, // null for payments
      isInvoice: tx.type === 'INVOICE',
      isReceipt: tx.type === 'PAYMENT',
      downloadableId: tx.invoiceId || tx.receiptNumber, // for future PDF download
    });
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({ message: 'Failed to fetch transaction details.' });
  }
};

const getTransactionPDF = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate('customerId')
      .populate('productId')
      .lean();

    if (!transaction)
      return res.status(404).json({ message: 'Transaction not found' });

    const customer = await Customer.findById(transaction.customerId);
    const operator = await Operator.findById(transaction.operatorId);

    if (!customer || !operator)
      return res.status(404).json({ message: 'Invalid mapping' });

    generateInvoicePDF(res, transaction, customer, operator);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate invoice PDF' });
  }
};

module.exports = {
  createBilling,
  createCollection,
  createAddonBilling,
  adjustBalance,
  getCustomerTransactions,
  getTransactionDetails,
  getTransactionPDF,
};
