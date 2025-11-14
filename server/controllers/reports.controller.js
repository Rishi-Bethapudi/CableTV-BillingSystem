const mongoose = require('mongoose');
const Transaction = require('../models/transaction.model');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Complaint = require('../models/complaint.model');
const Agent = require('../models/agent.model');
const Subscription = require('../models/subscription.model');
const {
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  format,
} = require('date-fns');

const STAT_TYPE = { MONEY: 0, COUNT: 1 };
const SUMMARY_TYPE = {
  COLLECTION: 1,
  TODAY: 0,
  PENDING: 2,
  RENEWALS: 5,
  EXPIRED: 6,
  CUSTOMERS: 3,
  COMPLAINTS: 13,
};

// ------------------------ Helper to format collection report ------------------------
const formatCollectionReport = (collections) => {
  const report = {};

  collections.forEach((tx) => {
    const dateKey = new Date(tx.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    if (!report[dateKey]) {
      report[dateKey] = {
        summary: { customers: 0, amount: 0, discount: 0, totalPayment: 0 },
        areas: {},
        customerDetails: [],
      };
    }

    report[dateKey].summary.customers += 1;
    report[dateKey].summary.amount += tx.amount || 0;
    report[dateKey].summary.discount += tx.discount || 0;
    report[dateKey].summary.totalPayment += tx.amount || 0;

    const area = tx.area || 'Unknown';
    const mode = tx.method || 'Cash';

    if (!report[dateKey].areas[area]) {
      report[dateKey].areas[area] = { modes: [] };
    }

    const existingMode = report[dateKey].areas[area].modes.find(
      (m) => m.mode === mode
    );
    if (existingMode) {
      existingMode.customers += 1;
      existingMode.amount += tx.amount || 0;
      existingMode.discount += tx.discount || 0;
      existingMode.payment += tx.amount || 0;
    } else {
      report[dateKey].areas[area].modes.push({
        mode,
        customers: 1,
        amount: tx.amount || 0,
        discount: tx.discount || 0,
        payment: tx.amount || 0,
      });
    }

    report[dateKey].customerDetails.push({
      id: tx.customerId,
      name: tx.customerName || '',
      area: tx.area || '',
      balanceBefore: tx.balanceBefore || 0,
      paidAmount: tx.amount || 0,
      discount: tx.discount || 0,
      balanceAfter: tx.balanceAfter || 0,
      collectedBy: tx.collectedBy || '',
      customerCode: tx.customerCode || '',
      stbNumber: tx.stbNumber || '',
      cardNumber: tx.cardNumber || '',
      method: tx.method || 'Cash',
    });
  });

  return report;
};

/**
 * @desc   Detailed payments report (date → area → mode → customers)
 * @route  GET /api/reports/collection
 * @access Private (Operator or Agent)
 */
const getCollectionReport = async (req, res) => {
  try {
    const { startDate, endDate, agentId, area, paymentMode } = req.query;
    const operatorId = req.user.operatorId;

    const match = {
      operatorId: new mongoose.Types.ObjectId(operatorId),
      type: 'PAYMENT',
    };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    if (agentId) match.collectedBy = new mongoose.Types.ObjectId(agentId);
    if (paymentMode) match.method = paymentMode;

    const payments = await Transaction.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerInfo',
        },
      },
      { $unwind: '$customerInfo' },
      {
        $project: {
          date: '$createdAt',
          customerId: 1,
          method: 1,
          amount: { $abs: '$amount' }, // convert negative to positive
          balanceBefore: 1,
          balanceAfter: 1,
          customerName: '$customerInfo.name',
          customerCode: '$customerInfo.customerCode',
          area: '$customerInfo.locality',
        },
      },
      { $sort: { date: -1 } },
    ]);

    // Group and format for UI (similar to previous output format)
    const formatted = {};
    payments.forEach((tx) => {
      const dateKey = format(tx.date, 'dd-MMM-yyyy');

      if (!formatted[dateKey]) {
        formatted[dateKey] = {
          summary: { customers: 0, amount: 0 },
          areas: {},
          customerDetails: [],
        };
      }

      formatted[dateKey].summary.customers++;
      formatted[dateKey].summary.amount += tx.amount;

      if (!formatted[dateKey].areas[tx.area])
        formatted[dateKey].areas[tx.area] = {};

      if (!formatted[dateKey].areas[tx.area][tx.method])
        formatted[dateKey].areas[tx.area][tx.method] = {
          customers: 0,
          amount: 0,
        };

      formatted[dateKey].areas[tx.area][tx.method].customers++;
      formatted[dateKey].areas[tx.area][tx.method].amount += tx.amount;

      formatted[dateKey].customerDetails.push(tx);
    });

    res.status(200).json({ report: formatted });
  } catch (error) {
    console.error('Error fetching collection report:', error);
    res.status(500).json({ message: 'Server error while fetching report.' });
  }
};

