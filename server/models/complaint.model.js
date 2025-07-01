const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    serialNumber: { type: Number }, // human friendly S.No

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    complain: { type: String, required: true },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
    },

    date: { type: Date, default: Date.now }, // complaint registered
    dueDate: { type: Date }, // by when to resolve
    completedDate: { type: Date }, // actually resolved

    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending',
    },

    remarks: String,
  },
  { timestamps: true }
);

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
