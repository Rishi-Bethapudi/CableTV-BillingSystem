const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
