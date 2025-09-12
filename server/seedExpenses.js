const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Expense = require('./models/expense.model');

dotenv.config();

async function seedExpenses() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        'mongodb+srv://CableTV-Billing:xHfUOkDYo7RgK1bm@cluster0.9znc3.mongodb.net/CableTV_Billing?retryWrites=true&w=majority&appName=Cluster0'
    );
    console.log('✅ MongoDB connected');

    const operatorId = '68c0295cb96f5d9c9eadb918'; // replace with your operator _id

    const expenses = [
      {
        expenseNumber: 'EXP001',
        expenseDate: '2024-01-15',
        category: 'Rent',
        vendor: 'Landlord Inc.',
        paymentMethod: 'UPI',
        amount: 1200,
        description: 'Monthly rent for office space',
        receiptNumber: 'REC123',
        notes: 'Paid via check #456',
      },
      {
        expenseNumber: 'EXP002',
        expenseDate: '2024-01-16',
        category: 'Utilities',
        vendor: 'Power Corp',
        paymentMethod: 'Credit Card',
        amount: 350,
        description: 'Electricity bill for January',
        receiptNumber: 'REC124',
        notes: 'Paid online with card ending in 1234',
      },
      {
        expenseNumber: 'EXP003',
        expenseDate: '2024-01-17',
        category: 'Maintenance',
        vendor: 'Office Depot',
        paymentMethod: 'Cash',
        amount: 150,
        description: 'Office supplies: paper, pens, etc.',
        receiptNumber: 'REC125',
        notes: 'Purchased in-store',
      },
      {
        expenseNumber: 'EXP004',
        expenseDate: '2024-01-18',
        category: 'Marketing',
        vendor: 'Ad Agency',
        paymentMethod: 'Bank Transfer',
        amount: 2000,
        description: 'Payment for online ad campaign',
        receiptNumber: 'REC126',
        notes: 'Transfer ref: AD202401',
      },
      {
        expenseNumber: 'EXP005',
        expenseDate: '2024-01-19',
        category: 'Marketing',
        vendor: 'Airline Co.',
        paymentMethod: 'Credit Card',
        amount: 800,
        description: 'Flight tickets for conference',
        receiptNumber: 'REC127',
        notes: 'Card ending in 5678',
      },
      {
        expenseNumber: 'EXP006',
        expenseDate: '2024-01-20',
        category: 'Salary',
        vendor: null,
        paymentMethod: 'UPI',
        amount: 5000,
        description: 'Employee salaries for January',
        receiptNumber: null,
        notes: 'Payroll run',
      },
      {
        expenseNumber: 'EXP007',
        expenseDate: '2024-01-21',
        category: 'Maintenance',
        vendor: 'Repair Services',
        paymentMethod: 'UPI',
        amount: 250,
        description: 'Repair of office equipment',
        receiptNumber: 'REC128',
        notes: 'UPI #789',
      },
      {
        expenseNumber: 'EXP008',
        expenseDate: '2024-01-22',
        category: 'Maintenance',
        vendor: 'Insurance Co.',
        paymentMethod: 'UPI',
        amount: 400,
        description: 'Business insurance premium',
        receiptNumber: 'REC129',
        notes: 'Paid via online portal',
      },
      {
        expenseNumber: 'EXP009',
        expenseDate: '2024-01-23',
        category: 'Training',
        vendor: 'Training Institute',
        paymentMethod: 'Credit Card',
        amount: 600,
        description: 'Employee training course',
        receiptNumber: 'REC130',
        notes: 'Card ending in 9012',
      },
      {
        expenseNumber: 'EXP010',
        expenseDate: '2024-01-24',
        category: 'Software',
        vendor: 'Software Inc.',
        paymentMethod: 'Credit Card',
        amount: 300,
        description: 'Subscription to project management software',
        receiptNumber: 'REC131',
        notes: 'Monthly subscription',
      },
      {
        expenseNumber: 'EXP011',
        expenseDate: '2024-01-25',
        category: 'Rent',
        vendor: 'Landlord Inc.',
        paymentMethod: 'UPI',
        amount: 1200,
        description: 'Monthly rent for office space',
        receiptNumber: 'REC132',
        notes: 'Paid via check #457',
      },
      {
        expenseNumber: 'EXP012',
        expenseDate: '2024-01-26',
        category: 'Maintenance',
        vendor: 'Power Corp',
        paymentMethod: 'Credit Card',
        amount: 350,
        description: 'Electricity bill for January',
        receiptNumber: 'REC133',
        notes: 'Paid online with card ending in 3456',
      },
    ];

    // attach operatorId to all
    const expensesWithOperator = expenses.map((e) => ({
      ...e,
      recordedBy: operatorId,
      recordedByType: 'Operator',
      operatorId,
    }));

    await Expense.deleteMany(); // clear old data
    await Expense.insertMany(expensesWithOperator);

    console.log('✅ Expenses seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding expenses:', err);
    process.exit(1);
  }
}

seedExpenses();
