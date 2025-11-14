const Customer = require('../models/customer.model');
const Operator = require('../models/operator.model');
const Subscription = require('../models/subscription.model');
const Transaction = require('../models/transaction.model');

const mongoose = require('mongoose');
const xlsx = require('xlsx'); // For Excel import/export
const fs = require('fs'); // To clean up uploaded files

const generateCustomerCode = (operatorId, sequenceNo) => {
  return `C${String(sequenceNo).padStart(5, '0')}`;
};

/**
 * @desc    Create a new customer
 * @route   POST /api/customers
 * @access  Private (Operator only)
 */
const createCustomer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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
      additionalCharge = 0, // legacy name, maps to defaultExtraCharge
      discount = 0, // legacy name, maps to defaultDiscount
      remark = '',
      connectionStartDate,
    } = req.body;

    if (!name || !mobile) {
      return res
        .status(400)
        .json({ message: 'Please provide name and mobile.' });
    }

    // Only operator should be allowed here
    if (req.user.role !== 'operator') {
      return res
        .status(403)
        .json({ message: 'Only operator can create customers.' });
    }

    const operatorId = req.user.id;

    // Generate sequence number per operator
    const lastCustomer = await Customer.findOne({ operatorId })
      .sort({ sequenceNo: -1 })
      .select('sequenceNo')
      .session(session);

    const newSequenceNo = lastCustomer ? lastCustomer.sequenceNo + 1 : 1;

    // Duplicate check: mobile / STB / card
    const duplicateOr = [
      { contactNumber: mobile },
      { contactNumber: String(mobile) },
    ];
    if (stbNumber) duplicateOr.push({ 'devices.stbNumber': stbNumber });
    if (cardNumber) duplicateOr.push({ 'devices.cardNumber': cardNumber });

    const existingCustomer = await Customer.findOne({
      operatorId,
      $or: duplicateOr,
      deleted: false,
    }).session(session);

    if (existingCustomer) {
      let field = 'contact';
      if (existingCustomer.contactNumber === mobile) field = 'mobile number';
      // we can’t easily know STB vs card without extra checks, but mobile is common case
      return res
        .status(409)
        .json({ message: `Customer with this ${field} already exists.` });
    }

    // Build devices array (single primary device for now)
    const devices = [];
    if (stbNumber || cardNumber) {
      devices.push({
        stbNumber: stbNumber || undefined,
        cardNumber: cardNumber || undefined,
        deviceModel: stbName || undefined,
        active: true,
      });
    }

    const initialBalance = Number(balanceAmount) || 0;

    const customer = new Customer({
      operatorId,
      agentId: agentId || null,
      customerCode:
        customerCode || generateCustomerCode(operatorId, newSequenceNo),
      sequenceNo: newSequenceNo,
      name,
      contactNumber: mobile,
      locality,
      billingAddress,
      devices,
      balanceAmount: initialBalance, // will be backed by transaction below if non-zero
      defaultExtraCharge: Number(additionalCharge) || 0,
      defaultDiscount: Number(discount) || 0,
      remark,
      connectionStartDate: connectionStartDate
        ? new Date(connectionStartDate)
        : new Date(),
      active: true,
      deleted: false,
      activeSubscriptions: [],
      earliestExpiry: null,
    });

    await customer.save({ session });

    // If initial balance is non-zero, create an "opening balance" transaction
    if (initialBalance !== 0) {
      await Transaction.create(
        [
          {
            customerId: customer._id,
            operatorId,
            collectedBy: req.user.id,
            collectedByType: 'Operator',
            type: 'ADJUSTMENT',
            amount: initialBalance, // positive => customer owes this much
            balanceBefore: 0,
            balanceAfter: initialBalance,
            isOpeningBalance: true,
            note: 'Opening balance on customer creation',
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(customer);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
      query.deleted = true; // only deleted
    } else {
      query.deleted = false; // normal view excludes deleted
    }

    // Active / inactive filter
    if (req.query.customerStatus === 'active') query.active = true;
    else if (req.query.customerStatus === 'inactive') query.active = false;

    // Locality filter
    if (req.query.locality) {
      query.locality = new RegExp(req.query.locality, 'i');
    }

    // Renewal / expiry filters using earliestExpiry
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (req.query.includeDeleted !== 'true') {
      if (req.query.dueToday === 'true') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        query.earliestExpiry = { $gte: today, $lt: tomorrow };
      }

      if (req.query.dueTomorrow === 'true') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(today.getDate() + 2);
        query.earliestExpiry = { $gte: tomorrow, $lt: dayAfter };
      }

      if (req.query.dueNext5Days === 'true') {
        const in5Days = new Date(today);
        in5Days.setDate(today.getDate() + 5);
        query.earliestExpiry = { $gte: today, $lt: in5Days };
      }
    }

    // Balance filters
    if (req.query.balance === 'zero') query.balanceAmount = 0;
    if (req.query.balance === 'due') query.balanceAmount = { $gt: 0 };
    if (req.query.balance === 'advance') query.balanceAmount = { $lt: 0 };

    // Search - by name, contact, code, STB, card
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: regex },
        { contactNumber: regex },
        { customerCode: regex },
        { 'devices.stbNumber': regex },
        { 'devices.cardNumber': regex },
      ];
    }

    // Sorting
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const customers = await Customer.find(query)
      .populate('agentId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Customer.countDocuments(query);

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
 * @desc    Get a single customer by ID (with optional subscription list)
 * @route   GET /api/customers/:id
 * @access  Private (Operator or Agent)
 */
const getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID format.' });
    }

    const baseQuery = {
      _id: customerId,
      operatorId: req.user.operatorId,
      deleted: false,
    };

    if (req.query.includeDeleted === 'true') {
      delete baseQuery.deleted;
    }

    const customer = await Customer.findOne(baseQuery)
      .populate('agentId', 'name email')
      .lean();

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // Optionally include subscription history
    const includeSubscriptions = req.query.includeSubscriptions === 'true';

    let subscriptions = [];
    if (includeSubscriptions) {
      subscriptions = await Subscription.find({
        customerId,
        operatorId: req.user.operatorId,
      })
        .populate('productId', 'name planType customerPrice')
        .sort({ startDate: -1 })
        .lean();
    }

    res.status(200).json({
      customer,
      subscriptions,
    });
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    res.status(500).json({ message: 'Server error while fetching customer.' });
  }
};

