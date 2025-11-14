const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. operatorId-202511
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
    },
    yearMonth: { type: String }, // '202511'
    value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// generic sequence
counterSchema.statics.getNextSequence = async function (name) {
  const counter = await this.findOneAndUpdate(
    { name },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};

// INVOICE NUMBER: YYYYMMDD + 4-digit serial (monthly reset per operator)
counterSchema.statics.getInvoiceNumber = async function (
  operatorId,
  date = new Date()
) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const yearMonth = `${year}${month}`; // "202511"
  const key = `inv-${operatorId}-${yearMonth}`; // separate namespace

  const counter = await this.findOneAndUpdate(
    { name: key },
    {
      $setOnInsert: { operatorId, yearMonth },
      $inc: { value: 1 },
    },
    { new: true, upsert: true }
  );

  const serial = String(counter.value).padStart(4, '0');
  return `${yearMonth}${day}${serial}`; // e.g. 202511120001
};

// RECEIPT NUMBER: continuous per operator
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
