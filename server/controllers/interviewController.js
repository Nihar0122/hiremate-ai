const generateQuestions = async (req, res) => {
  try {
    const questions = [
      "Explain the Virtual DOM in React.",
      "What are React Hooks and why are they used?",
      "What is the difference between state and props?",
      "Explain the Node.js event loop.",
      "What is Express.js middleware?",
      "How does JWT authentication work?",
      "What is MongoDB and how is it different from SQL databases?",
      "Explain REST API principles.",
      "How would you optimize the performance of a React application?",
      "Describe a project where you used React, Node.js, and MongoDB together."
    ];

    res.json({ questions });
  } catch (error) {
    res.status(500).json({
      message: "Interview generation failed",
      error: error.message,
    });
  }
};

module.exports = { generateQuestions };