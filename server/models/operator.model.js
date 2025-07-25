const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cableName: { type: String, required: true },

    subscription: {
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date },
      status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active',
      },
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
    },
    contactNumber: {
      type: String,
      trim: true,
    },

    address: String,
    refreshTokens: [String],
  },
  { timestamps: true }
);

// Custom validator: at least one of email or contactNumber must be present
operatorSchema.path('email').validate(function (value) {
  if (!value && !this.contactNumber) {
    return false;
  }
  return true;
}, 'Either email or contact number must be provided.');

operatorSchema.path('contactNumber').validate(function (value) {
  if (!value && !this.email) {
    return false;
  }
  return true;
}, 'Either contact number or email must be provided.');

const Operator = mongoose.model('Operator', operatorSchema);
module.exports = Operator;
