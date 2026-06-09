const fetch = require("node-fetch");
const InterviewResult = require("../models/InterviewResult");

// Generate questions based on job role
const generateQuestions = async (req, res) => {
  try {
    const { jobRole } = req.body;

    if (!jobRole) {
      return res.status(400).json({ message: "Job role is required" });
    }

    const prompt = `You are a technical interviewer at a top tech company.
Generate exactly 5 interview questions for a ${jobRole} position.
Return ONLY a JSON array with no extra text, no markdown:
["question1", "question2", "question3", "question4", "question5"]

Mix technical and behavioral questions relevant to ${jobRole}.`;

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
    const responseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const questions = JSON.parse(jsonMatch[0]);

    res.json({ questions });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Question generation failed",
      error: error.message
    });
  }
};

// Evaluate user's answer
const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, jobRole } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: "Question and answer required" });
    }

    const prompt = `You are a strict but fair technical interviewer for a ${jobRole} position.
Evaluate this interview answer and return ONLY a JSON object with no extra text, no markdown:

{
  "score": <number 1-10>,
  "feedback": "<2-3 sentences of specific feedback>",
  "strongPoints": ["point1", "point2"],
  "improvements": ["improvement1", "improvement2"]
}

Question: ${question}
Candidate's Answer: ${answer}`;

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
    const responseText = data.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const evaluation = JSON.parse(jsonMatch[0]);

    res.json(evaluation);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Answer evaluation failed",
      error: error.message
    });
  }
};

const saveInterview = async (req, res) => {
  try {
    const { jobRole, overallScore, totalQuestions, evaluations } = req.body;
    const userId = req.user.id;

    await InterviewResult.create({
      userId,
      jobRole,
      overallScore,
      totalQuestions,
      evaluations
    });

    res.json({ message: "Interview saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateQuestions, evaluateAnswer, saveInterview };