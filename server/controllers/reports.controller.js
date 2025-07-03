const Transaction = require('../models/transaction.model');
const Customer = require('../models/customer.model');
const mongoose = require('mongoose');

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
  getCollectionReport,
  getIncomeReport,
  getDashboardStats,
};
