import { AlertTriangle, Sparkles } from "lucide-react";

export default function PrimaryActionCard({ insight, course, dropRec, academicDates }) {
  if (!insight || !course) return null;

  const isAtRisk = course.grade < 70 || course.assignments.some(a => a.status === "missing");

  return (
    <div style={{
      background: isAtRisk ? "#FEF2F2" : "#F0F9FF",
      border: `1px solid ${isAtRisk ? "#FECACA" : "#BAE6FD"}`,
      borderRadius: 14, padding: 20, marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: isAtRisk ? "#FEE2E2" : "#DBEAFE",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {isAtRisk
            ? <AlertTriangle size={18} color="#DC2626" />
            : <Sparkles size={18} color="#2563EB" />
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {isAtRisk && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: "#DC2626",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>At Risk</span>
            )}
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{insight.courseCode}</span>
            <span style={{ fontSize: 14, color: "#6B7280" }}>· {course.name}</span>
          </div>
          <p style={{ fontSize: 13, color: "#374151", margin: "4px 0 0", lineHeight: 1.5 }}>
            {insight.title}
          </p>
          <p style={{ fontSize: 12, color: "#6B7280", margin: "4px 0 0", lineHeight: 1.5 }}>
            {insight.description}
          </p>

          {dropRec && (
            <div style={{
              marginTop: 12, background: "rgba(255,255,255,0.7)",
              border: "1px solid #FEE2E2", borderRadius: 8, padding: "10px 12px",
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: 0 }}>
                {dropRec.recommend ? "💡 Consider dropping" : "📌 Keep and improve"}
              </p>
              <p style={{ fontSize: 11, color: "#6B7280", margin: "4px 0 0" }}>{dropRec.reasoning}</p>
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11 }}>
                <span style={{ color: "#6B7280" }}>
                  GPA if kept: <strong style={{ color: "#111827" }}>{dropRec.projectedGPAWith?.toFixed(2)}</strong>
                </span>
                <span style={{ color: "#6B7280" }}>
                  GPA if dropped: <strong style={{ color: "#15803D" }}>{dropRec.projectedGPAWithout?.toFixed(2)}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
        <span style={{
          fontSize: 22, fontWeight: 800, flexShrink: 0,
          color: course.grade < 70 ? "#DC2626" : course.grade < 85 ? "#D97706" : "#16A34A",
        }}>{course.grade}%</span>
      </div>
    </div>
  );
}
