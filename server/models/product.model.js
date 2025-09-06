// models/product.model.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Basic', 'Premium', 'Add-on'],
      default: 'basic',
    },
    // The price you charge the customer
    customerPrice: {
      type: Number,
      required: true,
    },
    // The cost you incur for this product
    operatorCost: {
      type: Number,
      required: true,
      default: 0,
    },
    billingInterval: {
      // e.g., 30 for monthly, 90 for quarterly
      type: Number,
      default: 30,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
