import { useState } from "react";
import axios from "axios";

const JOB_ROLES = [
  "Frontend Developer",
  "Backend Developer", 
  "Full Stack Developer",
  "React Developer",
  "Node.js Developer",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Software Engineer",
];

function Interview() {
  const [jobRole, setJobRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const token = localStorage.getItem("token");

  const startInterview = async () => {
    if (!jobRole) return;
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/interview/generate",
        { jobRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(res.data.questions);
      setCurrentQ(0);
      setEvaluations([]);
      setSessionComplete(false);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/interview/evaluate",
        {
          question: questions[currentQ],
          answer,
          jobRole
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newEvaluations = [...evaluations, {
        question: questions[currentQ],
        answer,
        ...res.data
      }];

      setEvaluations(newEvaluations);
      setAnswer("");

      if (currentQ + 1 >= questions.length) {
        setSessionComplete(true);
      } else {
        setCurrentQ(currentQ + 1);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setEvaluating(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const avgScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((a, b) => a + b.score, 0) / evaluations.length * 10)
    : 0;

  // Role selector screen
  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-white">
        <h1 className="text-4xl font-bold mb-2">AI Interview Simulator 🎯</h1>
        <p className="text-gray-400 mb-8">
          Practice real interview questions and get instant AI feedback
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <label className="block text-sm text-gray-400 mb-3">
            Select Job Role
          </label>
          <select
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full bg-black/40 border border-gray-600 rounded-lg 
                       p-3 text-white mb-6 outline-none"
          >
            <option value="">-- Choose a role --</option>
            {JOB_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <button
            onClick={startInterview}
            disabled={!jobRole || loading}
            className="w-full bg-purple-600 hover:bg-purple-700 
                       disabled:bg-gray-600 disabled:cursor-not-allowed
                       py-3 rounded-lg font-semibold transition-all"
          >
            {loading ? "Generating Questions..." : "Start Interview 🚀"}
          </button>
        </div>
      </div>
    );
  }

  // Session complete screen
  if (sessionComplete) {
    return (
      <div className="max-w-3xl mx-auto text-white">
        <h1 className="text-4xl font-bold mb-2">Interview Complete! 🎉</h1>
        <p className="text-gray-400 mb-8">Here's your performance report</p>

        {/* Overall Score */}
        <div className="bg-white/5 border-2 border-purple-500 rounded-2xl p-6 text-center mb-6">
          <p className="text-gray-400 mb-2">Overall Score</p>
          <p className={`text-6xl font-bold ${getScoreColor(avgScore / 10)}`}>
            {avgScore}%
          </p>
          <p className="text-gray-400 mt-2">
            {avgScore >= 80 ? "Excellent! You're interview-ready 🔥" :
             avgScore >= 60 ? "Good effort! Keep practicing 💪" :
             "Needs improvement. Review and retry 📚"}
          </p>
        </div>

        {/* Per question breakdown */}
        <div className="space-y-4 mb-6">
          {evaluations.map((ev, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-3">
                <p className="font-semibold text-sm text-gray-300">
                  Q{i + 1}: {ev.question}
                </p>
                <span className={`text-2xl font-bold ml-4 ${getScoreColor(ev.score)}`}>
                  {ev.score}/10
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">{ev.feedback}</p>
              {ev.strongPoints?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {ev.strongPoints.map((p, j) => (
                    <span key={j} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                      ✅ {p}
                    </span>
                  ))}
                </div>
              )}
              {ev.improvements?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ev.improvements.map((p, j) => (
                    <span key={j} className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
                      💡 {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setQuestions([]);
            setJobRole("");
            setEvaluations([]);
            setSessionComplete(false);
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold"
        >
          Start New Interview
        </button>
      </div>
    );
  }

  // Active interview screen
  return (
    <div className="max-w-2xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Interview — {jobRole}</h1>
        <span className="text-gray-400">
          Question {currentQ + 1} of {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentQ) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <p className="text-sm text-purple-400 mb-2">Question {currentQ + 1}</p>
        <p className="text-xl font-semibold">{questions[currentQ]}</p>
      </div>

      {/* Answer box */}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        rows={6}
        className="w-full bg-black/40 border border-gray-600 rounded-xl 
                   p-4 text-white outline-none resize-none mb-4
                   focus:border-purple-500 transition-all"
      />

      <button
        onClick={submitAnswer}
        disabled={!answer.trim() || evaluating}
        className="w-full bg-purple-600 hover:bg-purple-700 
                   disabled:bg-gray-600 disabled:cursor-not-allowed
                   py-3 rounded-lg font-semibold transition-all"
      >
        {evaluating ? "AI is evaluating..." : 
         currentQ + 1 === questions.length ? "Submit Final Answer" : "Submit & Next →"}
      </button>
    </div>
  );
}

export default Interview;