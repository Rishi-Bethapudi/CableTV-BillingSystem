const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema(
  {
    // the unique ID (_id) is automatically created by MongoDB
    name: { type: String, required: true }, // owner's name
    cableName: { type: String, required: true }, // company name / cable business name

    subscription: {
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date },
      status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active',
      },
    },

    contactNumber: String, // optional contact
    address: String, // optional office location

    // you can even store credentials for operator login here
    // email: String,
    // passwordHash: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Operator', operatorSchema);
