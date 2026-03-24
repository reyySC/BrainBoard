import CourseRow from "./CourseRow";

export default function CourseList({ courses, aiData, getRisk, onViewCourse, onViewInsights }) {
  // Sort: at-risk first, then stable, then performing
  const riskOrder = { "at-risk": 0, "stable": 1, "performing": 2 };

  const rows = courses.map(c => ({
    ...c,
    risk: getRisk(c.id),
  }));

  rows.sort((a, b) => (riskOrder[a.risk] ?? 1) - (riskOrder[b.risk] ?? 1));

  return (
    <div style={{
      background: "white", border: "1px solid #E5E7EB",
      borderRadius: 14, overflow: "hidden",
    }}>
      {/* Table Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2.5fr 0.8fr 0.8fr 0.8fr 0.7fr 1.4fr",
        padding: "10px 24px", borderBottom: "1px solid #E5E7EB",
        background: "#F9FAFB", gap: 16,
      }}>
        {["Course", "Grade", "Trend", "Status", "Details", "Actions"].map((h, i) => (
          <span key={h} style={{
            fontSize: 10, fontWeight: 500, color: "#6B7280",
            textTransform: "uppercase", letterSpacing: "0.05em",
            textAlign: i === 5 ? "right" : "left",
          }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      {rows.map(course => {
        const aiInsight = aiData?.insights?.find(i => i.courseCode === course.code);
        return (
          <CourseRow
            key={course.id}
            course={course}
            risk={course.risk}
            aiInsight={aiInsight}
            onViewCourse={onViewCourse}
            onViewInsights={onViewInsights}
          />
        );
      })}
    </div>
  );
}
