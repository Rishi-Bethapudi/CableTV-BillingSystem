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

    // --- All Queries ---
    const queries = [
      // 0. Monthly Total Collection
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
      ]),
      // 1. Today's Collection
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
      ]),
      // 2. Total Pending Amount
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
      // 3. Monthly Online Collection
      Transaction.aggregate([
        {
          $match: {
            operatorId,
            type: 'Collection',
            paymentMode: 'Online',
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } },
        },
      ]),
      // 4. Today's Renewals (count)
      Transaction.countDocuments({
        operatorId,
        type: 'Billing',
        createdAt: { $gte: todayStart, $lte: todayEnd },
      }),
      // 5. This Month Renewals (count)
      Transaction.countDocuments({
        operatorId,
        type: 'Billing',
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }),
      // 6. Upcoming Renewals (expiry after today)
      Customer.countDocuments({
        operatorId,
        active: true,
        expiryDate: { $gte: tomorrowStart },
      }),
      // 7. Expired Renewals (expiry before today)
      Customer.countDocuments({
        operatorId,
        active: true,
        expiryDate: { $lt: todayStart },
      }),
      // 8. Total Customers
      Customer.countDocuments({ operatorId }),
      // 9. Active Customers
      Customer.countDocuments({ operatorId, active: true }),
      // 10. This Month New Customers
      Customer.countDocuments({
        operatorId,
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }),
      // 11. Pending Complaints
      Complaint.countDocuments({ operatorId, status: 'Pending' }),
    ];

    // --- Execute Queries ---
    const results = await Promise.all(
      queries.map((q) =>
        q.catch((e) => {
          console.error('Dashboard query failed:', e);
          return null;
        })
      )
    );

    // Helpers
    const getResult = (index, field) => results[index]?.[0]?.[field] ?? 0;
    const getCountResult = (index) => results[index] ?? 0;

    // Customer calculations
    const totalCustomers = getCountResult(8);
    const activeCustomers = getCountResult(9);
    const inactiveCustomers = totalCustomers - activeCustomers;

    // --- Response ---
    const responseData = {
      data: [
        {
          id: 1,
          name: 'Monthly Total Collection',
          stat: getResult(0, 'total'),
          des: getResult(0, 'count'),
          action: '/web/collection',
          stat_type: STAT_TYPE.MONEY,
          summary_type: SUMMARY_TYPE.COLLECTION,
        },
        {
          id: 2,
          name: "Today's Collection",
          stat: getResult(1, 'total'),
          des: getResult(1, 'count'),
          action: '/web/collection?t=date_search&v=today',
          stat_type: STAT_TYPE.MONEY,
          summary_type: SUMMARY_TYPE.TODAY,
        },
        {
          id: 3,
          name: 'Total Pending Amount',
          stat: getResult(2, 'total'),
          des: getResult(2, 'count'),
          action: '/web/customers?t=balance',
          stat_type: STAT_TYPE.MONEY,
          summary_type: SUMMARY_TYPE.PENDING,
        },
        {
          id: 4,
          name: 'Monthly Online Collection',
          stat: getResult(3, 'total'),
          des: getResult(3, 'count'),
          action: '/web/collection?t=online',
          stat_type: STAT_TYPE.MONEY,
          summary_type: SUMMARY_TYPE.COLLECTION,
        },
        {
          id: 5,
          name: "Today's Renewals",
          stat: getCountResult(4),
          des: 0,
          action: `/web/customer-renew?t=date_search&v=${format(
            now,
            'yyyy-MM-dd'
          )}`,
          stat_type: STAT_TYPE.COUNT,
          summary_type: SUMMARY_TYPE.RENEWALS,
        },
        {
          id: 6,
          name: 'This Month Renewals',
          stat: getCountResult(5),
          des: 0,
          action: `/web/customer-renew?t=date_search&v=${format(
            monthStart,
            'yyyy-MM-dd'
          )} to ${format(monthEnd, 'yyyy-MM-dd')}`,
          stat_type: STAT_TYPE.COUNT,
          summary_type: SUMMARY_TYPE.RENEWALS,
        },
        {
          id: 7,
          name: 'Upcoming Renewals',
          stat: getCountResult(6),
          des: 0,
          action: '/web/customer-renew?t=date_search&v=upcoming',
          stat_type: STAT_TYPE.COUNT,
          summary_type: SUMMARY_TYPE.RENEWALS,
        },
        {
          id: 8,
          name: 'Expired Renewals',
          stat: getCountResult(7),
          des: 0,
          action: '/web/customer-renew?t=date_search&a=exp_renew',
          stat_type: STAT_TYPE.COUNT,
          summary_type: SUMMARY_TYPE.EXPIRED,
        },
        {
          id: 9,
          name: 'Total Customers',
          stat: totalCustomers,
          des: 0,
          action: '/web/customers',
          stat_type: STAT_TYPE.COUNT,
          summary_type: SUMMARY_TYPE.CUSTOMERS,
        },
        {
          id: 10,
          name: 'Active Customers',
          stat: activeCustomers,
          des: inactiveCustomers,
          action: '/web/customers?t=status&v=1',
          stat_type: STAT_TYPE.COUNT,
          summary_type: SUMMARY_TYPE.CUSTOMERS,
        },
        {
          id: 11,
          name: 'Inactive Customers',
          stat: inactiveCustomers,
          des: 0,
          action: '/web/customers?t=status&v=0',
          stat_type: STAT_TYPE.COUNT,
          summary_type: SUMMARY_TYPE.CUSTOMERS,
        },
        {
          id: 12,
          name: 'This Month New Customers',
          stat: getCountResult(10),
          des: 0,
          action: `/web/customers?t=cus_new_date_search&v=${format(
            monthStart,
            'yyyy-MM-dd'
          )} to ${format(monthEnd, 'yyyy-MM-dd')}`,
          stat_type: STAT_TYPE.COUNT,
          summary_type: SUMMARY_TYPE.CUSTOMERS,
        },
        {
          id: 13,
          name: 'Pending Complaints',
          stat: getCountResult(11),
          des: 0,
          action: '/web/complaints',
          stat_type: STAT_TYPE.COUNT,
          summary_type: SUMMARY_TYPE.COMPLAINTS,
        },
      ],
      banner_image: [
        {
          url: 'https://bixapp.in/assets/img/refer-and-earn.jpeg',
          action: 'https://bix42.com/refer-earn',
        },
        {
          url: 'https://bixapp.in/assets/img/facebook_like.jpeg',
          action: 'http://www.facebook.com/bix42',
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
