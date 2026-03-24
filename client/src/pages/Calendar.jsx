import { COURSES } from "../data/mockData";

export default function Calendar() {
  // Gather all assignments with dates, sorted chronologically
  const all = COURSES.flatMap((c) =>
    c.assignments.map((a) => ({ ...a, courseCode: c.code, courseColor: c.color, courseName: c.name }))
  ).sort((a, b) => new Date(a.due + ", 2026") - new Date(b.due + ", 2026"));

  const statusColors = {
    submitted: { bg: "#DCFCE7", text: "#16A34A" },
    graded: { bg: "#DBEAFE", text: "#2563EB" },
    missing: { bg: "#FEE2E2", text: "#DC2626" },
    upcoming: { bg: "#DBEAFE", text: "#1D4ED8" },
    overdue: { bg: "#FEE2E2", text: "#DC2626" },
  };

  function parseMonthDay(due) {
    const parts = due.split(" ");
    return { month: parts[0], day: parts[1] };
  }

  // Only show pending/upcoming/missing/overdue items (not already submitted)
  const upcoming = all.filter((a) => ["upcoming", "missing", "overdue"].includes(a.status));
  const past = all.filter((a) => ["submitted", "graded"].includes(a.status));

  return (
    <div className="fade-in">
      <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "22px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          📅 Upcoming Deadlines – Spring 2026
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {upcoming.map((a, i) => {
            const { month, day } = parseMonthDay(a.due);
            const sc = statusColors[a.status] || statusColors.upcoming;
            const isUrgent = a.status === "missing" || a.status === "overdue";
            return (
              <div key={i} style={{
                display: "flex", gap: 14, alignItems: "center", padding: "12px 0",
                borderBottom: i < upcoming.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div style={{
                  width: 52, textAlign: "center", background: sc.bg,
                  borderRadius: 10, padding: "8px 4px", flexShrink: 0,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: sc.text }}>{month.toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: sc.text, lineHeight: 1 }}>{day}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 14 }}>{a.name}</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>
                    <span style={{ color: a.courseColor, fontWeight: 600 }}>{a.courseCode}</span>
                    {" · "}{a.pts}
                    {isUrgent && (
                      <span style={{ color: "#DC2626", fontWeight: 600 }}>{" · "}
                        {a.status === "missing" ? "MISSING" : "OVERDUE"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past / Completed */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "22px 24px", marginTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          ✅ Completed Work
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {past.map((a, i) => {
            const { month, day } = parseMonthDay(a.due);
            return (
              <div key={i} style={{
                display: "flex", gap: 14, alignItems: "center", padding: "12px 0",
                borderBottom: i < past.length - 1 ? "1px solid var(--border)" : "none",
                opacity: 0.7,
              }}>
                <div style={{
                  width: 52, textAlign: "center", background: "#DCFCE7",
                  borderRadius: 10, padding: "8px 4px", flexShrink: 0,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#16A34A" }}>{month.toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#16A34A", lineHeight: 1 }}>{day}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 14 }}>{a.name}</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>
                    <span style={{ color: a.courseColor, fontWeight: 600 }}>{a.courseCode}</span>
                    {" · "}{a.pts} · <span style={{ color: "#16A34A" }}>DONE</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
