const Counter = require('../models/counter.model.js');
const Transaction = require('../models/transaction.model.js');

async function createTransaction(req, res) {
  try {
    const {
      operatorId,
      customerId,
      collectedBy,
      paidAmount,
      discountAmount,
      comment,
      mode,
      balanceAfter,
    } = req.body;

    // ⏩ get auto paymentId
    const paymentId = await Counter.getPaymentId(operatorId);

    const txn = new Transaction({
      operatorId,
      customerId,
      collectedBy,
      paymentId,
      paidAmount,
      discountAmount,
      comment,
      mode,
      balanceAfter,
    });

    await txn.save();
    res.json({ message: 'Transaction recorded', transaction: txn });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
}
