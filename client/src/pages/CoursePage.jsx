import { useParams, Navigate } from "react-router-dom";
import { COURSES, getGradeColor, STATUS_STYLES, GRADE_HISTORY } from "../data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function CoursePage() {
  const { courseId } = useParams();
  const course = COURSES.find((c) => c.id === courseId);

  if (!course) return <Navigate to="/" />;

  const gradeColor = getGradeColor(course.grade);

  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{
        borderRadius: 16, padding: "28px 30px", color: "white", marginBottom: 24,
        position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg, ${course.color}, ${course.color}dd)`,
      }}>
        <div style={{
          position: "absolute", right: -30, top: -30, width: 200, height: 200,
          borderRadius: "50%", background: "rgba(255,255,255,.07)",
        }} />
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 4 }}>{course.name}</h2>
        <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>{course.code} · {course.instructor} · {course.credits} credit hours · Spring 2026</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--border)", padding: "18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Current Grade</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: gradeColor, lineHeight: 1 }}>{course.grade}%</div>
          <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>Letter grade: {course.letter}</div>
        </div>
        <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--border)", padding: "18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Trend</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "var(--navy)", lineHeight: 1 }}>
            {course.trend === "up" ? "↑" : course.trend === "down" ? "↓" : "→"}
          </div>
          <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>
            {course.trend === "up" ? "Improving" : course.trend === "down" ? "Declining" : "Stable"}
          </div>
        </div>
      </div>

      {/* Alert */}
      {course.alert && (
        <div style={{
          background: "#FEE2E2", borderRadius: 12, padding: "14px 18px",
          borderLeft: "4px solid #DC2626", marginBottom: 20, fontSize: 13.5, color: "#7F1D1D",
        }}>
          <strong>⚠️ BrainBoard Alert:</strong> {course.alertMsg}
        </div>
      )}

      {/* Grade Trend Chart */}
      {GRADE_HISTORY[courseId] && (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "22px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>📈 Grade Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={GRADE_HISTORY[courseId]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13 }} />
              <Line type="monotone" dataKey="grade" stroke={course.color} strokeWidth={2.5} dot={{ r: 4, fill: course.color }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Assignments Table */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "22px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>📋 Assignments & Grades</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Assignment", "Score", "Status"].map((h) => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textAlign: "left", padding: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {course.assignments.map((a, i) => {
              const s = STATUS_STYLES[a.status] || STATUS_STYLES.upcoming;
              return (
                <tr key={i}>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}><strong>{a.name}</strong></td>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>{a.pts}</td>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, background: s.bg, color: s.color }}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "22px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>📖 Syllabus Overview</div>
          <p style={{ fontSize: 13.5, color: "var(--slate)", lineHeight: 1.7, margin: 0 }}>{course.syllabus}</p>
        </div>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "22px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>🕒 Office Hours</div>
          <p style={{ fontSize: 13.5, color: "var(--slate)", margin: 0 }}>{course.officeHours}</p>
        </div>
      </div>
    </div>
  );
}
