const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
      index: true,
    },

    productCode: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },

    planType: {
      // renaming "category"
      type: String,
      enum: ['BASE', 'ADDON'],
      required: true,
      index: true,
    },

    customerPrice: { type: Number, required: true },
    operatorCost: { type: Number, required: true, default: 0 },

    billingInterval: {
      value: { type: Number, default: 30 },
      unit: { type: String, enum: ['days', 'months'], default: 'days' },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
