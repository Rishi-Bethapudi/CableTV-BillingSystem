const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: String,
    subscriptionExpiry: Date,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Operator', operatorSchema);
