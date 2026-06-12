import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Sidebar({ token, onLogout }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (!token) return null;

  // Mobile menu overlay
  if (isMobile && mobileMenuOpen) {
    return (
      <div>
        {/* Mobile Menu Overlay */}
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />

        {/* Mobile Menu */}
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-800 z-50 flex flex-col overflow-y-auto md:hidden">
          <div className="p-4 flex items-center justify-between border-b border-slate-800">
            <span className="text-lg font-bold text-white">HireMate</span>
            <button
              onClick={closeMobileMenu}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-2">
            {token && (
              <>
                <Link to="/dashboard" onClick={closeMobileMenu}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all">
                    <span className="text-base">□</span>
                    <span className="text-sm font-medium">Dashboard</span>
                  </div>
                </Link>
                <Link to="/resume-analyzer" onClick={closeMobileMenu}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all">
                    <span className="text-base">⊞</span>
                    <span className="text-sm font-medium">Resume Analyzer</span>
                  </div>
                </Link>
                <Link to="/interview" onClick={closeMobileMenu}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all">
                    <span className="text-base">◇</span>
                    <span className="text-sm font-medium">Interview</span>
                  </div>
                </Link>
              </>
            )}
          </nav>

          {token && (
            <div className="px-3 py-4 border-t border-slate-800">
              <button
                onClick={() => {
                  onLogout();
                  closeMobileMenu();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                <span className="text-base">←</span>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </aside>

        <div className="md:hidden h-16" />
      </div>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800 flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } z-40`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-slate-800">
        {!collapsed && <span className="text-lg font-bold text-white">HireMate</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {token && (
          <>
            <Link to="/dashboard">
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all ${
                  window.location.pathname === "/dashboard"
                    ? "bg-blue-600 text-white"
                    : ""
                }`}
              >
                <span className="text-base flex-shrink-0">□</span>
                {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
              </div>
            </Link>
            <Link to="/resume-analyzer">
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all ${
                  window.location.pathname === "/resume-analyzer"
                    ? "bg-blue-600 text-white"
                    : ""
                }`}
              >
                <span className="text-base flex-shrink-0">⊞</span>
                {!collapsed && <span className="text-sm font-medium">Resume Analyzer</span>}
              </div>
            </Link>
            <Link to="/interview">
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all ${
                  window.location.pathname === "/interview"
                    ? "bg-blue-600 text-white"
                    : ""
                }`}
              >
                <span className="text-base flex-shrink-0">◇</span>
                {!collapsed && <span className="text-sm font-medium">Interview</span>}
              </div>
            </Link>
          </>
        )}
      </nav>

      {/* Logout */}
      {token && (
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <span className="text-base flex-shrink-0">←</span>
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;