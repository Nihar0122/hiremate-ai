import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetchStats(token);
  }, []);

  const fetchStats = async (token) => {
    try {
      const res = await axios.get("https://hiremate-ai-0st4.onrender.com/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm font-medium">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-slate-600 text-sm font-medium mb-2">
            Welcome back, <span className="text-slate-900 font-semibold">{user.name || "User"}</span>
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1 text-sm">
            Track your progress and career development
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Resume Scans", value: stats?.totalScans || 0, color: "blue" },
            { label: "Interviews Done", value: stats?.totalInterviews || 0, color: "slate" },
            { label: "Avg ATS Score", value: `${stats?.avgAtsScore || 0}%`, score: stats?.avgAtsScore },
            { label: "Avg Interview", value: `${stats?.avgInterviewScore || 0}%`, score: stats?.avgInterviewScore },
          ].map((stat, i) => (
            <div key={i}
              className={`p-5 rounded-lg border transition-all
                ${stat.color === "blue" ? "bg-blue-50 border-blue-200" :
                  stat.color === "slate" ? "bg-slate-100 border-slate-200" :
                  stat.score !== undefined ? getScoreBg(stat.score) :
                  "bg-slate-100 border-slate-200"}`}
            >
              <p className={`text-2xl font-semibold mb-1
                ${stat.score !== undefined ? getScoreColor(stat.score) :
                  stat.color === "blue" ? "text-blue-600" : "text-slate-900"}`}>
                {stat.value}
              </p>
              <p className="text-slate-600 text-xs font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/resume-analyzer">
            <div className="p-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <h3 className="font-semibold text-slate-900 text-lg mb-1">Analyze Resume</h3>
              <p className="text-slate-600 text-sm">Get ATS score and skill feedback</p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-medium">
                Start now →
              </div>
            </div>
          </Link>

          <Link to="/interview">
            <div className="p-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <h3 className="font-semibold text-slate-900 text-lg mb-1">Practice Interview</h3>
              <p className="text-slate-600 text-sm">AI-powered mock interviews with feedback</p>
              <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-medium">
                Start now →
              </div>
            </div>
          </Link>
        </div>

        {/* History Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Resume History */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
              Resume Scans
            </h2>
            {!stats?.resumeResults?.length ? (
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <p className="text-slate-600 text-sm mb-3">No scans yet</p>
                <Link to="/resume-analyzer">
                  <button className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Analyze first resume
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.resumeResults.map((r, i) => (
                  <div key={i}
                    className={`border rounded-lg p-4 flex justify-between items-center ${getScoreBg(r.atsScore)}`}>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Scan #{stats.resumeResults.length - i}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`text-lg font-semibold ${getScoreColor(r.atsScore)}`}>
                      {r.atsScore}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interview History */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
              Interviews
            </h2>
            {!stats?.interviewResults?.length ? (
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <p className="text-slate-600 text-sm mb-3">No interviews yet</p>
                <Link to="/interview">
                  <button className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Start first interview
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.interviewResults.map((r, i) => (
                  <div key={i}
                    className={`border rounded-lg p-4 flex justify-between items-center ${getScoreBg(r.overallScore)}`}>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{r.jobRole}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString()} · {r.totalQuestions} questions
                      </p>
                    </div>
                    <p className={`text-lg font-semibold ${getScoreColor(r.overallScore)}`}>
                      {r.overallScore}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;