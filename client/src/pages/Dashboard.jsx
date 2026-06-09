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
      const res = await axios.get("http://localhost:5000/api/dashboard/stats", {
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
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30";
    if (score >= 60) return "from-amber-500/20 to-amber-500/5 border-amber-500/30";
    return "from-rose-500/20 to-rose-500/5 border-rose-500/30";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060608]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-white">

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm">
              ⚡
            </div>
            <p className="text-gray-500 text-sm font-medium">
              Welcome back, <span className="text-white">{user.name || "User"}</span>
            </p>
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            Your{" "}
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Career Hub
            </span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Track your progress, analyze resumes, and ace interviews
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Resume Scans", value: stats?.totalScans || 0, icon: "📄", color: "violet" },
            { label: "Interviews Done", value: stats?.totalInterviews || 0, icon: "🎯", color: "pink" },
            { label: "Avg ATS Score", value: `${stats?.avgAtsScore || 0}%`, icon: "📊", color: "amber", score: stats?.avgAtsScore },
            { label: "Avg Interview", value: `${stats?.avgInterviewScore || 0}%`, icon: "🏆", color: "emerald", score: stats?.avgInterviewScore },
          ].map((stat, i) => (
            <div key={i}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5
                         hover:bg-white/[0.06] transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <div className={`w-2 h-2 rounded-full bg-${stat.color}-400 opacity-60`} />
              </div>
              <p className={`text-3xl font-black mb-1 ${stat.score !== undefined ? getScoreColor(stat.score) : "text-white"}`}>
                {stat.value}
              </p>
              <p className="text-gray-600 text-xs font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/resume-analyzer">
            <div className="relative overflow-hidden rounded-2xl p-6 cursor-pointer
                            bg-gradient-to-br from-violet-600/20 to-violet-600/5
                            border border-violet-500/20 hover:border-violet-500/40
                            transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl
                              group-hover:bg-violet-500/20 transition-all" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl mb-4">
                  📄
                </div>
                <h3 className="font-bold text-white text-lg mb-1">Analyze Resume</h3>
                <p className="text-gray-500 text-sm">Get ATS score, skill gaps & AI suggestions</p>
                <div className="mt-4 flex items-center gap-2 text-violet-400 text-sm font-medium">
                  Start now <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/interview">
            <div className="relative overflow-hidden rounded-2xl p-6 cursor-pointer
                            bg-gradient-to-br from-pink-600/20 to-orange-600/5
                            border border-pink-500/20 hover:border-pink-500/40
                            transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl
                              group-hover:bg-pink-500/20 transition-all" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl mb-4">
                  🎯
                </div>
                <h3 className="font-bold text-white text-lg mb-1">Practice Interview</h3>
                <p className="text-gray-500 text-sm">AI mock interviews with real-time feedback</p>
                <div className="mt-4 flex items-center gap-2 text-pink-400 text-sm font-medium">
                  Start now <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* History Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Resume History */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Recent Resume Scans
            </h2>
            {!stats?.resumeResults?.length ? (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">
                <p className="text-4xl mb-3">📄</p>
                <p className="text-gray-500 text-sm mb-3">No scans yet</p>
                <Link to="/resume-analyzer">
                  <button className="text-xs bg-violet-600/20 text-violet-400 border border-violet-500/20 px-4 py-2 rounded-lg hover:bg-violet-600/30 transition-all">
                    Analyze first resume →
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.resumeResults.map((r, i) => (
                  <div key={i}
                    className={`bg-gradient-to-r ${getScoreBg(r.atsScore)} border rounded-xl p-4 flex justify-between items-center`}>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Scan #{stats.resumeResults.length - i}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString()} · {r.placementProbability} probability
                      </p>
                    </div>
                    <p className={`text-2xl font-black ${getScoreColor(r.atsScore)}`}>
                      {r.atsScore}%
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interview History */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Recent Interviews
            </h2>
            {!stats?.interviewResults?.length ? (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-gray-500 text-sm mb-3">No interviews yet</p>
                <Link to="/interview">
                  <button className="text-xs bg-pink-600/20 text-pink-400 border border-pink-500/20 px-4 py-2 rounded-lg hover:bg-pink-600/30 transition-all">
                    Start first interview →
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.interviewResults.map((r, i) => (
                  <div key={i}
                    className={`bg-gradient-to-r ${getScoreBg(r.overallScore)} border rounded-xl p-4 flex justify-between items-center`}>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.jobRole}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString()} · {r.totalQuestions} questions
                      </p>
                    </div>
                    <p className={`text-2xl font-black ${getScoreColor(r.overallScore)}`}>
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