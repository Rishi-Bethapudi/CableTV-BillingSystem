const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    // Who logged the complaint
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'loggedByType',
    },
    loggedByType: {
      type: String,
      required: true,
      enum: ['Operator', 'Agent'],
    },
    // Who is assigned to resolve it
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    resolutionNotes: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
