import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import BrainBoardWidget from "./components/brainboard/BrainBoardWidget";
import NotificationCenter, { NotificationBell } from "./components/NotificationCenter";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assignments from "./pages/Assignments";
import Grades from "./pages/Grades";
import Calendar from "./pages/Calendar";
import CoursePage from "./pages/CoursePage";
import Profile from "./pages/Profile";
import ManageCourses from "./pages/ManageCourses";
import { COURSES, NOTIFICATIONS, STUDENT } from "./data/mockData";

function Topbar({ onNotifToggle, notifOpen, unreadCount }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const titles = {
    "/": "Dashboard",
    "/assignments": "Assignments",
    "/grades": "Grade Book",
    "/calendar": "Course Calendar",
    "/profile": "Student Profile",
    "/manage-courses": "Manage Courses",
  };

  let title = titles[path] || "";

  // Handle course pages
  if (path.startsWith("/course/")) {
    const courseId = path.split("/course/")[1];
    const course = COURSES.find((c) => c.id === courseId);
    if (course) title = `${course.code} – ${course.name}`;
  }

  return (
    <div style={{
      background: "white", borderBottom: "1px solid var(--border)", height: 58,
      display: "flex", alignItems: "center", padding: "0 28px", gap: 16, flexShrink: 0,
    }}>
      <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)", flex: 1, margin: 0 }}>{title}</h1>
      <button
        onClick={() => navigate("/calendar")}
        style={{
          background: "var(--light)", border: "1px solid var(--border)", borderRadius: 20,
          padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "var(--slate)",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'DM Sans', sans-serif", transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#E2E8F0"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "var(--light)"; }}
      >
        📅 Spring 2026 · Week 10 of 16
      </button>
      <div
        onClick={() => navigate("/profile")}
        style={{
          display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          padding: "4px 12px 4px 4px", borderRadius: 20,
          border: "1px solid var(--border)", background: "var(--light)",
          transition: "all .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#E2E8F0"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "var(--light)"; }}
      >
        <img src="/avatar.png" alt={STUDENT.name} style={{
          width: 28, height: 28, borderRadius: "50%", objectFit: "cover",
        }} />
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--navy)" }}>{STUDENT.name}</div>
          <div style={{ fontSize: 10, color: "var(--slate)" }}>CS Senior</div>
        </div>
      </div>
      <NotificationBell onClick={onNotifToggle} count={unreadCount} />
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [bbOpen, setBbOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS.map(n => ({ ...n })));

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <BrowserRouter>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar onBrainBoard={() => setBbOpen(true)} onLogout={() => setLoggedIn(false)} />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Topbar onNotifToggle={() => setNotifOpen(!notifOpen)} notifOpen={notifOpen} unreadCount={unreadCount} />
          <div style={{ flex: 1, overflowY: "auto", padding: 28 }} className="fade-in">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/grades" element={<Grades />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/manage-courses" element={<ManageCourses />} />
              <Route path="/course/:courseId" element={<CoursePage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>

        {/* Notification Center */}
        <NotificationCenter
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          notifications={notifications}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
        />

        {/* BrainBoard floating widget */}
        <button
          onClick={() => setBbOpen(!bbOpen)}
          style={{
            position: "fixed", bottom: 28, right: 28, zIndex: 500,
            width: 60, height: 60, borderRadius: "50%",
            background: "var(--navy)", border: "none", cursor: "pointer",
            boxShadow: "0 8px 24px rgba(15,32,68,.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, transition: "transform .2s",
          }}
          aria-label="Open BrainBoard AI assistant"
        >
          🧠
          {!bbOpen && (
            <div style={{
              position: "absolute", top: 0, right: 0, width: 14, height: 14,
              background: "var(--red)", border: "2px solid white", borderRadius: "50%",
              animation: "pulse 2s infinite",
            }} />
          )}
        </button>

        <BrainBoardWidget onClose={() => setBbOpen(false)} visible={bbOpen} />
      </div>
    </BrowserRouter>
  );
}
