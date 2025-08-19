const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskType: {
      type: String,
      enum: ['B2B', 'B2C'],
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientAddress: {
      type: String,
      required: true,
    },
    patientLocation: {
      type: String, // optional location URL
    },
    sampleType: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },

    // Progress tracking timestamps
    taskStartedAt: { type: Date },
    reachedAt: { type: Date },
    sampleCollectedAt: { type: Date },
    submittedToLabAt: { type: Date },

    // Image proof - keep the old one for backward compatibility if needed, but you may deprecate later
    photoProof: { type: String }, // filename of uploaded single image

    // New fields to support multiple images, tube count, TR form, and verification
    sampleImages: [{ type: String }], // array of filenames/paths for multiple sample images
    tubeCount: { type: Number },
    trForm: { type: String }, // filename/path for uploaded TR form

    // Verification fields (for admin verification and superadmin viewing)
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Task', taskSchema);
