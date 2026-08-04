const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Hospital location is required"],
      default: "Kathmandu, Bagmati Province",
      trim: true,
    },
    hospitalCode: {
      type: String,
      default: function () {
        return "HP-" + Math.floor(1000 + Math.random() * 9000);
      },
    },
    // Hospital Credentials assigned by Admin
    username: {
      type: String,
      default: function () {
        return (this.hospitalCode || "hosp").toLowerCase().replace(/[^a-z0-9]/g, "") + "_admin";
      },
    },
    password: {
      type: String,
      default: "hospital123",
    },
    doctors: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      default: "+977-01-4400000",
    },
    email: {
      type: String,
      default: "contact@hospital.gov.np",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
