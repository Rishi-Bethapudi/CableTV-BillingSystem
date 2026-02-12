const mongoose = require('mongoose');
const Subscription = require('../models/subscription.model');
const Product = require('../models/product.model');
const Customer = require('../models/customer.model');
const Transaction = require('../models/transaction.model');
const Counter = require('../models/counter.model');
const createInvoiceAndSubscription = require('./transaction.controller');
const { addDays, addMonths, diffInDays } = require('../utils/date.utils');
const { calculateBilling } = require('../utils/billing.utils');

exports.getCustomerSubscriptions = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    // Ensure customer belongs to this operator
    const customer = await Customer.findOne({
      _id: customerId,
      operatorId: req.user.operatorId,
    }).select('_id');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Fetch all subscriptions (newest first)
    const subscriptions = await Subscription.find({
      customerId,
      operatorId: req.user.operatorId,
    })
      .populate({
        path: 'productId',
        select:
          'name productCode planType customerPrice operatorCost billingInterval isActive',
      })
      .sort({ createdAt: -1 })
      .lean();

    // Optional: split by status for frontend convenience
    const active = [];
    const expired = [];
    const paused = [];
    const terminated = [];

    for (const sub of subscriptions) {
      if (sub.status === 'ACTIVE') active.push(sub);
      else if (sub.status === 'PAUSED') paused.push(sub);
      else if (sub.status === 'TERMINATED') terminated.push(sub);
      else expired.push(sub);
    }

    return res.status(200).json({
      customerId,
      total: subscriptions.length,
      summary: {
        active: active.length,
        paused: paused.length,
        expired: expired.length,
        terminated: terminated.length,
      },
      subscriptions,
      grouped: {
        active,
        paused,
        expired,
        terminated,
      },
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    return res.status(500).json({
      message: 'Failed to fetch subscriptions',
    });
  }
};

/**
 * 🔁 RENEW SUBSCRIPTION
 */
exports.renewSubscription = async (req, res) => {
  const { subscriptionId } = req.params;
  const { startMode, customStartDate, durationValue, note } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const oldSub = await Subscription.findById(subscriptionId).session(session);
    if (!oldSub) throw new Error('Subscription not found');

    const customer = await Customer.findById(oldSub.customerId).session(
      session,
    );
    const product = await Product.findById(oldSub.productId).session(session);

    // ---------- Start date ----------
    let startDate;
    if (startMode === 'TODAY') startDate = new Date();
    else if (startMode === 'CUSTOM') startDate = new Date(customStartDate);
    else startDate = oldSub.expiryDate;

    const { subscription, balanceAfter } = await createInvoiceAndSubscription({
      customer,
      product,
      operator: {
        operatorId: req.user.operatorId,
        userId: req.user.id,
        role: req.user.role,
      },
      startDate,
      durationValue,
      durationUnit: product.billingInterval.unit,
      renewalNumber: oldSub.renewalNumber + 1,
      note,
      session,
    });

    // ---------- Expire old ----------
    oldSub.status = 'EXPIRED';
    await oldSub.save({ session });

    // ---------- Customer summary ----------
    customer.balanceAmount = balanceAfter;
    customer.lastBillDate = new Date();
    customer.lastBillAmount = subscription.customerPrice;
    customer.activeSubscriptions.push(subscription._id);

    await customer.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Renewed successfully', subscription });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({ message: e.message });
  } finally {
    session.endSession();
  }
};

exports.addSubscription = async (req, res) => {
  const { customerId, productId, startDate, durationValue, note } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await Customer.findById(customerId).session(session);
    const product = await Product.findById(productId).session(session);

    const { subscription, balanceAfter } = await createInvoiceAndSubscription({
      customer,
      product,
      operator: {
        operatorId: req.user.operatorId,
        userId: req.user.id,
        role: req.user.role,
      },
      startDate,
      durationValue,
      durationUnit: product.billingInterval.unit,
      renewalNumber: 1,
      note,
      session,
    });

    customer.balanceAmount = balanceAfter;
    customer.activeSubscriptions.push(subscription._id);
    await customer.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Subscription added', subscription });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({ message: e.message });
  } finally {
    session.endSession();
  }
};

exports.changePlan = async (req, res) => {
  const { subscriptionId } = req.params;
  const { newProductId, startMode, customStartDate, durationValue, note } =
    req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const oldSub = await Subscription.findById(subscriptionId).session(session);
    const customer = await Customer.findById(oldSub.customerId).session(
      session,
    );
    const newProduct = await Product.findById(newProductId).session(session);

    let startDate =
      startMode === 'TODAY'
        ? new Date()
        : startMode === 'CUSTOM'
          ? new Date(customStartDate)
          : oldSub.expiryDate;

    const { subscription, balanceAfter } = await createInvoiceAndSubscription({
      customer,
      product: newProduct,
      operator: {
        operatorId: req.user.operatorId,
        userId: req.user.id,
        role: req.user.role,
      },
      startDate,
      durationValue,
      durationUnit: newProduct.billingInterval.unit,
      renewalNumber: 1,
      note,
      session,
    });

    oldSub.status = 'TERMINATED';
    await oldSub.save({ session });

    customer.balanceAmount = balanceAfter;
    customer.activeSubscriptions.push(subscription._id);
    await customer.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Plan changed', subscription });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({ message: e.message });
  } finally {
    session.endSession();
  }
};

exports.removeSubscription = async (req, res) => {
  const { subscriptionId } = req.params;

  try {
    const sub = await Subscription.findById(subscriptionId);
    if (!sub) return res.status(404).json({ message: 'Not found' });

    sub.status = 'TERMINATED';
    await sub.save();

    await Customer.updateOne(
      { _id: sub.customerId },
      { $pull: { activeSubscriptions: sub._id } },
    );

    res.json({ message: 'Subscription removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
