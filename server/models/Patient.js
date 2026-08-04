const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Patient age is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    birthCertificateNumber: {
      type: String,
      required: [true, "Birth Certificate Number is required"],
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: "+977-9841234567",
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
      default: "Metformin 500mg daily, Aerobic exercise 30 mins",
      trim: true,
    },
    assignedDoctor: {
      type: String,
      required: [true, "Assigned Doctor is required"],
      trim: true,
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
