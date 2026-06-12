import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ATSResult from "./pages/ATSResult";
import Interview from "./pages/Interview";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        {/* Mobile Header */}
        {isMobile && token && (
          <div className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 z-30 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-900 hover:text-slate-600 transition-colors"
            >
              <span className="text-2xl">☰</span>
            </button>
            <h1 className="text-lg font-bold text-slate-900">HireMate</h1>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        )}

        {/* Sidebar */}
        <Sidebar token={token} onLogout={handleLogout} />

        {/* Mobile Menu Toggle */}
        {isMobile && token && mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            token
              ? isMobile
                ? "pt-16 md:ml-0" // Mobile: add top padding for header
                : "md:ml-64" // Desktop: add left margin for sidebar
              : ""
          }`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/register" element={<Register setToken={setToken} />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/resume-upload" element={<PrivateRoute><ResumeUpload /></PrivateRoute>} />
            <Route path="/resume-analyzer" element={<PrivateRoute><ResumeAnalyzer /></PrivateRoute>} />
            <Route path="/ats-result" element={<PrivateRoute><ATSResult /></PrivateRoute>} />
            <Route path="/interview" element={<PrivateRoute><Interview /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;