/**
 * @desc    Update a customer (profile-level fields only)
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

    if (customer.operatorId.toString() !== req.user.operatorId) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    if (req.user.role !== 'operator') {
      return res
        .status(403)
        .json({ message: 'Only operator can update customer.' });
    }

    // Protect non-editable fields
    const blockedFields = [
      'operatorId',
      'balanceAmount',
      'activeSubscriptions',
      'earliestExpiry',
      'deleted',
    ];
    blockedFields.forEach((f) => delete req.body[f]);

    // Map legacy field names
    if (req.body.mobile !== undefined) {
      req.body.contactNumber = req.body.mobile;
      delete req.body.mobile;
    }
    if (req.body.additionalCharge !== undefined) {
      req.body.defaultExtraCharge = req.body.additionalCharge;
      delete req.body.additionalCharge;
    }
    if (req.body.discount !== undefined) {
      req.body.defaultDiscount = req.body.discount;
      delete req.body.discount;
    }

    // Simple device handling: if stb/card number sent, update first device
    const deviceUpdates = {};
    if (req.body.stbNumber !== undefined)
      deviceUpdates.stbNumber = req.body.stbNumber;
    if (req.body.cardNumber !== undefined)
      deviceUpdates.cardNumber = req.body.cardNumber;
    if (req.body.stbName !== undefined)
      deviceUpdates.deviceModel = req.body.stbName;

    // Check STB/card duplicates if changed
    if (deviceUpdates.stbNumber || deviceUpdates.cardNumber) {
      const duplicateDevice = await Customer.findOne({
        _id: { $ne: customerId },
        operatorId: req.user.operatorId,
        deleted: false,
        $or: [
          deviceUpdates.stbNumber
            ? { 'devices.stbNumber': deviceUpdates.stbNumber }
            : null,
          deviceUpdates.cardNumber
            ? { 'devices.cardNumber': deviceUpdates.cardNumber }
            : null,
        ].filter(Boolean),
      });

      if (duplicateDevice) {
        return res.status(409).json({
          message: 'Another customer already uses this STB/card number.',
        });
      }
    }

    const updatableFields = [
      'name',
      'contactNumber',
      'locality',
      'billingAddress',
      'defaultExtraCharge',
      'defaultDiscount',
      'lastPaymentAmount',
      'lastPaymentDate',
      'remark',
      'active',
      'messageNumber',
      'alternateContact',
      'gstNumber',
      'agentId',
    ];

    const updates = {};

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Apply device changes to first device
    if (Object.keys(deviceUpdates).length > 0) {
      if (!customer.devices || customer.devices.length === 0) {
        customer.devices = [{ ...deviceUpdates, active: true }];
      } else {
        customer.devices[0] = { ...customer.devices[0]._doc, ...deviceUpdates };
      }
      updates.devices = customer.devices;
    }

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

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    if (customer.operatorId.toString() !== req.user.operatorId) {
      return res
        .status(403)
        .json({
          message: 'Forbidden: You are not authorized to delete this customer.',
        });
    }

    if (req.user.role !== 'operator') {
      return res
        .status(403)
        .json({ message: 'Only operator can delete a customer.' });
    }

    // Professional safety: don’t delete customers with outstanding balance
    if (customer.balanceAmount !== 0) {
      return res.status(400).json({
        message:
          'Customer has non-zero balance. Please settle or adjust via transactions before deleting.',
      });
    }

    // Terminate active subscriptions
    await Subscription.updateMany(
      { customerId, operatorId: req.user.operatorId, status: 'ACTIVE' },
      { $set: { status: 'TERMINATED' } }
    );

    customer.deleted = true;
    customer.active = false;
    customer.activeSubscriptions = [];
    customer.earliestExpiry = null;

    await customer.save();

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
