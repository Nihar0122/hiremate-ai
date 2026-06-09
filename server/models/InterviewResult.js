const mongoose = require("mongoose");

const interviewResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  jobRole: String,
  overallScore: Number,
  totalQuestions: Number,
  evaluations: [
    {
      question: String,
      answer: String,
      score: Number,
      feedback: String,
      strongPoints: [String],
      improvements: [String]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("InterviewResult", interviewResultSchema);