import { Sparkles, AlertTriangle, TrendingUp, BookOpen } from "lucide-react";

export default function InsightsBar({ aiData, courses }) {
  if (!aiData) return null;

  const insights = aiData.insights || [];
  const atRiskCount = insights.filter(i => {
    const c = courses.find(cc => cc.code === i.courseCode);
    return c && (c.grade < 70 || c.assignments.some(a => a.status === "missing"));
  }).length;
  const suggestionsCount = (aiData.nextCourses?.length || 0) + (aiData.replaceRecommendations?.length || 0);
  const minorCount = aiData.minorSuggestions?.length || 0;

  return (
    <div style={{
      display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap",
    }}>
      <Chip
        icon={<Sparkles size={13} />}
        label="AI Insights"
        value={insights.length}
        bg="#EFF6FF"
        color="#2563EB"
        border="#BFDBFE"
      />
      {atRiskCount > 0 && (
        <Chip
          icon={<AlertTriangle size={13} />}
          label="At Risk"
          value={atRiskCount}
          bg="#FEF2F2"
          color="#DC2626"
          border="#FECACA"
        />
      )}
      {suggestionsCount > 0 && (
        <Chip
          icon={<TrendingUp size={13} />}
          label="Suggestions"
          value={suggestionsCount}
          bg="#F0FDF4"
          color="#16A34A"
          border="#BBF7D0"
        />
      )}
      {minorCount > 0 && (
        <Chip
          icon={<BookOpen size={13} />}
          label="Minor Options"
          value={minorCount}
          bg="#FAF5FF"
          color="#7C3AED"
          border="#DDD6FE"
        />
      )}
    </div>
  );
}

function Chip({ icon, label, value, bg, color, border }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: bg, border: `1px solid ${border}`,
      borderRadius: 20, padding: "5px 14px", fontSize: 12,
    }}>
      <span style={{ color, display: "flex" }}>{icon}</span>
      <span style={{ color: "#6B7280" }}>{label}</span>
      <span style={{ fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
