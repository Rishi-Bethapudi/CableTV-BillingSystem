const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    name: { type: String, required: true },
    email: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    mobile: { type: String, required: true, unique: true, trim: true },
    address: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

const Agent = mongoose.model('Agent', agentSchema);
module.exports = Agent;
