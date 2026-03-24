import { Sparkles, AlertTriangle, TrendingUp } from "lucide-react";
import { COURSES } from "../../data/mockData";

export default function HeroSection({ aiData, loading, error, currentGPA, cumulativeGPA }) {
  const atRiskCount = COURSES.filter(
    c => c.grade < 70 || c.assignments.some(a => a.status === "missing")
  ).length;
  const performingCount = COURSES.filter(c => c.grade >= 85).length;

  return (
    <div style={{
      background: "linear-gradient(135deg, #0F2044 0%, #1E3A6E 100%)",
      borderRadius: 16, padding: "28px 32px", color: "white", marginBottom: 24,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Sparkles size={20} />
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AI Course Advisor</h2>
          </div>
          <p style={{ fontSize: 13, opacity: 0.7, margin: 0, maxWidth: 420 }}>
            Personalized insights based on your courses, GPA, and university guidelines
          </p>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, opacity: 0.6, margin: 0 }}>Semester GPA</p>
            <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
              {loading ? "—" : currentGPA.toFixed(2)}
            </p>
          </div>
          <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, opacity: 0.6, margin: 0 }}>Cumulative</p>
            <p style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
              {loading ? "—" : cumulativeGPA.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      {!loading && !error && (
        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          <StatPill icon={<AlertTriangle size={13} />} label="At Risk" value={atRiskCount} color="#FCA5A5" />
          <StatPill icon={<TrendingUp size={13} />} label="Performing" value={performingCount} color="#86EFAC" />
          <StatPill label="Courses" value={COURSES.length} color="rgba(255,255,255,0.6)" />
          <StatPill label="Credits" value={COURSES.reduce((s, c) => s + c.credits, 0)} color="rgba(255,255,255,0.6)" />
        </div>
      )}
    </div>
  );
}

function StatPill({ icon, label, value, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "rgba(255,255,255,0.1)", borderRadius: 20,
      padding: "5px 14px", fontSize: 12,
    }}>
      {icon && <span style={{ color }}>{icon}</span>}
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span style={{ fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
