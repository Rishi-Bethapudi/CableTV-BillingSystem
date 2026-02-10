const mongoose = require('mongoose');
const Subscription = require('../models/subscription.model');
const Product = require('../models/product.model');
const Customer = require('../models/customer.model');
const Transaction = require('../models/transaction.model');
const Counter = require('../models/counter.model');

const { addDays, addMonths, diffInDays } = require('../utils/date.utils');
const { calculateBilling } = require('../utils/billing.utils');

/**
 * 🔁 RENEW SUBSCRIPTION
 */
exports.renewSubscription = async (req, res) => {
  const { subscriptionId } = req.params;
  const { startDate, durationValue, durationUnit, note } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const oldSub = await Subscription.findById(subscriptionId).session(session);
    if (!oldSub) throw new Error('Subscription not found');

    const customer = await Customer.findById(oldSub.customerId).session(
      session,
    );
    const product = await Product.findById(oldSub.productId).session(session);

    if (!customer || !product) throw new Error('Invalid data');

    const start = startDate ? new Date(startDate) : oldSub.expiryDate;

    let expiry;
    if (durationUnit === 'months') {
      expiry = addMonths(start, durationValue);
    } else {
      expiry = addDays(start, durationValue);
    }

    const billing = calculateBilling({
      product,
      durationValue,
      durationUnit,
      customer,
    });

    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + billing.netAmount;

    const invoiceId = await Counter.getInvoiceNumber(req.user.operatorId);

    const [transaction] = await Transaction.create(
      [
        {
          customerId: customer._id,
          operatorId: req.user.operatorId,
          collectedBy: req.user.id,
          collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
          type: 'INVOICE',
          amount: billing.netAmount,
          balanceBefore,
          balanceAfter,
          invoiceId,
          productId: product._id,
          startDate: start,
          expiryDate: expiry,
          ...billing,
          note,
        },
      ],
      { session },
    );

    const [newSub] = await Subscription.create(
      [
        {
          customerId: customer._id,
          operatorId: req.user.operatorId,
          productId: product._id,
          planType: product.planType,
          startDate: start,
          expiryDate: expiry,
          billingInterval: product.billingInterval,
          customerPrice: product.customerPrice,
          operatorCost: product.operatorCost,
          renewalNumber: oldSub.renewalNumber + 1,
          status: 'ACTIVE',
          invoiceId,
        },
      ],
      { session },
    );

    oldSub.status = 'EXPIRED';
    await oldSub.save({ session });

    customer.balanceAmount = balanceAfter;
    customer.lastBillDate = new Date();
    customer.lastBillAmount = billing.netAmount;
    customer.activeSubscriptions.push(newSub._id);
    await customer.save({ session });

    await session.commitTransaction();
    res
      .status(201)
      .json({ message: 'Renewed successfully', subscription: newSub });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
exports.addSubscription = async (req, res) => {
  const {
    customerId,
    productId,
    startDate,
    durationValue,
    durationUnit,
    priceOverride,
    note,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customer = await Customer.findById(customerId).session(session);
    const product = await Product.findById(productId).session(session);

    if (!customer || !product) throw new Error('Invalid data');

    const start = startDate ? new Date(startDate) : new Date();
    const expiry =
      durationUnit === 'months'
        ? addMonths(start, durationValue)
        : addDays(start, durationValue);

    const billing = calculateBilling({
      product,
      durationValue,
      durationUnit,
      priceOverride,
      customer,
    });

    const balanceBefore = customer.balanceAmount;
    const balanceAfter = balanceBefore + billing.netAmount;
    const invoiceId = await Counter.getInvoiceNumber(req.user.operatorId);

    await Transaction.create(
      [
        {
          customerId,
          operatorId: req.user.operatorId,
          collectedBy: req.user.id,
          collectedByType: req.user.role === 'operator' ? 'Operator' : 'Agent',
          type: 'INVOICE',
          amount: billing.netAmount,
          balanceBefore,
          balanceAfter,
          invoiceId,
          productId,
          startDate: start,
          expiryDate: expiry,
          ...billing,
          note,
        },
      ],
      { session },
    );

    const [sub] = await Subscription.create(
      [
        {
          customerId,
          operatorId: req.user.operatorId,
          productId,
          planType: product.planType,
          startDate: start,
          expiryDate: expiry,
          billingInterval: product.billingInterval,
          customerPrice: product.customerPrice,
          operatorCost: product.operatorCost,
          renewalNumber: 1,
          status: 'ACTIVE',
          invoiceId,
        },
      ],
      { session },
    );

    customer.balanceAmount = balanceAfter;
    customer.activeSubscriptions.push(sub._id);
    await customer.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Subscription added', subscription: sub });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
exports.changePlan = async (req, res) => {
  const { subscriptionId } = req.params;
  const { newProductId, effectiveFrom, customStartDate, priceOverride, note } =
    req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const oldSub = await Subscription.findById(subscriptionId).session(session);
    if (!oldSub) throw new Error('Subscription not found');

    const customer = await Customer.findById(oldSub.customerId).session(
      session,
    );
    const newProduct = await Product.findById(newProductId).session(session);

    let start;
    if (effectiveFrom === 'TODAY') start = new Date();
    else if (effectiveFrom === 'EXPIRY') start = oldSub.expiryDate;
    else start = new Date(customStartDate);

    oldSub.status = effectiveFrom === 'TODAY' ? 'TERMINATED' : 'EXPIRED';
    await oldSub.save({ session });

    req.body.customerId = customer._id;
    req.body.productId = newProductId;
    req.body.startDate = start;
    return exports.addSubscription(req, res);
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
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
