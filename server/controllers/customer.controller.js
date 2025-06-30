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
    const { name, locality, mobile, planAmount, stbNumber } = req.body;

    // Basic validation
    if (!name || !locality || !mobile || !planAmount) {
      return res
        .status(400)
        .json({
          message:
            'Please provide all required fields: name, locality, mobile, planAmount',
        });
    }

    // The operator's ID is taken from the authenticated user's token.
    // req.user.id is the operator's _id.
    const operatorId = req.user.id;

    // Optional: Check if a customer with the same mobile or STB number already exists for this operator
    const existingCustomer = await Customer.findOne({
      operatorId,
      $or: [{ mobile }, { stbNumber }],
    });

    if (existingCustomer) {
      let field =
        existingCustomer.mobile === mobile ? 'mobile number' : 'STB number';
      return res
        .status(409)
        .json({ message: `A customer with this ${field} already exists.` });
    }

    const newCustomer = new Customer({
      ...req.body,
      operatorId: operatorId, // Ensure the customer is linked to the correct operator (tenant)
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
    // The operatorId is taken from the token. This is the core of our multi-tenancy.
    // For an agent, req.user.operatorId is set during login. For an operator, it's their own ID.
    const operatorId = req.user.operatorId;

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build the query object
    const query = { operatorId };

    // Filtering by search term (name, mobile, stbNumber, etc.)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // case-insensitive search
      query.$or = [
        { name: searchRegex },
        { mobile: searchRegex },
        { stbNumber: searchRegex },
        { locality: searchRegex },
      ];
    }

    // Filtering by status
    if (req.query.status && ['active', 'inactive'].includes(req.query.status)) {
      query.active = req.query.status === 'active';
    }

    // Filtering by agent
    if (req.query.agentId) {
      query.agent = req.query.agentId;
    }

    // Execute query to get customers and total count for pagination
    const customers = await Customer.find(query)
      .populate('agent', 'name') // Populate agent's name for better frontend display
      .sort({ createdAt: -1 }) // Sort by most recently created
      .skip(skip)
      .limit(limit)
      .lean(); // Use .lean() for faster, read-only operations

    const totalCustomers = await Customer.countDocuments(query);

    res.status(200).json({
      data: customers,
      pagination: {
        total: totalCustomers,
        page,
        limit,
        totalPages: Math.ceil(totalCustomers / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error while fetching customers.' });
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
      .populate('agent', 'name email')
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
      return res
        .status(403)
        .json({
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
      return res
        .status(403)
        .json({
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
      return res
        .status(400)
        .json({
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
      return res
        .status(409)
        .json({
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
