import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import ATSResult from "./pages/ATSResult";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import PrivateRoute from "./components/PrivateRoute";

function App() {

  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    const handleStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 border-b border-gray-800 bg-black/40 backdrop-blur-lg sticky top-0">

        <h1 className="text-3xl font-bold text-blue-500">
          HireMate AI 🚀
        </h1>

        <div className="flex gap-5">

          <Link to="/">
            <button className="hover:text-blue-400 transition-all">
              Home
            </button>
          </Link>

          {/* IF NOT LOGGED IN */}
          {!token && (
            <>
              <Link to="/login">
                <button className="bg-green-500 px-5 py-2 rounded-lg hover:bg-green-600 transition-all">
                  Login
                </button>
              </Link>

              <Link to="/register">
                <button className="bg-purple-500 px-5 py-2 rounded-lg hover:bg-purple-600 transition-all">
                  Register
                </button>
              </Link>
            </>
          )}

          {/* IF LOGGED IN */}
          {token && (
            <>
              <Link to="/dashboard">
                <button className="bg-yellow-500 px-5 py-2 rounded-lg hover:bg-yellow-600 transition-all">
                  Dashboard
                </button>
              </Link>

              <Link to="/resume-analyzer">
                <button className="hover:text-blue-400">
                  Resume Analyzer
                </button>
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 px-5 py-2 rounded-lg hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </nav>

      {/* Routes */}
      <div className="p-10">
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED ROUTES */}
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/resume-analyzer" element={
            <PrivateRoute><ResumeAnalyzer /></PrivateRoute>
          } />
          <Route path="/resume-upload" element={
            <PrivateRoute><ResumeUpload /></PrivateRoute>
          } />
          <Route path="/ats-result" element={
            <PrivateRoute><ATSResult /></PrivateRoute>
          } />

        </Routes>
      </div>

    </div>
  );
}

export default App;