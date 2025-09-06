const Transaction = require('../models/transaction.model');
const Customer = require('../models/customer.model');
const mongoose = require('mongoose');
const Complaint = require('../models/complaint.model');
const Agent = require('../models/agent.model');
const { startOfMonth, endOfMonth, startOfDay, endOfDay, addDays, format } = require('date-fns');

/**
 * @desc    Get a detailed report of all collections with filters.
 * @route   GET /api/reports/collections
 * @access  Private (Operator only)
 */
const getCollectionReport = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const { period, agentId, method, area } = req.query;

    // --- Aggregation Pipeline ---
    const pipeline = [
      // 1. Initial match for collections by this operator
      {
        $match: {
          operatorId: new mongoose.Types.ObjectId(operatorId),
          type: 'Collection',
        },
      },
      // 2. Join with Customers to get area/locality
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customerInfo',
        },
      },
      // 3. Join with Agents/Operators to get collector's name
      {
        $lookup: {
          from: 'agents', // Assuming agents collection is named 'agents'
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
      // 4. Deconstruct the customerInfo array
      { $unwind: '$customerInfo' },
    ];

    // --- Dynamic Filtering ---
    // Date Period Filter
    const today = new Date();
    if (period === 'today') {
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      pipeline.push({ $match: { createdAt: { $gte: startOfDay } } });
    }
    if (period === 'monthly') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      pipeline.push({ $match: { createdAt: { $gte: startOfMonth } } });
    }

    // Other Filters
    if (agentId)
      pipeline.push({
        $match: { collectedBy: new mongoose.Types.ObjectId(agentId) },
      });
    if (method) pipeline.push({ $match: { method: method } });
    if (area)
      pipeline.push({
        $match: { 'customerInfo.locality': new RegExp(area, 'i') },
      });

    // 5. Project and format the final output
    pipeline.push({
      $project: {
        _id: 0,
        receiptNumber: 1,
        date: '$createdAt',
        customerName: '$customerInfo.name',
        area: '$customerInfo.locality',
        amount: { $abs: '$amount' }, // Show amount as positive
        method: 1,
        collectedBy: {
          $ifNull: [
            { $arrayElemAt: ['$agentInfo.name', 0] },
            { $arrayElemAt: ['$operatorInfo.name', 0] },
          ],
        },
      },
    });

    // 6. Sort the results
    pipeline.push({ $sort: { date: -1 } });

    const collections = await Transaction.aggregate(pipeline);

    res.status(200).json(collections);
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
      type: 'collection',
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

    // --- Define Date Ranges ---
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const tomorrowStart = startOfDay(addDays(now, 1));

    // --- Define All Queries ---
    const queries = [
      // 0. Monthly Total Collection { total, count }
      Transaction.aggregate([
        {
          $match: {
            operatorId,
            type: 'collection',
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } },
        },
      ]),
      // 1. Today's Collection { total, count }
      Transaction.aggregate([
        {
          $match: {
            operatorId,
            type: 'collection',
            createdAt: { $gte: todayStart, $lte: todayEnd },
          },
        },
        {
          $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } },
        },
      ]),
      // 2. Total Pending Amount { total, count }
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
      // 3. Monthly Online Collection { total, count }
      Transaction.aggregate([
        {
          $match: {
            operatorId,
            type: 'collection',
            paymentMode: 'ONLINE',
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
        type: 'billing',
        createdAt: { $gte: todayStart, $lte: todayEnd },
      }),
      // 5. This Month Renewals (count)
      Transaction.countDocuments({
        operatorId,
        type: 'billing',
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }),
      // 6. Upcoming Renewals (count)
      Customer.countDocuments({
        operatorId,
        active: true,
        expiryDate: { $gte: tomorrowStart },
      }),
      // 7. Expired Renewals (count)
      Customer.countDocuments({
        operatorId,
        active: true,
        expiryDate: { $lt: tomorrowStart },
      }),
      // 8. Total Customers (count)
      Customer.countDocuments({ operatorId }),
      // 9. Active Customers (count)
      Customer.countDocuments({ operatorId, active: true }),
      // 10. This Month New Customers (count)
      Customer.countDocuments({
        operatorId,
        createdAt: { $gte: monthStart, $lte: monthEnd },
      }),
      // 11. Pending Complaints (count)
      Complaint.countDocuments({ operatorId, status: 'Pending' }),
    ];

    // --- Execute All Queries in Parallel ---
    const results = await Promise.all(
      queries.map((q) =>
        q.catch((e) => {
          console.error('A dashboard query failed:', e);
          return null; // Return null on failure to prevent crashing Promise.all
        })
      )
    );

    // Helper to safely extract results from aggregations or counts
    const getResult = (index, field) => results[index]?.[0]?.[field] || 0;
    const getCountResult = (index) => results[index] || 0;
    const totalCustomers = getCountResult(8);
    const activeCustomers = getCountResult(9);
    const inactiveCustomers = totalCustomers - activeCustomers;

    // --- Shape the Final Response ---
    const responseData = {
      data: [
        {
          id: 5,
          name: 'Monthly Total Collection',
          stat: getResult(0, 'total'),
          des: getResult(0, 'count'),
          action: '/web/collection',
          stat_type: 0,
          summary_type: 1,
        },
        {
          id: 2,
          name: 'Todays Collection',
          stat: getResult(1, 'total'),
          des: getResult(1, 'count'),
          action: '/web/collection?t=date_search&v=today',
          stat_type: 0,
          summary_type: 0,
        },
        {
          id: 3,
          name: 'Total Pending Amount',
          stat: getResult(2, 'total'),
          des: getResult(2, 'count'),
          action: '/web/customers?t=balance',
          stat_type: 0,
          summary_type: 2,
        },
        {
          id: 1,
          name: 'Monthly Online collection',
          stat: getResult(3, 'total'),
          des: getResult(3, 'count'),
          action: '/web/collection?t=online',
          stat_type: 0,
          summary_type: 1,
        },
        {
          id: 7,
          name: 'Todays Renewals',
          stat: getCountResult(4),
          des: 0,
          action: `/web/customer-renew?t=date_search&v=${format(
            now,
            'yyyy-MM-dd'
          )}`,
          stat_type: 1,
          summary_type: 4,
        },
        {
          id: 8,
          name: 'This Month Renewals',
          stat: getCountResult(5),
          des: 0,
          action: `/web/customer-renew?t=date_search&v=${format(
            monthStart,
            'yyyy-MM-dd'
          )} to ${format(monthEnd, 'yyyy-MM-dd')}`,
          stat_type: 1,
          summary_type: 5,
        },
        {
          id: 8,
          name: 'Upcoming Renewals',
          stat: getCountResult(6),
          des: 0,
          action: '/web/customer-renew?t=date_search&v=upcoming',
          stat_type: 1,
          summary_type: 5,
        },
        {
          id: 9,
          name: 'Expired Renewals',
          stat: getCountResult(7),
          des: 0,
          action: '/web/customer-renew?t=date_search&a=exp_renew',
          stat_type: 1,
          summary_type: 6,
        },
        {
          id: 12,
          name: 'Total Customers',
          stat: totalCustomers,
          des: 0,
          action: '/web/customers',
          stat_type: 1,
          summary_type: 3,
        },
        {
          id: 6,
          name: 'Total Active Customers',
          stat: activeCustomers,
          des: inactiveCustomers,
          action: '/web/customers?t=status&v=1',
          stat_type: 1,
          summary_type: 3,
        },
        {
          id: 11,
          name: 'Total InActive Customers',
          stat: inactiveCustomers,
          des: 0,
          action: '/web/customers?t=status&v=0',
          stat_type: 1,
          summary_type: 3,
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
          stat_type: 1,
          summary_type: 3,
        },
        {
          id: 13,
          name: 'Total Pending Complaints',
          stat: getCountResult(11),
          des: 0,
          action: '/web/complaints',
          stat_type: 0,
          summary_type: 13,
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
  getDashboardSummary
  getCollectionReport,
  getIncomeReport,
  getDashboardStats,
};
