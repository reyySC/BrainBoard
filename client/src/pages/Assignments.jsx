import { COURSES, STATUS_STYLES } from "../data/mockData";

export default function Assignments() {
  const all = COURSES.flatMap((c) =>
    c.assignments.map((a) => ({ ...a, courseCode: c.code, courseColor: c.color }))
  );

  const order = { missing: 0, overdue: 0, upcoming: 1, graded: 2, submitted: 3 };
  const sorted = [...all].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));

  return (
    <div className="fade-in">
      <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "22px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          📋 All Assignments – Spring 2026
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Assignment", "Course", "Due Date", "Points", "Status"].map((h) => (
                <th key={h} style={{
                  fontSize: 11, fontWeight: 700, color: "var(--muted)", textAlign: "left",
                  padding: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.8,
                  borderBottom: "1px solid var(--border)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => {
              const s = STATUS_STYLES[a.status] || STATUS_STYLES.upcoming;
              return (
                <tr key={i}>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>
                    <strong>{a.name}</strong>
                  </td>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>
                    <span style={{ color: a.courseColor, fontWeight: 600 }}>{a.courseCode}</span>
                  </td>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>{a.due}</td>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>{a.pts}</td>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{
                      display: "inline-block", padding: "3px 9px", borderRadius: 6,
                      fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
                      background: s.bg, color: s.color,
                    }}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
