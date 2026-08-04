const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema(
  {
    healthId: {
      type: String,
      required: true,
      index: true,
    },
    overallHealthScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    riskScores: [
      {
        disease: String,
        riskPercentage: Number,
        status: { type: String, enum: ["Low", "Moderate", "High", "Critical"] },
        trend: String,
      },
    ],
    explanation: String,
    recommendedTests: [String],
    lifestyleSuggestions: [String],
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIAnalysis", aiAnalysisSchema);
