import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";
import ATSResult from "./pages/ATSResult";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Interview from "./pages/Interview";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";

function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    const handleStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white flex">

      {/* Sidebar */}
      <Sidebar token={token} onLogout={handleLogout} />

      {/* Main content — offset by sidebar width */}
      <main className={`flex-1 transition-all duration-300 ${token ? "ml-56" : "ml-0"}`}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
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
          <Route path="/interview" element={
            <PrivateRoute><Interview /></PrivateRoute>
          } />
        </Routes>
      </main>

    </div>
  );
}

export default App;