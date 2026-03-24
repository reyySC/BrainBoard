import { STUDENT, COURSES, percentToGPA } from "../data/mockData";
import CourseCard from "../components/CourseCard";

export default function Dashboard() {
  const alerts = COURSES.filter((c) => c.alert);
  const totalCredits = COURSES.reduce((s, c) => s + c.credits, 0);
  const projectedGPA = COURSES.reduce((s, c) => s + percentToGPA(c.grade) * c.credits, 0) / totalCredits;

  return (
    <div className="fade-in">
      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <StatCard label="Projected GPA" value={projectedGPA.toFixed(2)} sub="↓ Below your 3.0 goal" color="#DC2626" />
        <StatCard label="Active Courses" value="4" sub="11 credit hours" />
        <StatCard label="Days to Finals" value={String(STUDENT.daysToFinals)} sub="Finals week: May 5–9" color="#D4A017" />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{
          background: "white", borderRadius: 16, border: "1px solid #FCA5A5",
          padding: "22px 24px", marginBottom: 20, backgroundColor: "#FFFBFB",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#DC2626", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            ⚠️ Urgent Alerts ({alerts.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alerts.map((c) => (
              <div key={c.id} style={{
                background: c.grade < 65 ? "#FEF9C3" : "#FEE2E2",
                borderRadius: 10, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{c.grade < 65 ? "🟡" : "🔴"}</span>
                <div>
                  <strong style={{ fontSize: 13, color: c.grade < 65 ? "#92400E" : "#991B1B" }}>{c.code} – {c.name} ({c.grade}%)</strong>
                  <br />
                  <span style={{ fontSize: 12.5, color: c.grade < 65 ? "#78350F" : "#7F1D1D" }}>{c.alertMsg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Cards */}
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 14 }}>📚 My Courses</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {COURSES.map((c) => <CourseCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--border)", padding: "18px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || "var(--navy)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>{sub}</div>
    </div>
  );
}
