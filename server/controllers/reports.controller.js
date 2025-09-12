const Transaction = require('../models/transaction.model');
const Customer = require('../models/customer.model');
const mongoose = require('mongoose');
const Complaint = require('../models/complaint.model');
const Agent = require('../models/agent.model');
const {
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  format,
} = require('date-fns');
const STAT_TYPE = {
  MONEY: 0,
  COUNT: 1,
};

const SUMMARY_TYPE = {
  COLLECTION: 1,
  TODAY: 0,
  PENDING: 2,
  RENEWALS: 5,
  EXPIRED: 6,
  CUSTOMERS: 3,
  COMPLAINTS: 13,
};
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

    // Update summary
    report[dateKey].summary.customers += 1;
    report[dateKey].summary.amount += tx.amount || 0;
    report[dateKey].summary.discount += tx.discount || 0;
    report[dateKey].summary.totalPayment += tx.amount || 0;

    // Update areas and payment modes
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

    // Add customer details
    report[dateKey].customerDetails.push({
      id: tx.customerId,
      name: tx.customerName || '',
      area: tx.area || '',
      previousBalance: tx.previousBalance || 0,
      paidAmount: tx.amount || 0,
      discount: tx.discount || 0,
      currentBalance: tx.currentBalance || 0,
      collectedBy: tx.collectedBy || '',
      customerCode: tx.customerCode || '',
      stbNo: tx.stbNo || '',
      cardNo: tx.cardNo || '',
      method: tx.method || 'Cash',
    });
  });

  return report;
};
/**
 * @desc    Get a detailed report of all collections with filters.
 * @route   GET /api/reports/collections
 * @access  Private (Operator only)
 */
