import { useLocation, useNavigate } from "react-router-dom";
import { COURSES } from "../data/mockData";

export default function Sidebar({ onBrainBoard, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/", icon: "🏠", label: "Dashboard" },
    { path: "/assignments", icon: "📋", label: "Assignments", badge: 3, badgeType: "warn" },
    { path: "/grades", icon: "📊", label: "Grades" },
    { path: "/calendar", icon: "📅", label: "Calendar" },
    { path: "/manage-courses", icon: "📚", label: "Manage Courses" },
  ];

  const isActive = (path) => location.pathname === path;

  const navStyle = (active) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
    borderRadius: 10, margin: "2px 8px", cursor: "pointer",
    fontSize: 13.5, fontWeight: active ? 600 : 500,
    color: active ? "white" : "rgba(255,255,255,.65)",
    background: active ? "rgba(255,255,255,.15)" : "transparent",
    border: "none", width: "calc(100% - 16px)", textAlign: "left",
    fontFamily: "'DM Sans', sans-serif", transition: "all .15s",
  });

  return (
    <nav style={{
      width: 250, background: "var(--navy)", display: "flex",
      flexDirection: "column", flexShrink: 0, overflowY: "auto",
    }}>
      {/* Brand */}
      <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>🎓</span>
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: "white", lineHeight: 1.1 }}>BrainBoard</h2>
          <small style={{ color: "rgba(255,255,255,.5)", fontSize: 10, letterSpacing: 0.5 }}>SPRING 2026</small>
        </div>
      </div>

      {/* Main Nav */}
      <div style={{ padding: "16px 10px 4px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>Main</div>
      {navItems.map((item) => (
        <button key={item.path} onClick={() => navigate(item.path)} style={navStyle(isActive(item.path))}>
          <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
          {item.label}
          {item.badge && (
            <span style={{
              marginLeft: "auto", background: item.badgeType === "warn" ? "var(--amber)" : "var(--red)",
              color: item.badgeType === "warn" ? "var(--navy)" : "white",
              fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20,
            }}>{item.badge}</span>
          )}
        </button>
      ))}

      {/* Courses */}
      <div style={{ padding: "16px 10px 4px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>My Courses</div>
      {COURSES.map((c) => (
        <button key={c.id} onClick={() => navigate(`/course/${c.id}`)} style={navStyle(location.pathname === `/course/${c.id}`)}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
          {c.code} – {c.name}
        </button>
      ))}

      {/* Support */}
      <div style={{ padding: "16px 10px 4px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.35)", letterSpacing: 1.2, textTransform: "uppercase" }}>Support</div>
      <button onClick={onBrainBoard} style={navStyle(false)}>
        <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>🧠</span>
        BrainBoard AI
        <span style={{ marginLeft: "auto", background: "var(--red)", color: "white", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>2</span>
      </button>
      <button onClick={onLogout} style={navStyle(false)}>
        <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>🚪</span>
        Sign Out
      </button>
    </nav>
  );
}
