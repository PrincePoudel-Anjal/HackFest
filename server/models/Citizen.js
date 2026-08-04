const mongoose = require("mongoose");

const citizenSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    // Alias for name compatibility
    name: {
      type: String,
      trim: true,
    },
    healthId: {
      type: String,
      required: [true, "Health ID is required"],
      unique: true,
      trim: true,
    },
    birthCertificateNumber: {
      type: String,
      required: [true, "Birth Certificate Number is required"],
      unique: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Date of Birth is required"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown",
    },
    parentDetails: {
      fatherName: { type: String, default: "Ram Sharma" },
      motherName: { type: String, default: "Sita Sharma" },
    },
    phone: {
      type: String,
      default: "+977-9841234567",
      trim: true,
    },
    address: {
      province: { type: String, default: "Bagmati Province" },
      district: { type: String, default: "Kathmandu" },
      city: { type: String, default: "Kathmandu" },
    },
    emergencyContact: {
      name: { type: String, default: "Sita Sharma" },
      phone: { type: String, default: "+977-9801987654" },
      relation: { type: String, default: "Parent" },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to ensure fullName and name are kept in sync
citizenSchema.pre("save", async function () {
  if (this.fullName && !this.name) this.name = this.fullName;
  else if (this.name && !this.fullName) this.fullName = this.name;
});

module.exports = mongoose.model("Citizen", citizenSchema);
