import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "⚡" },
  { path: "/resume-analyzer", label: "Resume Analyzer", icon: "📄" },
  { path: "/interview", label: "Interview Sim", icon: "🎯" },
];

function Sidebar({ token, onLogout }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300
        ${collapsed ? "w-16" : "w-56"}
        bg-[#0a0a0f] border-r border-white/5`}
      style={{ backdropFilter: "blur(20px)" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
        {!collapsed && (
          <span className="font-black text-lg tracking-tight bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            HireMate AI
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-white transition-colors ml-auto"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {token && NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${active
                  ? "bg-gradient-to-r from-violet-600/30 to-pink-600/20 border border-violet-500/30 text-white"
                  : "text-gray-500 hover:text-white hover:bg-white/5"}`}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && (
                  <span className={`text-sm font-medium ${active ? "text-white" : ""}`}>
                    {item.label}
                  </span>
                )}
                {active && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </div>
            </Link>
          );
        })}

        {!token && (
          <>
            <Link to="/login">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                <span>🔐</span>
                {!collapsed && <span className="text-sm font-medium">Login</span>}
              </div>
            </Link>
            <Link to="/register">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                <span>🚀</span>
                {!collapsed && <span className="text-sm font-medium">Register</span>}
              </div>
            </Link>
          </>
        )}
      </nav>

      {/* Bottom - logout */}
      {token && (
        <div className="px-2 py-4 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span>🚪</span>
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;