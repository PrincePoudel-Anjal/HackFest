const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Citizen",
    },
    healthId: {
      type: String,
      required: [true, "Health ID is required"],
      trim: true,
    },
    birthCertificateNumber: {
      type: String,
      required: [true, "Birth Certificate Number is required"],
      trim: true,
      index: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital ID is required"],
    },
    hospitalName: {
      type: String,
      required: [true, "Hospital Name is required"],
      trim: true,
    },
    assignedDoctor: {
      type: String,
      required: [true, "Assigned Doctor is required"],
      trim: true,
    },
    symptoms: {
      type: String,
      required: [true, "Symptoms are required"],
      trim: true,
    },
    diagnosis: {
      type: String,
      default: "Clinical Diagnostic Assessment",
      trim: true,
    },
    prescription: {
      type: String,
      default: "Metformin 500mg daily, Low sodium diet",
      trim: true,
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", patientSchema);
