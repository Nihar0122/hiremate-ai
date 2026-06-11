import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "□" },
  { path: "/resume-analyzer", label: "Resume Analyzer", icon: "⊞" },
  { path: "/interview", label: "Interview", icon: "◇" },
];

function Sidebar({ token, onLogout }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        bg-slate-950 border-r border-slate-800`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-slate-800">
        {!collapsed && (
          <span className="font-semibold text-lg text-slate-50 tracking-tight">
            HireMate
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-300 transition-colors ml-auto"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-2 px-3">
        {token && NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
              >
                <span className="text-base font-light">{item.icon}</span>
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}

        {!token && (
          <>
            <Link to="/login">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all">
                <span className="text-base font-light">→</span>
                {!collapsed && <span className="text-sm font-medium">Login</span>}
              </div>
            </Link>
            <Link to="/register">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all">
                <span className="text-base font-light">+</span>
                {!collapsed && <span className="text-sm font-medium">Register</span>}
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
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
        text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
    >
      <span className="text-base font-light">←</span>
      {!collapsed && <span className="text-sm font-medium">Logout</span>}
    </button>
  </div>
)}
    </aside>
  );
}

export default Sidebar;