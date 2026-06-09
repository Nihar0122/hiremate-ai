const fs = require("fs");
const pdfParse = require("pdf-parse");
const fetch = require("node-fetch");
const ResumeResult = require("../models/ResumeResult");
const authMiddleware = require("../middleware/authMiddleware");

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;
    fs.unlinkSync(req.file.path);

    const prompt = `You are an expert ATS resume analyzer.
Analyze this resume and return ONLY a JSON object with no extra text, no markdown:

{
  "atsScore": <number 0-100>,
  "placementProbability": "<Low/Medium/High>",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "summary": "<2 sentence overall assessment>"
}

Resume:
${resumeText}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.log("Gemini error:", data);
      return res.status(500).json({ message: "AI analysis failed", error: data });
    }

    const responseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = JSON.parse(jsonMatch[0]);

    const ResumeResult = require("../models/ResumeResult");
const authMiddleware = require("../middleware/authMiddleware");

    res.json({
      message: "Resume analyzed successfully 🚀",
      ...analysis
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Resume analysis failed",
      error: error.message
    });
  }
};

module.exports = { analyzeResume };