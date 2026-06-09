const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const ResumeResult = require("../models/ResumeResult");
const InterviewResult = require("../models/InterviewResult");

// Get dashboard stats
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const resumeResults = await ResumeResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const interviewResults = await InterviewResult.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const avgAtsScore = resumeResults.length > 0
      ? Math.round(resumeResults.reduce((a, b) => a + b.atsScore, 0) / resumeResults.length)
      : 0;

    const avgInterviewScore = interviewResults.length > 0
      ? Math.round(interviewResults.reduce((a, b) => a + b.overallScore, 0) / interviewResults.length)
      : 0;

    res.json({
      resumeResults,
      interviewResults,
      avgAtsScore,
      avgInterviewScore,
      totalScans: resumeResults.length,
      totalInterviews: interviewResults.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;