import { useNavigate } from "react-router-dom";
import { COURSES } from "../data/mockData";

// Map notification to a route based on type and content
function getNotificationRoute(n) {
  // Grade notifications → go to the course page
  if (n.type === "grade") {
    const course = COURSES.find(c => n.desc?.includes(c.code));
    if (course) return `/course/${course.id}`;
    return "/grades";
  }
  // Deadline notifications → course page or assignments
  if (n.type === "deadline") {
    const course = COURSES.find(c => n.desc?.includes(c.code));
    if (course) return `/course/${course.id}`;
    return "/assignments";
  }
  // Alert notifications → manage courses
  if (n.type === "alert") {
    return "/manage-courses";
  }
  // AI notifications → manage courses (AI advisor lives there)
  if (n.type === "ai") {
    return "/manage-courses";
  }
  // Info → calendar
  if (n.type === "info") {
    return "/calendar";
  }
  return "/";
}

export default function NotificationCenter({ open, onClose, notifications, onMarkRead, onMarkAllRead }) {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!open) return null;

  const typeBorder = {
    grade: "#2563EB",
    deadline: "#F59E0B",
    alert: "#DC2626",
    ai: "#0F2044",
    info: "#64748B",
  };

  function handleClick(n) {
    onMarkRead(n.id);
    const route = getNotificationRoute(n);
    navigate(route);
    onClose();
  }

  return (
    <div style={{
      position: "fixed", top: 58, right: 20, zIndex: 600,
      width: 380, maxHeight: 500, background: "white",
      borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.18)",
      border: "1px solid var(--border)", display: "flex",
      flexDirection: "column", overflow: "hidden",
      animation: "fadeIn .2s ease",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 18px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🔔</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              background: "var(--red)", color: "white", fontSize: 10,
              fontWeight: 800, padding: "2px 7px", borderRadius: 20,
            }}>{unreadCount}</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {unreadCount > 0 && (
            <button onClick={onMarkAllRead} style={{
              background: "none", border: "none", fontSize: 12,
              color: "var(--blue)", cursor: "pointer", fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}>Mark all read</button>
          )}
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 18,
            color: "var(--slate)", cursor: "pointer", lineHeight: 1,
          }}>✕</button>
        </div>
      </div>

      {/* Notification List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {notifications.map((n) => {
          const route = getNotificationRoute(n);
          const routeLabel = {
            "/grades": "Open Grades",
            "/assignments": "Open Assignments",
            "/manage-courses": "Manage Courses",
            "/calendar": "Open Calendar",
            "/": "Dashboard",
          };
          // For course routes, show course code
          let actionLabel = routeLabel[route] || "View";
          if (route.startsWith("/course/")) {
            const course = COURSES.find(c => `/course/${c.id}` === route);
            actionLabel = course ? `Open ${course.code}` : "View Course";
          }

          return (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                padding: "14px 18px", borderBottom: "1px solid var(--border)",
                borderLeft: `3px solid ${typeBorder[n.type] || "var(--border)"}`,
                background: n.read ? "white" : "#F8FAFC",
                cursor: "pointer", transition: "background .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = n.read ? "#FAFAFA" : "#F1F5F9"; }}
              onMouseLeave={e => { e.currentTarget.style.background = n.read ? "white" : "#F8FAFC"; }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{n.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: n.read ? 500 : 700,
                    color: "var(--navy)", lineHeight: 1.3,
                  }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 2 }}>{n.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{n.time}</span>
                    <span style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600 }}>{actionLabel} →</span>
                  </div>
                </div>
                {!n.read && (
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "var(--blue)", flexShrink: 0, marginTop: 4,
                  }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Bell button for the topbar
export function NotificationBell({ onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative", background: "var(--light)",
        border: "1px solid var(--border)", borderRadius: "50%",
        width: 38, height: 38, display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer", fontSize: 16,
      }}
      aria-label={`Notifications: ${count} unread`}
    >
      🔔
      {count > 0 && (
        <span style={{
          position: "absolute", top: -2, right: -2,
          background: "#DC2626", color: "white", fontSize: 9,
          fontWeight: 800, width: 16, height: 16, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid white",
        }}>{count}</span>
      )}
    </button>
  );
}
