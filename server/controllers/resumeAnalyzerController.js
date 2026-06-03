const fs = require("fs");
const pdfParse = require("pdf-parse");

const analyzeResume = async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(dataBuffer);

    const text = pdfData.text.toLowerCase();

    const skills = [
      "javascript",
      "react",
      "node",
      "express",
      "mongodb",
      "html",
      "css",
      "git",
      "docker",
      "aws",
      "python",
    ];

    let matchedSkills = [];

    skills.forEach((skill) => {
      if (text.includes(skill)) {
        matchedSkills.push(skill);
      }
    });

    const atsScore = Math.round(
  (matchedSkills.length / skills.length) * 100
);

let placementProbability = "Low";

if (atsScore >= 80) {
  placementProbability = "High";
} else if (atsScore >= 60) {
  placementProbability = "Medium";
}

const missingSkills = skills.filter(
  (skill) => !matchedSkills.includes(skill)
);

res.json({
  message: "Resume analyzed successfully 🚀",
  atsScore,
  matchedSkills,
  missingSkills,
  placementProbability,
});
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Resume analysis failed",
      error: error.message,
    });
  }
};

module.exports = { analyzeResume };