const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    productCode: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Basic', 'Premium', 'Add-on'],
      default: 'Basic',
    },

    // Price charged to customer
    customerPrice: { type: Number, required: true },

    // Cost to operator
    operatorCost: { type: Number, required: true, default: 0 },

    // Default billing cycle
    billingInterval: {
      value: { type: Number, default: 30 }, // e.g. 30
      unit: { type: String, enum: ['days', 'months'], default: 'days' },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
