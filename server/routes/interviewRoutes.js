const express = require("express");
const { generateQuestions, evaluateAnswer , saveInterview} = require("../controllers/interviewController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", authMiddleware, generateQuestions);
router.post("/evaluate", authMiddleware, evaluateAnswer);
router.post("/save", authMiddleware, saveInterview);

module.exports = router;