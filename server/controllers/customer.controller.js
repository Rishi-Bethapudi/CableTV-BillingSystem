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

const asString = (val) => (val ? String(val).trim() : '');
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
        { session },
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

    // Base customer
    const customer = await Customer.findOne({
      _id: customerId,
      operatorId: req.user.operatorId,
      deleted: false,
    })
      .populate('agentId', 'name email')
      .lean();

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    /* ------------------------------------------------------------
       FETCH ALL SUBSCRIPTIONS (ACTIVE + EXPIRED)
    ------------------------------------------------------------ */
    const subs = await Subscription.find({
      customerId,
      operatorId: req.user.operatorId,
      status: { $in: ['ACTIVE', 'EXPIRED'] },
    })
      .populate('productId', 'name customerPrice operatorCost planType')
      .sort({ expiryDate: -1 }) // newest first
      .lean();

    const activeSubs = subs.filter((s) => s.status === 'ACTIVE');
    const expiredSubs = subs.filter((s) => s.status === 'EXPIRED');

    /* ------------------------------------------------------------
       🔥 AUTO-CLEAN CUSTOMER.activeSubscriptions FIELD
       Remove old subscription IDs, keep only currently active ones
    ------------------------------------------------------------ */
    const activeSubIds = activeSubs.map((s) => s._id.toString());

    if (
      JSON.stringify(activeSubIds) !==
      JSON.stringify(
        (customer.activeSubscriptions || []).map((id) => id.toString()),
      )
    ) {
      await Customer.updateOne(
        { _id: customerId },
        { $set: { activeSubscriptions: activeSubIds } },
      );
      customer.activeSubscriptions = activeSubIds; // reflect back in response
    }

    /* ------------------------------------------------------------
       🔥 Update planNamesSummary = unique active plan names
    ------------------------------------------------------------ */
    const planNamesSummary = activeSubs.map((s) => s.productId?.name);
    if (
      JSON.stringify(planNamesSummary) !==
      JSON.stringify(customer.planNamesSummary || [])
    ) {
      await Customer.updateOne(
        { _id: customerId },
        { $set: { planNamesSummary } },
      );
      customer.planNamesSummary = planNamesSummary;
    }

    /* ------------------------------------------------------------
       🔥 Calculate earliest active expiry (Base packs only)
    ------------------------------------------------------------ */
    const baseExpiries = activeSubs
      .filter((s) => s.planType === 'BASE')
      .map((s) => s.expiryDate)
      .sort();

    const earliestExpiry = baseExpiries.length ? baseExpiries[0] : null;

    if (earliestExpiry?.toString() !== customer.earliestExpiry?.toString()) {
      await Customer.updateOne(
        { _id: customerId },
        { $set: { earliestExpiry } },
      );
      customer.earliestExpiry = earliestExpiry;
    }

    /* ------------------------------------------------------------
       FINAL RESPONSE FORMAT (FLATTENED & FRONTEND OPTIMIZED)
    ------------------------------------------------------------ */
    return res.json({
      ...customer,
      currentSubscriptions: activeSubs,
      expiredSubscriptions: expiredSubs,
      subscriptionsCount: {
        active: activeSubs.length,
        expired: expiredSubs.length,
      },
    });
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    return res.status(500).json({
      message: 'Server error while fetching customer.',
    });
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

    // Fields that cannot be modified
    const blocked = [
      'operatorId',
      'balanceAmount',
      'activeSubscriptions',
      'earliestExpiry',
      'deleted',
    ];
    blocked.forEach((f) => delete req.body[f]);

    /** 🔄 LEGACY → NEW field mappings */
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

    /** 🔹 DEVICE HANDLING */
    if (req.body.devices) {
      const newDevice = req.body.devices[0];

      // Duplicate check only if updated
      if (newDevice?.stbNumber || newDevice?.cardNumber) {
        const duplicate = await Customer.findOne({
          _id: { $ne: customerId },
          operatorId: req.user.operatorId,
          deleted: false,
          $or: [
            newDevice?.stbNumber
              ? { 'devices.stbNumber': newDevice.stbNumber }
              : null,
            newDevice?.cardNumber
              ? { 'devices.cardNumber': newDevice.cardNumber }
              : null,
          ].filter(Boolean),
        });

        if (duplicate) {
          return res.status(409).json({
            message: 'Another customer already uses this STB or Card Number.',
          });
        }
      }

      // Apply to first device
      if (!customer.devices?.length) {
        customer.devices = [newDevice];
      } else {
        customer.devices[0] = { ...customer.devices[0]._doc, ...newDevice };
      }

      req.body.devices = customer.devices;
    }

    /** 🔹 Allowed fields to update */
    const allowed = [
      'name',
      'contactNumber',
      'locality',
      'billingAddress',
      'defaultExtraCharge',
      'defaultDiscount',
      'gstNumber',
      'alternateContact',
      'messageNumber',
      'remark',
      'active',
      'devices',
    ];

    const updates = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: updates },
      { new: true, runValidators: true },
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
      return res.status(403).json({
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
      { $set: { status: 'TERMINATED' } },
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
    // Use raw: false to ensure dates are parsed correctly if formatted in Excel
    const rows = xlsx.utils.sheet_to_json(worksheet);

    if (!rows.length) {
      return res.status(400).json({ message: 'Excel file is empty.' });
    }

    const operatorId = req.user.id;

    // Fetch sequence once
    const lastCustomer = await Customer.findOne({ operatorId }).sort({
      sequenceNo: -1,
    });
    let nextSeq = lastCustomer ? lastCustomer.sequenceNo + 1 : 1;

    for (const row of rows) {
      // 1. Extract and Validate Basic Info (Using your Template Headers)
      const name = asString(row.Name);
      const mobile = asString(row.Contact_Number);

      if (!name || !mobile) continue;

      const customerCode =
        asString(row.Customer_Code) ||
        `CUS-${String(nextSeq).padStart(5, '0')}`;

      // 2. Map Financials & Metadata
      const customerData = {
        operatorId,
        name,
        contactNumber: mobile,
        alternateContact: asString(row.Alt_Contact),
        locality: asString(row.Locality),
        billingAddress: asString(row.Address),
        customerCode,
        sequenceNo: nextSeq,
        balanceAmount: Number(row.Opening_Balance) || 0,
        lastBillAmount: Number(row.Last_Bill_Amt) || 0,
        lastBillDate: row.Last_Bill_Date ? new Date(row.Last_Bill_Date) : null,
        lastPaymentAmount: Number(row.Last_Pay_Amt) || 0,
        lastPaymentDate: row.Last_Pay_Date ? new Date(row.Last_Pay_Date) : null,
        securityDeposit: Number(row.Security_Deposit) || 0,
        defaultExtraCharge: Number(row.Extra_Charge) || 0,
        gstNumber: asString(row.GST_No),
        billFrequency: Number(row.Bill_Frequency) || 30,
        remark: asString(row.Remark),
        devices: [],
      };

      // 3. Map Devices
      if (row.STB_Number || row.Card_Number) {
        customerData.devices.push({
          stbNumber: asString(row.STB_Number),
          cardNumber: asString(row.Card_Number),
          deviceModel: asString(row.STB_Model),
          membershipNumber: asString(row.Membership_No),
          active: true,
        });
      }

      // 4. Save Customer First (Needed to get _id for Subscriptions)
      const savedCustomer = await Customer.create(customerData);

      // 5. Handle Subscriptions (Linking to Subscription Model)
      if (row.Product_Name) {
        // Find product by name (assuming Product_Name is what you store)
        const product = await Product.findOne({
          operatorId,
          name: asString(row.Product_Name),
        });

        if (product) {
          const startDate = new Date();
          let expiryDate = new Date(startDate);

          if (product.billingInterval.unit === 'months') {
            expiryDate.setMonth(
              startDate.getMonth() + product.billingInterval.value,
            );
          } else {
            expiryDate.setDate(
              startDate.getDate() + product.billingInterval.value,
            );
          }

          const newSub = await Subscription.create({
            customerId: savedCustomer._id,
            operatorId,
            productId: product._id,
            planType: product.planType || 'BASE',
            startDate,
            expiryDate,
            billingInterval: product.billingInterval,
            customerPrice: product.customerPrice,
            operatorCost: product.operatorCost,
            status: 'ACTIVE',
          });

          // Update customer with the reference
          await Customer.findByIdAndUpdate(savedCustomer._id, {
            $push: { activeSubscriptions: newSub._id },
            $set: {
              earliestExpiry: expiryDate,
              planNamesSummary: [product.name],
            },
          });
        }
      }

      nextSeq++;
    }

    res.status(201).json({ message: 'Import completed successfully.' });
  } catch (error) {
    console.error('Import Error:', error);
    res
      .status(500)
      .json({ message: error.message || 'Failed to import customers.' });
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
              s.expiryDate,
            ).toLocaleDateString()})`,
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
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="customers_${operatorId}_${
        new Date().toISOString().split('T')[0]
      }.xlsx"`,
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
