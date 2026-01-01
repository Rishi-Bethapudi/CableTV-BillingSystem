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
 * @desc   Dashboard metrics for operator (collections, renewals, customer stats, complaints)
 * @route  GET /api/reports/dashboard-summary
 * @access Private (Operator only)
 */
const getDashboardSummary = async (req, res) => {
  try {
    const operatorId = new mongoose.Types.ObjectId(req.user.operatorId);

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const format = (d) => d.toISOString().split('T')[0];
    const todayStr = format(todayStart);
    const monthStartStr = format(monthStart);
    const monthEndStr = format(monthEnd);

    const [
      monthlyPayments,
      todaysPayments,
      pendingAmounts,
      monthlyOnlinePayments,

      todaysRenewals,
      monthRenewals,
      expiredRenewals,
      upcomingRenewals,

      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
      inactiveCustomers,
      pendingComplaints,
    ] = await Promise.all([
      // Month collection
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
      // Today's collection
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
      // Pending amount
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
      // Online payment this month
      Transaction.aggregate([
        {
          $match: {
            operatorId,
            type: 'PAYMENT',
            method: { $in: ['Online', 'UPI', 'GPay', 'PhonePe'] },
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

      // Renewals
      Subscription.countDocuments({
        operatorId,
        expiryDate: { $gte: todayStart, $lte: todayEnd },
      }),
      Subscription.countDocuments({
        operatorId,
        expiryDate: { $gte: monthStart, $lte: monthEnd },
      }),
      Subscription.countDocuments({
        operatorId,
        expiryDate: { $lt: todayStart },
      }),
      Subscription.countDocuments({
        operatorId,
        expiryDate: { $gt: todayEnd },
      }),

      // Customers
      Customer.countDocuments({ operatorId }),
      Customer.countDocuments({ operatorId, active: true }),
      Customer.countDocuments({
        operatorId,
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }),
      Customer.countDocuments({ operatorId, active: false }),
      Complaint.countDocuments({ operatorId, status: 'Pending' }),
    ]);

    const primaryMetrics = [
      {
        id: 1,
        name: 'Monthly Total Collection',
        stat: monthlyPayments[0]?.total || 0,
        des: monthlyPayments[0]?.count || 0,
        currency: true,
        route: '/collection',
        params: { startDate: monthStartStr, endDate: monthEndStr },
      },
      {
        id: 2,
        name: "Today's Collection",
        stat: todaysPayments[0]?.total || 0,
        des: todaysPayments[0]?.count || 0,
        currency: true,
        route: '/collection',
        params: { startDate: todayStr, endDate: todayStr },
      },
      {
        id: 3,
        name: 'Total Pending Amount',
        stat: pendingAmounts[0]?.total || 0,
        des: pendingAmounts[0]?.count || 0,
        currency: true,
        route: '/customers',
        params: { balance: 'pending' },
      },
      {
        id: 4,
        name: 'Monthly Online Collection',
        stat: monthlyOnlinePayments[0]?.total || 0,
        des: monthlyOnlinePayments[0]?.count || 0,
        currency: true,
        route: '/collection',
        params: {
          payment: 'online',
          startDate: monthStartStr,
          endDate: monthEndStr,
        },
      },
    ];

    const secondaryMetrics = [
      {
        id: 5,
        name: "Today's Renewals",
        stat: todaysRenewals,
        route: '/customers',
        params: { dueToday: true },
      },
      {
        id: 6,
        name: 'This Month Renewals',
        stat: monthRenewals,
        route: '/customers',
        params: { dueThisMonth: true },
      },
      {
        id: 7,
        name: 'Upcoming Renewals',
        stat: upcomingRenewals,
        route: '/customers',
        params: { dueUpcoming: true },
      },
      {
        id: 8,
        name: 'Expired Renewals',
        stat: expiredRenewals,
        route: '/customers',
        params: { dueExpired: true },
      },
      {
        id: 9,
        name: 'Total Customers',
        stat: totalCustomers,
        route: '/customers',
      },
      {
        id: 10,
        name: 'Active Customers',
        stat: activeCustomers,
        des: inactiveCustomers,
        route: '/customers',
        params: { status: 'active' },
      },
      {
        id: 11,
        name: 'Inactive Customers',
        stat: inactiveCustomers,
        route: '/customers',
        params: { status: 'inactive' },
      },
      {
        id: 12,
        name: 'New Customers This Month',
        stat: newCustomersThisMonth,
        route: '/customers',
        params: { newThisMonth: true },
      },
      {
        id: 13,
        name: 'Total Pending Complaints',
        stat: pendingComplaints,
        route: '/complaints',
      },
    ];

    return res.status(200).json({ primaryMetrics, secondaryMetrics });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ message: 'Error generating dashboard summary' });
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
const getCollectionDetails = async (req, res) => {
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

    const details = await Transaction.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      // Agent lookup
      {
        $lookup: {
          from: 'agents',
          localField: 'collectedBy',
          foreignField: '_id',
          as: 'agentData',
        },
      },

      // Operator lookup
      {
        $lookup: {
          from: 'operators',
          localField: 'collectedBy',
          foreignField: '_id',
          as: 'operatorData',
        },
      },
      ...(area ? [{ $match: { 'customer.locality': area } }] : []),
      {
        $project: {
          createdAt: 1,
          dateFormatted: {
            $dateToString: { format: '%d-%b-%Y', date: '$createdAt' },
          },
          id: '$customerId',
          name: '$customer.name',
          area: '$customer.locality',
          previousBalance: '$balanceBefore',
          paidAmount: { $abs: '$amount' },
          discount: '$discount',
          currentBalance: '$balanceAfter',
          customerCode: '$customer.customerCode',
          stbNo: '$customer.stbNumber',
          cardNo: '$customer.cardNumber',
          method: '$method',
          collectedBy: {
            $cond: [
              { $gt: [{ $size: '$agentData' }, 0] },
              { $arrayElemAt: ['$agentData.name', 0] },
              { $arrayElemAt: ['$operatorData.name', 0] },
            ],
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const formatted = {};
    details.forEach((tx) => {
      const key = tx.dateFormatted;
      if (!formatted[key]) formatted[key] = { customerDetails: [] };
      formatted[key].customerDetails.push(tx);
    });

    return res.status(200).json({ report: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating details' });
  }
};

const getCollectionAreaSummary = async (req, res) => {
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

    const summary = await Transaction.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      ...(area ? [{ $match: { 'customer.locality': area } }] : []),
      {
        $project: {
          createdAt: 1,
          method: 1,
          amount: { $abs: '$amount' },
          discount: 1,
          dateFormatted: {
            $dateToString: { format: '%d-%b-%Y', date: '$createdAt' },
          },
          area: '$customer.locality',
        },
      },
      {
        $group: {
          _id: { date: '$dateFormatted', area: '$area', mode: '$method' },
          customers: { $sum: 1 },
          amount: { $sum: '$amount' },
          discount: { $sum: '$discount' },
        },
      },
      {
        $group: {
          _id: { date: '$_id.date', area: '$_id.area' },
          modes: {
            $push: {
              mode: '$_id.mode',
              customers: '$customers',
              amount: '$amount',
              discount: '$discount',
              payment: '$amount',
            },
          },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          areas: {
            $push: {
              area: '$_id.area',
              modes: '$modes',
            },
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const formatted = {};
    summary.forEach((row) => {
      formatted[row._id] = {
        summary: { customers: 0, amount: 0, discount: 0, totalPayment: 0 },
        areas: {},
        customerDetails: [],
      };

      row.areas.forEach((a) => {
        formatted[row._id].areas[a.area] = { modes: a.modes };
        a.modes.forEach((m) => {
          formatted[row._id].summary.customers += m.customers;
          formatted[row._id].summary.amount += m.amount;
          formatted[row._id].summary.discount += m.discount;
          formatted[row._id].summary.totalPayment += m.payment;
        });
      });
    });

    return res.status(200).json({ report: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating summary' });
  }
};

module.exports = {
  getDashboardSummary,
  getIncomeReport,
  getDashboardStats,
  getCollectionDetails,
  getCollectionAreaSummary,
};