const getCollectionReport = async (req, res) => {
  try {
    const { startDate, endDate, agentId, area, payment, status } = req.query;

    // Build MongoDB aggregation pipeline
    const pipeline = [
      { $match: { type: 'Collection' } },

      // Join customer info
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerInfo',
        },
      },
      { $unwind: '$customerInfo' },

      // Join agent/operator info
      {
        $lookup: {
          from: 'agents',
          localField: 'collectedBy',
          foreignField: '_id',
          as: 'agentInfo',
        },
      },
      {
        $lookup: {
          from: 'operators',
          localField: 'collectedBy',
          foreignField: '_id',
          as: 'operatorInfo',
        },
      },

      // Project required fields
      {
        $project: {
          _id: 0,
          receiptNumber: 1,
          date: '$createdAt',
          amount: 1,
          discount: 1,
          customerId: 1,
          customerName: '$customerInfo.name',
          area: '$customerInfo.locality',
          previousBalance: '$customerInfo.balance',
          currentBalance: '$customerInfo.currentBalance',
          collectedBy: {
            $ifNull: [
              { $arrayElemAt: ['$agentInfo.name', 0] },
              { $arrayElemAt: ['$operatorInfo.name', 0] },
            ],
          },
          customerCode: '$customerInfo.customerCode',
          stbNo: '$customerInfo.stbNo',
          cardNo: '$customerInfo.cardNo',
          method: 1,
        },
      },
    ];

    // Date filters
    if (startDate || endDate) {
      const matchDates = {};
      if (startDate) matchDates.$gte = new Date(startDate);
      if (endDate) matchDates.$lte = new Date(endDate);
      pipeline.push({ $match: { createdAt: matchDates } });
    }

    // Additional filters
    if (agentId)
      pipeline.push({
        $match: { collectedBy: new mongoose.Types.ObjectId(agentId) },
      });
    if (area)
      pipeline.push({
        $match: { 'customerInfo.locality': new RegExp(area, 'i') },
      });
    if (payment) {
      pipeline.push({
        $match: { method: new RegExp(`^${payment}$`, 'i') }, // e.g. Cash, Online, UPI
      });
    }
    if (status) {
      if (status === 'paid') pipeline.push({ $match: { amount: { $gt: 0 } } });
      if (status === 'pending')
        pipeline.push({ $match: { currentBalance: { $gt: 0 } } });
    }

    // Sort by date descending
    pipeline.push({ $sort: { date: -1 } });

    const collections = await Transaction.aggregate(pipeline);
    const formattedData = formatCollectionReport(collections);
    let totalSummary = {
      customers: 0,
      amount: 0,
      discount: 0,
      totalPayment: 0,
    };
    Object.values(formattedData).forEach((day) => {
      totalSummary.customers += day.summary.customers;
      totalSummary.amount += day.summary.amount;
      totalSummary.discount += day.summary.discount;
      totalSummary.totalPayment += day.summary.totalPayment;
    });

    // Send both detailed report and totals
    res.status(200).json({
      report: formattedData,
      totals: totalSummary,
    });
  } catch (error) {
    console.error('Error fetching collection report:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

const getCollectionSummary = async (req, res) => {
  try {
    const operatorId = new mongoose.Types.ObjectId(req.user.id);
    const { startDate, endDate, area, collectedBy, paymentMode } = req.query;

    // --- 1. Build the initial `$match` stage for filtering ---
    // This is the most critical step for performance and security.
    const matchStage = {
      operatorId: operatorId,
      type: 'Collection',
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: startOfDay(new Date(startDate)),
        $lte: endOfDay(new Date(endDate)),
      };
    } else {
      // Default to today if no date range is provided
      matchStage.createdAt = {
        $gte: startOfDay(new Date()),
        $lte: endOfDay(new Date()),
      };
    }

    // Add optional filters
    if (paymentMode) matchStage.paymentMode = paymentMode;
    if (collectedBy)
      matchStage.collectedBy = new mongoose.Types.ObjectId(collectedBy);

    // --- 2. Main Aggregation for Daily Breakdown ---
    const dailyBreakdownPipeline = [
      { $match: matchStage },
      // Join with customers to get their locality (area)
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerInfo',
        },
      },
      { $unwind: '$customerInfo' },
      // If an area filter is applied, match it here after the lookup
      ...(area ? [{ $match: { 'customerInfo.locality': area } }] : []),
      // Stage 1 Grouping: Group by Date, Area, and Mode
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            area: '$customerInfo.locality',
            mode: '$paymentMode',
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          total_discount: { $sum: '$discount' },
          total_payments: { $sum: { $subtract: ['$amount', '$discount'] } },
        },
      },
      // Stage 2 Grouping: Roll up by Date and Area
      {
        $group: {
          _id: {
            date: '$_id.date',
            area: '$_id.area',
          },
          mode: {
            $push: {
              mode: '$_id.mode',
              count: '$count',
              amount: '$amount',
              total_discount: '$total_discount',
              total_payments: '$total_payments',
            },
          },
          mode_total_payments: { $sum: '$total_payments' },
          mode_total_count: { $sum: '$count' },
          mode_total_discount: { $sum: '$total_discount' },
        },
      },
      // Stage 3 Grouping: Final roll up by Date
      {
        $group: {
          _id: '$_id.date',
          data: {
            $push: {
              area: '$_id.area',
              mode: '$mode',
              mode_total: {
                total_payments: '$mode_total_payments',
                total_paid: '$mode_total_payments', // Assuming paid is same as payments
                total_discount: '$mode_total_discount',
                total_count: '$mode_total_count',
              },
            },
          },
          total_payments: { $sum: '$mode_total_payments' },
          total_count: { $sum: '$mode_total_count' },
          total_discount: { $sum: '$mode_total_discount' },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date ascending
      {
        $project: {
          // Reshape to final format
          _id: 0,
          date: '$_id',
          data: 1,
          total_payments: 1,
          total_paid: '$total_payments',
          total_discount: 1,
          total_count: 1,
        },
      },
    ];

    // --- 3. Second, simpler Aggregation for Grand Totals ---
    const totalListPipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMode',
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          total_discount: { $sum: '$discount' },
          total_payments: { $sum: { $subtract: ['$amount', '$discount'] } },
        },
      },
      {
        $project: {
          _id: 0,
          mode: '$_id',
          count: 1,
          amount: 1,
          total_discount: 1,
          total_payments: 1,
        },
      },
    ];

    // --- 4. Execute both pipelines concurrently ---
    const [dailyData, totalData] = await Promise.all([
      Transaction.aggregate(dailyBreakdownPipeline),
      Transaction.aggregate(totalListPipeline),
    ]);

    // Calculate the final grand totals from the second pipeline's result
    const grandTotals = totalData.reduce(
      (acc, item) => {
        acc.total_payments += item.total_payments;
        acc.total_discount += item.total_discount;
        acc.total_count += item.count;
        return acc;
      },
      { total_payments: 0, total_discount: 0, total_count: 0 }
    );

    // --- 5. Combine and send the final response ---
    res.status(200).json({
      data: dailyData,
      total_list: {
        data: totalData,
        total_payments: grandTotals.total_payments,
        total_paid: grandTotals.total_payments,
        total_discount: grandTotals.total_discount,
        total_count: grandTotals.total_count,
      },
    });
  } catch (error) {
    console.error('Error generating collection summary:', error);
    res.status(500).json({ message: 'Server error while generating report.' });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const operatorId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();

    // --- Date Ranges ---
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const tomorrowStart = startOfDay(addDays(now, 1));

    // --- Queries ---
    const queries = [
      // Primary metrics
      Transaction.aggregate([
        {
          $match: {
            operatorId,
            type: 'Collection',
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } },
        },
      ]), // 0. Monthly Total Collection

      Transaction.aggregate([
        {
          $match: {
            operatorId,
            type: 'Collection',
            createdAt: { $gte: todayStart, $lte: todayEnd },
          },
        },
        {
          $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } },
        },
      ]), // 1. Today's Collection

      Customer.aggregate([
        { $match: { operatorId, balanceAmount: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$balanceAmount' },
            count: { $sum: 1 },
          },
        },
      ]), // 2. Total Pending Amount

      Transaction.aggregate([
        {
          $match: {
            operatorId,
            type: 'Collection',
            method: 'Online',
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } },
        },
      ]), // 3. Monthly Online Collection

      // Secondary metrics
      Transaction.countDocuments({
        operatorId,
        type: 'Billing',
        createdAt: { $gte: todayStart, $lte: todayEnd },
      }), // 4. Today's Renewals
      Transaction.countDocuments({
        operatorId,
        type: 'Billing',
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }), // 5. Month Renewals
      Customer.countDocuments({
        operatorId,
        active: true,
        expiryDate: { $gte: tomorrowStart },
      }), // 6. Upcoming Renewals
      Customer.countDocuments({
        operatorId,
        active: true,
        expiryDate: { $lt: todayStart },
      }), // 7. Expired Renewals
      Customer.countDocuments({ operatorId }), // 8. Total Customers
      Customer.countDocuments({ operatorId, active: true }), // 9. Active Customers
      Customer.countDocuments({
        operatorId,
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }), // 10. New Customers
      Complaint.countDocuments({ operatorId, status: 'Pending' }), // 11. Pending Complaints
    ];

    const results = await Promise.all(
      queries.map((q) =>
        q.catch((e) => {
          console.error('Dashboard query failed:', e);
          return null;
        })
      )
    );

    // --- Helper Functions ---
    const getAggResult = (idx, field = 'total') =>
      results[idx]?.[0]?.[field] ?? 0;
    const getCountResult = (idx) => results[idx] ?? 0;

    const totalCustomers = getCountResult(8);
    const activeCustomers = getCountResult(9);
    const inactiveCustomers = totalCustomers - activeCustomers;

    // --- Structured Response ---
    const responseData = {
      primaryMetrics: [
        {
          id: 1,
          name: 'Monthly Total Collection',
          stat: getAggResult(0),
          des: getAggResult(0, 'count'),
          stat_type: STAT_TYPE.MONEY,
          action: '/collection', // link when card clicked
        },
        {
          id: 2,
          name: "Today's Collection",
          stat: getAggResult(1),
          des: getAggResult(1, 'count'),
          stat_type: STAT_TYPE.MONEY,
          action: '/collection',
        },
        {
          id: 3,
          name: 'Total Pending Amount',
          stat: getAggResult(2),
          des: getAggResult(2, 'count'),
          stat_type: STAT_TYPE.MONEY,
          action: '/customers?unpaid=true',
        },
        {
          id: 4,
          name: 'Monthly Online Collection',
          stat: getAggResult(3),
          des: getAggResult(3, 'count'),
          stat_type: STAT_TYPE.MONEY,
          action: '/collections',
        },
      ],
      secondaryMetrics: [
        {
          id: 5,
          name: "Today's Renewals",
          stat: getCountResult(4),
          stat_type: STAT_TYPE.COUNT,
          action: '/customers',
        },
        {
          id: 6,
          name: 'This Month Renewals',
          stat: getCountResult(5),
          stat_type: STAT_TYPE.COUNT,
          action: `/web/customer-renew?t=date_search&v=${format(
            monthStart,
            'yyyy-MM-dd'
          )} to ${format(monthEnd, 'yyyy-MM-dd')}`,
        },
        {
          id: 7,
          name: 'Upcoming Renewals',
          stat: getCountResult(6),
          stat_type: STAT_TYPE.COUNT,
          action: '/web/customer-renew?t=date_search&v=upcoming',
        },
        {
          id: 8,
          name: 'Expired Renewals',
          stat: getCountResult(7),
          stat_type: STAT_TYPE.COUNT,
          action: '/customers?customerStatus=inactive',
        },
        {
          id: 9,
          name: 'Total Customers',
          stat: totalCustomers,
          stat_type: STAT_TYPE.COUNT,
          action: '/customers',
        },
        {
          id: 10,
          name: 'Active Customers',
          stat: activeCustomers,
          stat_type: STAT_TYPE.COUNT,
          action: '/customers?customerStatus=active',
        },
        {
          id: 11,
          name: 'Inactive Customers',
          stat: inactiveCustomers,
          stat_type: STAT_TYPE.COUNT,
          action: '/customers?customerStatus=inactive',
        },
        {
          id: 12,
          name: 'New Customers This Month',
          stat: getCountResult(10),
          stat_type: STAT_TYPE.COUNT,
          action: `/web/customers?t=cus_new_date_search&v=${format(
            monthStart,
            'yyyy-MM-dd'
          )} to ${format(monthEnd, 'yyyy-MM-dd')}`,
        },
        {
          id: 13,
          name: 'Pending Complaints',
          stat: getCountResult(11),
          stat_type: STAT_TYPE.COUNT,
          action: '/web/complaints',
        },
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
 * @desc    Get a summary of income, costs, and profit.
 * @route   GET /api/reports/income
 * @access  Private (Operator only)
 */
const getIncomeReport = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const { period } = req.query;

    const matchStage = {
      operatorId: new mongoose.Types.ObjectId(operatorId),
      type: 'Billing',
    };

    // Date Period Filter
    if (period === 'monthly') {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      matchStage.createdAt = { $gte: startOfMonth };
    }
    // Add more periods like 'yearly' if needed

    const report = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null, // Group all documents into one
          totalRevenue: { $sum: '$amount' },
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

    // If no transactions, return zeroed object
    const result = report[0] || {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
    };
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching income report:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Get key performance indicators (KPIs) for the operator's dashboard.
 * @route   GET /api/reports/dashboard-stats
 * @access  Private (Operator only)
 */
const getDashboardStats = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(operatorId);

    // --- Run multiple queries in parallel for efficiency ---
    const [pendingAmountResult, areaWiseResult] = await Promise.all([
      // 1. Calculate Total Pending Amount
      Customer.aggregate([
        { $match: { operatorId: objectId, balanceAmount: { $gt: 0 } } },
        { $group: { _id: null, totalPending: { $sum: '$balanceAmount' } } },
      ]),

      // 2. Get Area-wise Subscription Count
      Customer.aggregate([
        { $match: { operatorId: objectId, active: true } },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'productInfo',
          },
        },
        { $unwind: '$productInfo' },
        {
          $group: {
            _id: { locality: '$locality', planName: '$productInfo.name' },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.locality',
            plans: { $push: { name: '$_id.planName', count: '$count' } },
          },
        },
        { $project: { _id: 0, area: '$_id', plans: 1 } },
        { $sort: { area: 1 } },
      ]),
    ]);

    const stats = {
      totalPendingAmount: pendingAmountResult[0]?.totalPending || 0,
      areaWiseSubscriptions: areaWiseResult || [],
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getCollectionSummary,
  getDashboardSummary,
  getCollectionReport,
  getIncomeReport,
  getDashboardStats,
};
