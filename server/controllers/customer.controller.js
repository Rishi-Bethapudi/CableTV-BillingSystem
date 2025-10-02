const Customer = require('../models/customer.model'); // Assuming your model is here
const Operator = require('../models/operator.model'); // For tenancy checks
const mongoose = require('mongoose');
const xlsx = require('xlsx'); // For Excel import/export
const fs = require('fs'); // To clean up uploaded files

/**
 * @desc    Create a new customer
 * @route   POST /api/customers
 * @access  Private (Operator only)
 */
const createCustomer = async (req, res) => {
  try {
    const {
      customerCode,
      name,
      mobile,
      locality,
      stbNumber,
      stbName,
      cardNumber,
      agentId,
      billingAddress,
      balanceAmount = 0,
      additionalCharge = 0,
      discount = 0,
      lastPaymentAmount = 0,
      lastPaymentDate = null,
      productIds = [],
      remark = '',
    } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ message: 'Please provide name, mobile.' });
    }

    const operatorId = req.user.id;

    // Generate sequence number
    const lastCustomer = await Customer.findOne({ operatorId }).sort({
      createdAt: -1,
    });
    const newSequenceNo = lastCustomer ? lastCustomer.sequenceNo + 1 : 1;

    // Duplicate check
    let duplicateQuery = [{ mobile }];
    if (stbNumber) duplicateQuery.push({ stbNumber });
    const existingCustomer = await Customer.findOne({
      operatorId,
      $or: duplicateQuery,
    });
    if (existingCustomer) {
      let field =
        existingCustomer.mobile === mobile ? 'mobile number' : 'STB number';
      return res
        .status(409)
        .json({ message: `Customer with this ${field} already exists.` });
    }

    // Subscriptions build
    const subscriptions = [];
    for (let pid of productIds) {
      const product = await Product.findById(pid);
      if (!product) continue;

      const startDate = new Date();
      let expiryDate;

      if (product.billingInterval.unit === 'months') {
        expiryDate = new Date(startDate);
        expiryDate.setMonth(
          startDate.getMonth() + product.billingInterval.value
        );
      } else {
        expiryDate = new Date(
          startDate.getTime() +
            product.billingInterval.value * 24 * 60 * 60 * 1000
        );
      }

      subscriptions.push({
        productId: product._id,
        startDate,
        expiryDate,
        billingInterval: product.billingInterval,
        price: product.customerPrice,
        status: 'active',
      });
    }

    const newCustomer = new Customer({
      operatorId,
      agentId: agentId || null,
      customerCode,
      sequenceNo: newSequenceNo,
      name,
      mobile,
      locality,
      stbName,
      stbNumber,
      cardNumber,
      billingAddress,
      balanceAmount,
      additionalCharge,
      discount,
      lastPaymentAmount,
      lastPaymentDate,
      subscriptions,
      active: true,
      remark,
    });

    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Server error while creating customer.' });
  }
};

/**
 * @desc    Get all customers for an operator (with filtering and pagination)
 * @route   GET /api/customers
 * @access  Private (Operator or Agent)
 */
const getCustomers = async (req, res) => {
  try {
    const operatorId = req.user.operatorId;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { operatorId };

    // Deleted filter handling
    if (req.query.includeDeleted === 'true') {
      query.deleted = true; // ✅ only deleted customers
    } else {
      query.deleted = false; // ✅ exclude deleted customers
    }

    // Active / inactive filter
    if (req.query.customerStatus === 'active') query.active = true;
    else if (req.query.customerStatus === 'inactive') query.active = false;

    if (req.query.locality) {
      query.locality = new RegExp(req.query.locality, 'i');
    }

    // Expiry filters (applied only when not querying deleted customers)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (req.query.includeDeleted !== 'true') {
      if (req.query.dueToday === 'true') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        query.subscriptions = {
          $elemMatch: { expiryDate: { $gte: today, $lt: tomorrow } },
        };
      }

      if (req.query.dueTomorrow === 'true') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(today.getDate() + 2);
        query.subscriptions = {
          $elemMatch: { expiryDate: { $gte: tomorrow, $lt: dayAfter } },
        };
      }

      if (req.query.dueNext5Days === 'true') {
        const in5Days = new Date(today);
        in5Days.setDate(today.getDate() + 5);
        query.subscriptions = {
          $elemMatch: { expiryDate: { $gte: today, $lt: in5Days } },
        };
      }
    }

    // Balance filters
    if (req.query.balance === 'zero') query.balanceAmount = 0;
    if (req.query.balance === 'due') query.balanceAmount = { $gt: 0 };
    if (req.query.balance === 'advance') query.balanceAmount = { $lt: 0 };

    // Search
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: regex }, { mobile: regex }, { stbNumber: regex }];
    }

    // Sorting
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Query execution
    const customers = await Customer.find(query)
      .populate('agentId', 'name')
      .populate('subscriptions.productId', 'name customerPrice')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Customer.countDocuments(query);

    // Compute earliest expiry only for non-deleted
    if (req.query.includeDeleted !== 'true') {
      customers.forEach((c) => {
        if (c.subscriptions && c.subscriptions.length > 0) {
          c.earliestExpiry = c.subscriptions.reduce((earliest, sub) => {
            if (!earliest) return sub.expiryDate;
            return new Date(sub.expiryDate) < new Date(earliest)
              ? sub.expiryDate
              : earliest;
          }, null);
        } else {
          c.earliestExpiry = null;
        }
      });
    }

    res.status(200).json({
      data: customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching customers with filters:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * @desc    Get a single customer by ID
 * @route   GET /api/customers/:id
 * @access  Private (Operator or Agent)
 */
const getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID format.' });
    }

    const query = {
      _id: customerId,
      operatorId: req.user.operatorId,
      deleted: false, // 👈 exclude deleted customers
    };

    // Allow admins to view deleted customer if explicitly requested
    if (req.query.includeDeleted === 'true') {
      delete query.deleted;
    }

    const customer = await Customer.findOne(query)
      .populate('agentId', 'name email')
      .populate('subscriptions.productId', 'name customerPrice billingInterval')
      .lean();

    if (!customer)
      return res.status(404).json({ message: 'Customer not found.' });

    res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    res.status(500).json({ message: 'Server error while fetching customer.' });
  }
};