/**
 * @desc   Summary of payments grouped by Date → Area → Payment Mode
 * @route  GET /api/reports/collection-summary
 * @access Private (Operator or Agent)
 */
const getCollectionSummary = async (req, res) => {
  try {
    const { startDate, endDate, area, collectedBy, paymentMode } = req.query;
    const operatorId = req.user.operatorId;

    const match = {
      operatorId: new mongoose.Types.ObjectId(operatorId),
      type: 'PAYMENT',
    };

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    } else {
      // default: today
      match.createdAt = {
        $gte: startOfDay(new Date()),
        $lte: endOfDay(new Date()),
      };
    }

    if (collectedBy)
      match.collectedBy = new mongoose.Types.ObjectId(collectedBy);
    if (paymentMode) match.method = paymentMode;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerInfo',
        },
      },
      { $unwind: '$customerInfo' },
      ...(area ? [{ $match: { 'customerInfo.locality': area } }] : []),
      {
        $project: {
          createdAt: 1,
          method: 1,
          area: '$customerInfo.locality',
          amount: { $abs: '$amount' }, // convert negative to positive
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            area: '$area',
            mode: '$method',
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: { date: '$_id.date', area: '$_id.area' },
          modes: {
            $push: {
              mode: '$_id.mode',
              count: '$count',
              amount: '$amount',
            },
          },
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: '$count' },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          areas: {
            $push: {
              area: '$_id.area',
              modes: '$modes',
              areaTotalAmount: '$totalAmount',
              areaTotalCount: '$totalCount',
            },
          },
          dateTotalAmount: { $sum: '$totalAmount' },
          dateTotalCount: { $sum: '$totalCount' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          areas: 1,
          totalAmount: '$dateTotalAmount',
          totalCount: '$dateTotalCount',
        },
      },
    ];

    const result = await Transaction.aggregate(pipeline);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error('Error generating collection summary:', error);
    res.status(500).json({ message: 'Server error while generating summary.' });
  }
};

/**
 * @desc   Dashboard metrics for operator (collections, renewals, customer stats, complaints)
 * @route  GET /api/reports/dashboard-summary
 * @access Private (Operator only)
 */
const getDashboardSummary = async (req, res) => {
  try {
    const operatorId = req.user.operatorId;

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // ---- Aggregations (in parallel for speed) ----
    const [
      monthlyPayments,
      todaysPayments,
      pendingAmounts,
      monthlyOnlinePayments,
      todaysRenewals,
      monthRenewals,
      upcomingRenewals,
      expiredRenewals,
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
      pendingComplaints,
    ] = await Promise.all([
      // Monthly Collection
      Transaction.aggregate([
        {
          $match: {
            operatorId,
            type: 'PAYMENT',
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $abs: '$amount' } },
            count: { $sum: 1 },
          },
        },
      ]),

      // Today's Collection
      Transaction.aggregate([
        {
          $match: {
            operatorId,
            type: 'PAYMENT',
            createdAt: { $gte: todayStart, $lte: todayEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $abs: '$amount' } },
            count: { $sum: 1 },
          },
        },
      ]),

      // Total Pending
      Customer.aggregate([
        { $match: { operatorId, balanceAmount: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$balanceAmount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Monthly Online Collection
      Transaction.aggregate([
        {
          $match: {
            operatorId,
            type: 'PAYMENT',
            method: 'Online',
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $abs: '$amount' } },
            count: { $sum: 1 },
          },
        },
      ]),

      // Today's Renewals
      Subscription.countDocuments({
        operatorId,
        expiryDate: { $gte: todayStart, $lte: todayEnd },
      }),

      // Month Renewals
      Subscription.countDocuments({
        operatorId,
        expiryDate: { $gte: monthStart, $lte: monthEnd },
      }),

      // Upcoming Renewals (after today)
      Subscription.countDocuments({
        operatorId,
        expiryDate: { $gt: todayEnd },
      }),

      // Expired Renewals (before today)
      Subscription.countDocuments({
        operatorId,
        expiryDate: { $lt: todayStart },
      }),

      // Total Customers
      Customer.countDocuments({ operatorId }),

      // Active Customers
      Customer.countDocuments({ operatorId, active: true }),

      // New Customers This Month
      Customer.countDocuments({
        operatorId,
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }),

      // Pending Complaints
      Complaint.countDocuments({ operatorId, status: 'Pending' }),
    ]);

    // ---- Format Response ----
    const active = activeCustomers;
    const inactive = totalCustomers - active;

    const responseData = {
      primaryMetrics: [
        {
          id: 1,
          name: 'Monthly Collection',
          stat: monthlyPayments[0]?.total || 0,
          des: monthlyPayments[0]?.count || 0,
          type: 'MONEY',
        },
        {
          id: 2,
          name: "Today's Collection",
          stat: todaysPayments[0]?.total || 0,
          des: todaysPayments[0]?.count || 0,
          type: 'MONEY',
        },
        {
          id: 3,
          name: 'Pending Amount',
          stat: pendingAmounts[0]?.total || 0,
          des: pendingAmounts[0]?.count || 0,
          type: 'MONEY',
        },
        {
          id: 4,
          name: 'Monthly Online Collection',
          stat: monthlyOnlinePayments[0]?.total || 0,
          des: monthlyOnlinePayments[0]?.count || 0,
          type: 'MONEY',
        },
      ],
      secondaryMetrics: [
        { id: 5, name: "Today's Renewals", stat: todaysRenewals },
        { id: 6, name: 'This Month Renewals', stat: monthRenewals },
        { id: 7, name: 'Upcoming Renewals', stat: upcomingRenewals },
        { id: 8, name: 'Expired Renewals', stat: expiredRenewals },
        { id: 9, name: 'Total Customers', stat: totalCustomers },
        { id: 10, name: 'Active Customers', stat: active },
        { id: 11, name: 'Inactive Customers', stat: inactive },
        {
          id: 12,
          name: 'New Customers This Month',
          stat: newCustomersThisMonth,
        },
        { id: 13, name: 'Pending Complaints', stat: pendingComplaints },
      ],
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error generating dashboard summary:', error);
    res
      .status(500)
      .json({ message: 'Server error while generating dashboard summary.' });
  }
};

