const express = require("express");
const upload = require("../config/multerConfig");
const { analyzeResume } = require("../controllers/resumeAnalyzerController");

const router = express.Router();

router.post(
  "/analyze",
  upload.single("resume"),
  analyzeResume
);

module.exports = router;