/**
 * @desc    Update a customer
 * @route   PUT /api/customers/:id
 * @access  Private (Operator only)
 */
const updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID format.' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer)
      return res.status(404).json({ message: 'Customer not found.' });
    if (customer.operatorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    // Don't allow operatorId/subscriptions overwrite here
    delete req.body.operatorId;
    delete req.body.subscriptions;

    const updatableFields = [
      'name',
      'mobile',
      'locality',
      'stbName',
      'stbNumber',
      'cardNumber',
      'billingAddress',
      'balanceAmount',
      'additionalCharge',
      'discount',
      'lastPaymentAmount',
      'lastPaymentDate',
      'remark',
      'active',
    ];

    const updates = {};
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('agentId', 'name');

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Server error while updating customer.' });
  }
};

/**
 * @desc    Soft delete a customer (mark as deleted, don't remove from DB)
 * @route   DELETE /api/customers/:id
 * @access  Private (Operator only)
 */
const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID format.' });
    }

    const customerToDelete = await Customer.findById(customerId);

    if (!customerToDelete) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    if (customerToDelete.operatorId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to delete this customer.',
      });
    }

    // ✅ Soft delete instead of removing
    customerToDelete.deleted = true;
    customerToDelete.active = false;
    await customerToDelete.save();

    res.status(200).json({ message: 'Customer soft deleted successfully.' });
  } catch (error) {
    console.error('Error soft deleting customer:', error);
    res.status(500).json({ message: 'Server error while deleting customer.' });
  }
};

/**
 * @desc    Import customers from an Excel file
 * @route   POST /api/customers/import
 * @access  Private (Operator only)
 */
const importCustomersFromExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const filePath = req.file.path;

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const customersJson = xlsx.utils.sheet_to_json(worksheet);

    if (customersJson.length === 0) {
      return res.status(400).json({
        message: 'The Excel file is empty or in an incorrect format.',
      });
    }

    const operatorId = req.user.id;

    const customersToImport = customersJson.map((c) => ({
      operatorId,
      agentId: c.agentId || null,
      customerCode: c.customerCode || '', // or generate later
      name: c.name,
      mobile: c.mobile,
      locality: c.locality || '',
      stbName: c.stbName || '',
      stbNumber: c.stbNumber || '',
      cardNumber: c.cardNumber || '',
      billingAddress: c.billingAddress || '',
      connectionStartDate: c.connectionStartDate
        ? new Date(c.connectionStartDate)
        : null,
      sequenceNo: c.sequenceNo || null,
      subscriptions: [], // default empty (can be added later via product assign/renewal)
      balanceAmount: c.balanceAmount || 0,
      additionalCharge: c.additionalCharge || 0,
      discount: c.discount || 0,
      lastPaymentAmount: c.lastPaymentAmount || 0,
      lastPaymentDate: c.lastPaymentDate ? new Date(c.lastPaymentDate) : null,
      remark: c.remark || '',
      active: c.active !== undefined ? c.active : true,
    }));

    const result = await Customer.insertMany(customersToImport, {
      ordered: false,
    });

    res.status(201).json({
      message: `${result.length} customers imported successfully.`,
    });
  } catch (error) {
    console.error('Error importing from Excel:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          'Import failed due to duplicate entries (e.g., mobile or STB number). Please check your file.',
      });
    }
    res.status(500).json({ message: 'Failed to import customers from Excel.' });
  } finally {
    fs.unlinkSync(filePath);
  }
};

/**
 * @desc    Export customers to an Excel file
 * @route   GET /api/customers/export
 * @access  Private (Operator only)
 */
const exportCustomersToExcel = async (req, res) => {
  try {
    const operatorId = req.user.id;
    const customers = await Customer.find({ operatorId })
      .populate('subscriptions.productId', 'name')
      .lean();

    if (customers.length === 0) {
      return res.status(404).json({ message: 'No customers found to export.' });
    }

    // Flatten subscriptions into strings for Excel
    const exportData = customers.map((c) => {
      let subs = c.subscriptions
        .map(
          (s) =>
            `${s.productId?.name || 'N/A'} (exp: ${new Date(
              s.expiryDate
            ).toLocaleDateString()})`
        )
        .join(', ');

      return {
        CustomerCode: c.customerCode,
        Name: c.name,
        Mobile: c.mobile,
        Locality: c.locality || '',
        BillingAddress: c.billingAddress || '',
        STBNumber: c.stbNumber || '',
        CardNumber: c.cardNumber || '',
        Balance: c.balanceAmount,
        AdditionalCharge: c.additionalCharge,
        Discount: c.discount,
        LastPaymentAmount: c.lastPaymentAmount || 0,
        LastPaymentDate: c.lastPaymentDate
          ? new Date(c.lastPaymentDate).toLocaleDateString()
          : '',
        Subscriptions: subs || 'None',
        Active: c.active ? 'Yes' : 'No',
        Remark: c.remark || '',
      };
    });

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Customers');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="customers_${operatorId}_${
        new Date().toISOString().split('T')[0]
      }.xlsx"`
    );

    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ message: 'Failed to export customers.' });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  importCustomersFromExcel,
  exportCustomersToExcel,
};
