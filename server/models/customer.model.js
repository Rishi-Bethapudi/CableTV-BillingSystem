const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    // Multi-tenant references
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
    },

    // Provided fields
    customerCode: { type: String, required: true }, // you may later enforce unique per operator
    name: { type: String, required: true },
    locality: String,
    mobile: String,
    billingAddress: String,

    balanceAmount: { type: Number, default: 0 },
    connectionStartDate: Date,
    expiryDate: Date,

    sequenceNo: Number,

    active: { type: Boolean, default: true },

    stbName: String,
    stbNumber: String,
    cardNumber: String,

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    additionalCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },

    lastPaymentAmount: { type: Number, default: 0 },
    remark: String,
  },
  { timestamps: true }
);

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
