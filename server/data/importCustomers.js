const xlsx = require('xlsx');
const Customer = require('../models/Customer');

const importCustomers = async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const customers = data.map((row) => ({
      operatorId: req.body.operatorId, // passed in request
      agentId: req.body.agentId, // optional
      customerCode: row['Customer Code'],
      name: row['Name'],
      locality: row['Locality'],
      mobile: row['Mobile'],
      billingAddress: row['Billing Address'],
      balanceAmount: parseFloat(row['Balance Amount'] || 0),
      connectionStartDate: new Date(row['Connection Start Date']),
      expiryDate: new Date(row['Expiry Date']),
      billingInterval: row['Billing Interval'],
      planAmount: parseFloat(row['Plan Amount'] || 0),
      sequenceNo: parseInt(row['Sequence No'] || 0),
      active: row['Active/Inactive']?.toLowerCase() === 'active',
      stbName: row['STB Name'],
      stbNumber: row['STB Number'],
      cardNumber: row['Card Number'],
      products: row['Products']?.split(',').map((p) => p.trim()),
      additionalCharge: parseFloat(row['Additional Charge'] || 0),
      discount: parseFloat(row['Discount'] || 0),
      lastPaymentAmount: parseFloat(row['Last Payment Amount'] || 0),
      remark: row['Remark'],
    }));

    await Customer.insertMany(customers);

    res.json({
      message: 'Customers imported successfully.',
      count: customers.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to import customers' });
  }
};
