import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";

const statusConfig = {
  "at-risk":    { label: "At Risk", bg: "#FEE2E2", color: "#DC2626" },
  "stable":     { label: "Watch",   bg: "#FEF9C3", color: "#92400E" },
  "performing": { label: "Good",    bg: "#DCFCE7", color: "#16A34A" },
};

const trendConfig = {
  down:   { icon: TrendingDown, label: "Declining", color: "#EF4444" },
  up:     { icon: TrendingUp,   label: "Improving", color: "#16A34A" },
  stable: { icon: Minus,        label: "Stable",    color: "#9CA3AF" },
};

export default function CourseRow({ course, risk, aiInsight, onViewCourse, onViewInsights }) {
  const status = statusConfig[risk] || statusConfig.stable;
  const trend = trendConfig[course.trend] || trendConfig.stable;
  const TrendIcon = trend.icon;
  const missingCount = course.assignments.filter(a => a.status === "missing").length;
  const upcomingCount = course.assignments.filter(a => a.status === "upcoming").length;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "2.5fr 0.8fr 0.8fr 0.8fr 0.7fr 1.4fr",
      alignItems: "center", padding: "18px 24px",
      borderBottom: "1px solid #F3F4F6", gap: 16,
      transition: "background .15s",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Course info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{course.code}</span>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>·</span>
          <span style={{ fontSize: 13, color: "#4B5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {course.name}
          </span>
        </div>
        <p style={{ fontSize: 11, color: "#9CA3AF", margin: "4px 0 0" }}>
          {course.instructor} · {course.credits} cr · {course.officeHours}
        </p>
        {aiInsight && (
          <p style={{ fontSize: 11, color: "#2563EB", margin: "6px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
            <Sparkles size={11} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{aiInsight.title}</span>
          </p>
        )}
      </div>

      {/* Grade */}
      <div>
        <span style={{
          fontSize: 18, fontWeight: 700,
          color: course.grade >= 85 ? "#111827" : course.grade >= 70 ? "#D97706" : "#DC2626",
        }}>{course.grade}%</span>
        <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 4 }}>({course.letter})</span>
      </div>

      {/* Trend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: trend.color }}>
        <TrendIcon size={14} />
        <span style={{ fontSize: 11, fontWeight: 500 }}>{trend.label}</span>
      </div>

      {/* Status */}
      <div>
        <span style={{
          display: "inline-block", padding: "4px 10px", borderRadius: 20,
          fontSize: 11, fontWeight: 500, background: status.bg, color: status.color,
        }}>{status.label}</span>
      </div>

      {/* Details */}
      <div style={{ fontSize: 11, color: "#6B7280" }}>
        {missingCount > 0 && <p style={{ color: "#EF4444", fontWeight: 500, margin: 0 }}>{missingCount} missing</p>}
        {upcomingCount > 0 && <p style={{ margin: "2px 0 0" }}>{upcomingCount} upcoming</p>}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button
          onClick={() => onViewCourse?.(course)}
          style={{
            border: "1px solid #E5E7EB", background: "white", color: "#4B5563",
            fontSize: 11, fontWeight: 500, padding: "6px 12px", borderRadius: 6,
            cursor: "pointer",
          }}
        >View</button>
        <button
          onClick={() => onViewInsights?.(course)}
          style={{
            border: "none", background: "#2563EB", color: "white",
            fontSize: 11, fontWeight: 500, padding: "6px 12px", borderRadius: 6,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <Sparkles size={11} /> AI Insights
        </button>
      </div>
    </div>
  );
}
