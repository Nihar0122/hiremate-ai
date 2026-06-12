import { useState } from "react";
import axios from "axios";

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://hiremate-ai-0st4.onrender.com/api/analyze/analyze",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setResult(res.data);

    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "border-green-400";
    if (score >= 60) return "border-yellow-400";
    return "border-red-400";
  };

  return (
    <div className="max-w-3xl mx-auto text-white">
      <h1 className="text-4xl font-bold mb-2">ATS Resume Analyzer 🤖</h1>
      <p className="text-gray-400 mb-8">
        Upload your resume and get instant AI-powered ATS feedback
      </p>

      {/* Upload Box */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
        <label className="block text-sm text-gray-400 mb-3">
          Upload Resume (PDF only)
        </label>

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setError("");
              setResult(null);
            }}
            className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 
                       file:rounded-lg file:border-0 file:bg-blue-600 
                       file:text-white hover:file:bg-blue-700 cursor-pointer"
          />

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
           disabled:cursor-not-allowed px-6 py-2 rounded-lg 
           font-semibold transition-all"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {file && (
          <p className="text-sm text-gray-400 mt-3">
            Selected: {file.name}
          </p>
        )}

        {error && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🤖</div>
          <p className="text-gray-400 text-lg">
            AI is analyzing your resume...
          </p>
          <p className="text-gray-600 text-sm mt-2">
            This may take 10-15 seconds
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">

          {/* Score + Probability */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`bg-white/5 border-2 ${getScoreBg(result.atsScore)} 
                            rounded-2xl p-6 text-center`}>
              <p className="text-gray-400 text-sm mb-2">ATS Score</p>
              <p className={`text-6xl font-bold ${getScoreColor(result.atsScore)}`}>
                {result.atsScore}%
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-gray-400 text-sm mb-2">
                Placement Probability
              </p>
              <p className={`text-4xl font-bold mt-2
                ${result.placementProbability === "High" ? "text-green-400" :
                  result.placementProbability === "Medium" ? "text-yellow-400" :
                  "text-red-400"}`}>
                {result.placementProbability}
              </p>
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-2">📋 Summary</h3>
              <p className="text-gray-300">{result.summary}</p>
            </div>
          )}

          {/* Skills */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-green-400 mb-3">
                ✅ Matched Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map((skill) => (
                  <span key={skill}
                    className="bg-green-500/20 text-green-300 
                               px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-red-400 mb-3">
                ❌ Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill) => (
                  <span key={skill}
                    className="bg-red-500/20 text-red-300 
                               px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {result.suggestions && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold text-blue-400 mb-3">
                💡 Suggestions to Improve
              </h3>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-gray-300 flex gap-2">
                    <span className="text-blue-400">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interview CTA */}
          <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 text-center">
            <h3 className="font-bold text-purple-400 mb-2">🎯 Ready to Practice?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Prepare for interviews based on your skill gaps
            </p>
            <a href="/interview">
              <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold transition-all">
                Start AI Interview Simulator →
              </button>
            </a>
          </div>

        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
          

