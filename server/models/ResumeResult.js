const mongoose = require("mongoose");

const resumeResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  atsScore: Number,
  placementProbability: String,
  matchedSkills: [String],
  missingSkills: [String],
  suggestions: [String],
  summary: String
}, { timestamps: true });

module.exports = mongoose.model("ResumeResult", resumeResultSchema);