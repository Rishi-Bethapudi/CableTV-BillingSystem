const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. operatorId-202506
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    yearMonth: { type: String, required: true }, // '202506'
    value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 🚀 STATIC METHOD TO GET NEXT PAYMENT ID
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

  const serial = String(counter.value).padStart(2, '0');
  return `${yearMonth}${serial}`; // e.g. 2025060001
};

counterSchema.statics.getReceiptNumber = async function (operatorId) {
  const key = `receipt-${operatorId}`; // A continuous key for the operator

  const counter = await this.findOneAndUpdate(
    { name: key },
    {
      $setOnInsert: { operatorId },
      $inc: { value: 1 },
    },
    { new: true, upsert: true }
  );

  // You can format it if you like, e.g., pad with zeros, or just return the number
  return counter.value.toString().padStart(6, '0'); // e.g., "000001", "000002"
};
counterSchema.statics.getNextSequence = async function (name) {
  const counter = await this.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};
const Counter = mongoose.model('Counter', counterSchema);
module.exports = Counter;
