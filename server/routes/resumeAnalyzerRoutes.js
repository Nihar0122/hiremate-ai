const express = require("express");
const upload = require("../config/multerConfig");
const { analyzeResume } = require("../controllers/resumeAnalyzerController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/analyze", authMiddleware, upload.single("resume"), analyzeResume);

module.exports = router;