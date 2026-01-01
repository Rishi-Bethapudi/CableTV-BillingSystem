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
    localities: [String],
    address: String,
    additionalItems: [
      {
        name: String,
        sellingPrice: Number,
        costPrice: Number,
        defaultNote: String,
      },
    ],
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

// import mongoose from "mongoose";

// const operatorSchema = new mongoose.Schema(
//   {
//     // 🔹 Core Identity
//     name: { type: String, required: true },
//     cableName: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     contactNumber: { type: String, required: true },
//     address: { type: String },
//     city: { type: String },
//     state: { type: String },
//     country: { type: String, default: "India" },
//     pincode: { type: String },

//     // 🔹 Subscription / Plan
//     subscription: {
//       planName: { type: String }, // e.g., "Premium Plan"
//       renewalAmount: { type: Number },
//       billFrequency: { type: String, enum: ["monthly", "quarterly", "yearly"] },
//       startDate: { type: Date },
//       endDate: { type: Date },
//       status: { type: String, enum: ["active", "inactive", "expired"], default: "inactive" },
//       isPrimeUser: { type: Boolean, default: false },
//     },

//     // 🔹 Billing & Finance
//     gstNumber: { type: String },
//     panNumber: { type: String },
//     bankDetails: {
//       accountName: { type: String },
//       accountNumber: { type: String },
//       ifscCode: { type: String },
//     },
//     paymentGateway: { type: String }, // e.g., Razorpay, PayU

//     // 🔹 Branding
//     logoUrl: { type: String },
//     bannerUrl: { type: String },
//     invoicePrefix: { type: String },
//     billTemplate: { type: String }, // e.g., "default", "modern"
//     themeColor: { type: String, default: "#000000" },
//     smsDisplayName: { type: String },

//     // 🔹 Communication
//     smsSenderId: { type: String },
//     smsUserName: { type: String },
//     messageContact: { type: String },
//     whatsappConsent: { type: Boolean, default: false },

//     // 🔹 Usage Stats
//     customerLimit: { type: Number, default: 0 },
//     totalCustomers: { type: Number, default: 0 },
//     agentsAllowed: { type: Number, default: 0 },
//     agentsUsed: { type: Number, default: 0 },
//     supervisorsAllowed: { type: Number, default: 0 },
//     supervisorsUsed: { type: Number, default: 0 },

//     // 🔹 Ratings / Feedback
//     rating: { type: Number, min: 1, max: 5 },
//     feedback: { type: String },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Operator", operatorSchema);
