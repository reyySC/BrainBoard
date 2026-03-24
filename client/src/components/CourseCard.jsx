import { useNavigate } from "react-router-dom";
import { getGradeColor } from "../data/mockData";

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const gradeColor = getGradeColor(course.grade);

  const statusTag = course.alert
    ? { bg: "#FEE2E2", color: "#DC2626", label: course.grade < 65 ? "OVERDUE WORK" : "NEEDS ATTENTION" }
    : course.trend === "up"
    ? { bg: "#DCFCE7", color: "#16A34A", label: "ON TRACK" }
    : { bg: "#DBEAFE", color: "#2563EB", label: "STEADY" };

  return (
    <div
      onClick={() => navigate(`/course/${course.id}`)}
      style={{
        background: "white", borderRadius: 14, border: "1px solid var(--border)",
        padding: "18px 20px", cursor: "pointer", transition: "all .15s",
        display: "flex", flexDirection: "column", gap: 10,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,.1)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: course.color, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{course.name}</div>
          <div style={{ fontSize: 12, color: "var(--slate)" }}>{course.code} · {course.instructor} · {course.credits} credits</div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "var(--slate)" }}>
          <span>Current Grade</span>
          <strong style={{ color: gradeColor }}>{course.grade}% — {course.letter}</strong>
        </div>
        <div style={{ background: "var(--border)", borderRadius: 99, height: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 99, width: `${course.grade}%`, background: gradeColor, transition: "width .5s ease" }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          display: "inline-block", padding: "3px 9px", borderRadius: 6,
          fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
          background: statusTag.bg, color: statusTag.color,
        }}>{statusTag.label}</span>
        <span style={{ fontSize: 12, color: "var(--slate)" }}>
          {course.trend === "up" ? "↑ Trending up" : course.trend === "down" ? "↓ Declining" : "→ Stable"}
        </span>
      </div>
    </div>
  );
}
