const mongoose = require("mongoose");

const citizenSchema = new mongoose.Schema(
  {
    healthId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown",
    },
    phone: String,
    address: {
      province: String,
      district: String,
      city: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Citizen", citizenSchema);
