import { useState } from "react";
import axios from "axios";

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/analyze/analyze",
        formData
      );

      setResult(res.data);
      setQuestions([]); // Clear old questions
    } catch (err) {
      console.log(err);
      alert("Analysis failed");
    }
  };

  const generateQuestions = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/interview",
        {
          resumeText: result?.matchedSkills?.join(" "),
        }
      );

      setQuestions(response.data.questions);
    } catch (error) {
      console.log(error);
      alert("Failed to generate questions");
    }
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-4xl font-bold mb-5">
        ATS Resume Analyzer 🤖
      </h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={handleUpload}
        className="bg-blue-500 px-4 py-2 rounded ml-3"
      >
        Analyze Resume
      </button>

      {result && (
        <div className="mt-10">
          <h2 className="text-2xl mb-4">
            ATS Score: {result.atsScore}%
          </h2>

          <h3 className="text-green-400 font-bold">
            Matched Skills
          </h3>

          <ul className="mb-4">
            {result.matchedSkills.map((skill) => (
              <li key={skill}>✅ {skill}</li>
            ))}
          </ul>

          <h3 className="text-red-400 font-bold">
            Missing Skills
          </h3>

          <ul className="mb-6">
            {result.missingSkills.map((skill) => (
              <li key={skill}>❌ {skill}</li>
            ))}
          </ul>

          <button
            onClick={generateQuestions}
            className="bg-purple-600 px-4 py-2 rounded"
          >
            Generate Interview Questions
          </button>

          {questions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">
                Interview Questions
              </h2>

              <ul>
                {questions.map((question, index) => (
                  <li key={index} className="mb-3">
                    {index + 1}. {question}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;