/**
 * @desc   Income report (revenue, cost, profit) based only on invoices
 * @route  GET /api/reports/income
 * @access Private (Operator only)
 */
const getIncomeReport = async (req, res) => {
  try {
    const operatorId = req.user.operatorId;
    const { period, startDate, endDate } = req.query;

    const now = new Date();
    let dateFilter = {};

    // Predefined period filters
    switch (period) {
      case 'daily':
        dateFilter = {
          $gte: startOfDay(now),
          $lte: endOfDay(now),
        };
        break;

      case 'monthly':
        dateFilter = {
          $gte: startOfMonth(now),
          $lte: endOfMonth(now),
        };
        break;

      case 'yearly':
        dateFilter = {
          $gte: new Date(now.getFullYear(), 0, 1),
          $lte: new Date(now.getFullYear(), 11, 31),
        };
        break;
    }

    // Custom date range override
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    const match = {
      operatorId,
      type: 'INVOICE',
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    };

    const [report] = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }, // invoice amount is already +ve
          totalCost: { $sum: '$costOfGoodsSold' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalCost: 1,
          totalProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
        },
      },
    ]);

    res
      .status(200)
      .json(report || { totalRevenue: 0, totalCost: 0, totalProfit: 0 });
  } catch (error) {
    console.error('Error fetching income report:', error);
    res
      .status(500)
      .json({ message: 'Server error while fetching income report.' });
  }
};

/**
 * @desc   Lightweight dashboard stats (for mobile / sidebar / quick cards)
 * @route  GET /api/reports/dashboard-stats
 * @access Private (Operator only)
 */
const getDashboardStats = async (req, res) => {
  try {
    const operatorId = req.user.operatorId;

    const [totalCustomers, activeCustomers, pendingAmountAgg] =
      await Promise.all([
        Customer.countDocuments({ operatorId }),
        Customer.countDocuments({ operatorId, active: true }),
        Customer.aggregate([
          { $match: { operatorId } },
          { $group: { _id: null, total: { $sum: '$balanceAmount' } } },
        ]),
      ]);

    const pendingAmount = pendingAmountAgg[0]?.total || 0;

    res.status(200).json({
      totalCustomers,
      activeCustomers,
      inactiveCustomers: totalCustomers - activeCustomers,
      pendingAmount,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res
      .status(500)
      .json({ message: 'Server error while loading dashboard stats.' });
  }
};

module.exports = {
  getCollectionReport,
  getCollectionSummary,
  getDashboardSummary,
  getIncomeReport,
  getDashboardStats,
};
