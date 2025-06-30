const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    planCharge: { type: Number, required: true },

    // optional extra
    description: { type: String }, // short description of the plan
    isActive: { type: Boolean, default: true }, // for disabling a product
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
