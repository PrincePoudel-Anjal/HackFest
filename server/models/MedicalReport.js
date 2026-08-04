const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient Name is required"],
      trim: true,
    },
    birthCertificateNumber: {
      type: String,
      required: [true, "Birth Certificate Number or Health ID is required"],
      trim: true,
    },
    assignedDoctor: {
      type: String,
      required: [true, "Assigned Doctor is required"],
      trim: true,
    },
    symptoms: {
      type: String,
      required: [true, "Symptoms & Clinical Complaints are required"],
      trim: true,
    },
    assignedHospital: {
      type: String,
      required: [true, "Assigned Hospital Node is required"],
      trim: true,
    },
    healthId: {
      type: String,
      default: function () {
        return this.birthCertificateNumber || "NP-9841-0021";
      },
    },
    title: {
      type: String,
      default: "Clinical Evaluation & Diagnostic Report",
    },
    category: {
      type: String,
      default: "Blood Test",
    },
    recordDate: {
      type: Date,
      default: Date.now,
    },
    metrics: {
      bloodSugar: Number,
      hba1c: Number,
      bloodPressureSystolic: Number,
      bloodPressureDiastolic: Number,
      eGFR: Number,
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalReport", medicalReportSchema);
