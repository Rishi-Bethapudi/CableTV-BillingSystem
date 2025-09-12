const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. operatorId-202506
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: false, // not all counters need operator
    },
    yearMonth: { type: String }, // e.g. '202506'
    value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Get next sequence for a generic name (used by expenseNumber, etc.)
counterSchema.statics.getNextSequence = async function (name) {
  const counter = await this.findOneAndUpdate(
    { name },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};

// Generate payment ID (operator + month-based)
counterSchema.statics.getPaymentId = async function (operatorId) {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}`;
  const key = `${operatorId}-${yearMonth}`;

  const counter = await this.findOneAndUpdate(
    { name: key },
    {
      $setOnInsert: { operatorId, yearMonth },
      $inc: { value: 1 },
    },
    { new: true, upsert: true }
  );

  const serial = String(counter.value).padStart(4, '0');
  return `${yearMonth}${serial}`; // e.g. 2025090001
};

// Generate receipt number (continuous for operator)
counterSchema.statics.getReceiptNumber = async function (operatorId) {
  const key = `receipt-${operatorId}`;
  const counter = await this.findOneAndUpdate(
    { name: key },
    {
      $setOnInsert: { operatorId },
      $inc: { value: 1 },
    },
    { new: true, upsert: true }
  );
  return counter.value.toString().padStart(6, '0'); // "000001"
};

const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;
