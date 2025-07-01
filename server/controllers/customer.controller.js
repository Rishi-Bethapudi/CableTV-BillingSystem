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
      name,
      mobile,
      planAmount,
      locality,
      stbNumber,
      agentId,
      balanceAmount = 0,
    } = req.body;

    // 1️⃣ Validate required fields
    if (!name || !mobile || !planAmount) {
      return res.status(400).json({
        message: 'Please provide name, mobile, and planAmount.',
      });
    }

    // 2️⃣ Operator ID from the logged-in token
    const operatorId = req.user.id;

    // 3️⃣ Generate Sequence Number & Customer Code
    const lastCustomer = await Customer.findOne({ operatorId }).sort({
      sequenceNo: -1,
    });
    const newSequenceNo = lastCustomer ? lastCustomer.sequenceNo + 1 : 1;
    const customerCode = `CUST-${newSequenceNo}`;

    // 4️⃣ Check duplicate (same mobile OR stbNumber if provided)
    let duplicateQuery = [{ mobile }];
    if (stbNumber) duplicateQuery.push({ stbNumber });

    const existingCustomer = await Customer.findOne({
      operatorId,
      $or: duplicateQuery,
    });

    if (existingCustomer) {
      let field =
        existingCustomer.mobile === mobile ? 'mobile number' : 'STB number';
      return res.status(409).json({
        message: `Customer with this ${field} already exists.`,
      });
    }

    // 5️⃣ Handle expiry date
    const connectionStartDate = new Date();
    const billingInterval = req.body.billingInterval || 30;
    let expiryDate = new Date(connectionStartDate);

    if (balanceAmount >= planAmount) {
      const monthsPaid = Math.floor(balanceAmount / planAmount);
      expiryDate.setDate(expiryDate.getDate() + monthsPaid * billingInterval);
    }

    // 6️⃣ Build and save the customer
    const newCustomer = new Customer({
      ...req.body,
      operatorId,
      agentId: agentId || undefined,
      customerCode,
      sequenceNo: newSequenceNo,
      connectionStartDate,
      expiryDate,
      balanceAmount,
      active: req.body.active !== undefined ? req.body.active : true,
    });

    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
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
    // const operatorId = '6863f992548073a2ed1891f0';

    // --- Pagination ---
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // --- Build dynamic query ---
    const query = { operatorId };

    // Filter by customerStatus (active/inactive)
    if (req.query.customerStatus === 'active') query.active = true;
    else if (req.query.customerStatus === 'inactive') query.active = false;

    // Filter by locality
    if (req.query.locality) {
      query.locality = new RegExp(req.query.locality, 'i');
    }

    // Filter by payment mode (if you store lastPaymentMode or such on customer)
    if (req.query.paymentMode) {
      query.lastPaymentMode = req.query.paymentMode;
    }

    // --- DUE FILTERS based on expiryDate ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (req.query.dueToday === 'true') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      query.expiryDate = { $gte: today, $lt: tomorrow };
    }

    if (req.query.dueTomorrow === 'true') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfter = new Date(today);
      dayAfter.setDate(today.getDate() + 2);
      query.expiryDate = { $gte: tomorrow, $lt: dayAfter };
    }

    if (req.query.dueNext5Days === 'true') {
      const in5Days = new Date(today);
      in5Days.setDate(today.getDate() + 5);
      query.expiryDate = { $gte: today, $lt: in5Days };
    }

    // --- BALANCE FILTERS ---
    if (req.query.unpaid === 'true') {
      query.balanceAmount = { $gt: 0 };
    }
    if (req.query.advance === 'true') {
      query.balanceAmount = { $lt: 0 };
    }

    // --- SEARCH by name/mobile/stb ---
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: regex }, { mobile: regex }, { stbNumber: regex }];
    }

    // --- Sorting ---
    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // --- Execute query ---
    const customers = await Customer.find(query)
      .populate('agentId', 'name') // if needed
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

    const customer = await Customer.findById(customerId)
      .populate('agentId', 'name email')
      .lean();

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // SECURITY CHECK: Ensure the customer belongs to the operator/agent's organization
    if (customer.operatorId.toString() !== req.user.operatorId) {
      // Log this attempt for security monitoring
      console.warn(
        `SECURITY: User ${req.user.id} (Role: ${req.user.role}) attempted to access customer ${customerId} from another tenant.`
      );
      return res.status(404).json({ message: 'Customer not found.' }); // Return 404 to avoid revealing existence
    }

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

    // First, verify the customer exists and belongs to the operator
    const customerToUpdate = await Customer.findById(customerId);

    if (!customerToUpdate) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // SECURITY CHECK: Operator can only update their own customers
    if (customerToUpdate.operatorId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to update this customer.',
      });
    }

    // Prevent operatorId from being changed
    delete req.body.operatorId;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: req.body },
      { new: true, runValidators: true } // 'new: true' returns the updated doc, 'runValidators' ensures schema rules are met
    ).populate('agent', 'name');

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Server error while updating customer.' });
  }
};

/**
 * @desc    Delete a customer
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

    // SECURITY CHECK: Operator can only delete their own customers
    if (customerToDelete.operatorId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to delete this customer.',
      });
    }

    await Customer.findByIdAndDelete(customerId);

    // Optional: Also delete related transactions, etc. (cascade delete)
    // await Transaction.deleteMany({ customerId: customerId });

    res.status(200).json({ message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('Error deleting customer:', error);
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

    // Add the operatorId to each customer record from the authenticated user
    const operatorId = req.user.id;
    const customersToImport = customersJson.map((customer) => ({
      ...customer,
      operatorId: operatorId,
      // Add default values for any missing required fields if necessary
      balanceAmount: customer.balanceAmount || 0,
      active: customer.active !== undefined ? customer.active : true,
    }));

    // Use insertMany for efficient bulk insertion
    const result = await Customer.insertMany(customersToImport, {
      ordered: false,
    }); // ordered: false continues on error

    res
      .status(201)
      .json({ message: `${result.length} customers imported successfully.` });
  } catch (error) {
    console.error('Error importing from Excel:', error);
    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          'Import failed due to duplicate entries (e.g., mobile or STB number). Please check your file.',
      });
    }
    res.status(500).json({ message: 'Failed to import customers from Excel.' });
  } finally {
    // Clean up the uploaded file from the server
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
      .select('-operatorId -__v')
      .lean();

    if (customers.length === 0) {
      return res.status(404).json({ message: 'No customers found to export.' });
    }

    const worksheet = xlsx.utils.json_to_sheet(customers);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Set headers to prompt download
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

    // Write the workbook to the response stream
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
