import { getGradeColor } from "../data/mockData";

/* ── Risk group metadata ── */
const riskMeta = {
  "at-risk": { label: "At Risk", bg: "#FEE2E2", color: "#DC2626", border: "#FECACA", icon: "🔴" },
  "stable": { label: "Stable", bg: "#FEF9C3", color: "#92400E", border: "#FDE68A", icon: "🟡" },
  "performing": { label: "Performing Well", bg: "#DCFCE7", color: "#16A34A", border: "#BBF7D0", icon: "🟢" },
};

const confidenceMeta = {
  high: { color: "#16A34A", bg: "#DCFCE7", label: "High confidence" },
  medium: { color: "#D97706", bg: "#FEF3C7", label: "Medium confidence" },
  low: { color: "#DC2626", bg: "#FEE2E2", label: "Low confidence" },
};

const card = {
  background: "white", borderRadius: 16, border: "1px solid var(--border)",
  padding: "22px 24px", marginBottom: 20,
};

const statusColors = {
  submitted: { bg: "#DCFCE7", color: "#16A34A" },
  graded: { bg: "#DBEAFE", color: "#2563EB" },
  missing: { bg: "#FEE2E2", color: "#DC2626" },
  upcoming: { bg: "#FEF9C3", color: "#92400E" },
};

/* ── Skeleton block (matches ManageCourses skeleton) ── */
function SkeletonBlock({ width = "100%", height = 16, borderRadius = 8, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius, background: "#E2E8F0",
      animation: "skeletonPulse 1.5s ease-in-out infinite",
      ...style,
    }} />
  );
}

/* ── Parse reasoning into Problem / Impact / Recommended Action segments ── */
function parseReasoning(reasoning) {
  if (!reasoning || typeof reasoning !== "string") return null;
  const problemMatch = reasoning.match(/Problem:\s*(.*?)(?=Impact:|$)/si);
  const impactMatch = reasoning.match(/Impact:\s*(.*?)(?=Recommended Action:|$)/si);
  const actionMatch = reasoning.match(/Recommended Action:\s*(.*)/si);
  if (problemMatch && impactMatch && actionMatch) {
    return {
      problem: problemMatch[1].trim(),
      impact: impactMatch[1].trim(),
      action: actionMatch[1].trim(),
    };
  }
  return null;
}

/* ── Confidence score badge ── */
function ConfidenceBadge({ score }) {
  if (!score) return null;
  const meta = confidenceMeta[score] || confidenceMeta.medium;
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, color: meta.color, background: meta.bg,
      padding: "2px 6px", borderRadius: 4, flexShrink: 0,
    }}>
      {score === "low" ? "ℹ️ " : ""}{meta.label}
    </span>
  );
}

/* ── Reasoning display (parsed or single block) ── */
function ReasoningDisplay({ reasoning, isLowConfidence }) {
  const parsed = parseReasoning(reasoning);
  const mutedStyle = isLowConfidence ? { opacity: 0.7, fontStyle: "italic" } : {};

  if (parsed) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, ...mutedStyle }}>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#DC2626", background: "#FEE2E2",
            padding: "1px 5px", borderRadius: 3, flexShrink: 0, marginTop: 1,
          }}>Problem</span>
          <span style={{ fontSize: 11, color: "#92400E", lineHeight: 1.4 }}>{parsed.problem}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#D97706", background: "#FEF3C7",
            padding: "1px 5px", borderRadius: 3, flexShrink: 0, marginTop: 1,
          }}>Impact</span>
          <span style={{ fontSize: 11, color: "#92400E", lineHeight: 1.4 }}>{parsed.impact}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: "#16A34A", background: "#DCFCE7",
            padding: "1px 5px", borderRadius: 3, flexShrink: 0, marginTop: 1,
          }}>Action</span>
          <span style={{ fontSize: 11, color: "#92400E", lineHeight: 1.4 }}>{parsed.action}</span>
        </div>
      </div>
    );
  }

  // Single block fallback
  return (
    <span style={{ fontSize: 11, color: "#92400E", lineHeight: 1.4, ...mutedStyle }}>
      {reasoning}
    </span>
  );
}


/* ── AI Suggestion Area ── */
function AISuggestionArea({ course, aiData, loading }) {
  if (loading) {
    return (
      <div style={{ marginTop: 4 }}>
        <SkeletonBlock width="70%" height={12} />
        <SkeletonBlock width="50%" height={12} style={{ marginTop: 6 }} />
      </div>
    );
  }

  if (!aiData) return null;

  // Find drop recommendation for this course
  const dropRec = aiData.dropRecommendations?.find(r => r.courseCode === course.code);
  // Find replace recommendation for this course
  const replaceRec = aiData.replaceRecommendations?.find(r => r.currentCourseCode === course.code);

  if (!dropRec && !replaceRec) return null;

  const isLowConfidence = (rec) => rec?.confidenceScore === "low";

  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Drop recommendation */}
      {dropRec && (
        <div style={{
          background: isLowConfidence(dropRec) ? "#F8FAFC" : "#FFFBEB",
          border: `1px solid ${isLowConfidence(dropRec) ? "#E2E8F0" : "#FDE68A"}`,
          borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#92400E",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#D97706",
              background: "#FEF3C7", padding: "1px 6px", borderRadius: 4, flexShrink: 0,
            }}>AI Recommendation</span>
            <ConfidenceBadge score={dropRec.confidenceScore} />
            {dropRec.projectedGPAWith != null && dropRec.projectedGPAWithout != null && (
              <span style={{
                fontSize: 9, color: "var(--muted)", background: "var(--light)",
                padding: "1px 6px", borderRadius: 4,
              }}>
                GPA: {dropRec.projectedGPAWith.toFixed(2)} → {dropRec.projectedGPAWithout.toFixed(2)} without
              </span>
            )}
          </div>
          <ReasoningDisplay reasoning={dropRec.reasoning} isLowConfidence={isLowConfidence(dropRec)} />
        </div>
      )}

      {/* Replace recommendation */}
      {replaceRec && (
        <div style={{
          background: isLowConfidence(replaceRec) ? "#F8FAFC" : "#EFF6FF",
          border: `1px solid ${isLowConfidence(replaceRec) ? "#E2E8F0" : "#BFDBFE"}`,
          borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#1E40AF",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#D97706",
              background: "#FEF3C7", padding: "1px 6px", borderRadius: 4, flexShrink: 0,
            }}>AI Recommendation</span>
            <ConfidenceBadge score={replaceRec.confidenceScore} />
            <span style={{
              fontSize: 9, color: "#2563EB", background: "#DBEAFE",
              padding: "1px 6px", borderRadius: 4,
            }}>
              Replace with {replaceRec.replacementCode}
            </span>
            {replaceRec.expectedGPABenefit != null && (
              <span style={{
                fontSize: 9, color: "#16A34A", background: "#DCFCE7",
                padding: "1px 6px", borderRadius: 4,
              }}>
                +{replaceRec.expectedGPABenefit.toFixed(2)} GPA benefit
              </span>
            )}
          </div>
          <ReasoningDisplay reasoning={replaceRec.reasoning} isLowConfidence={isLowConfidence(replaceRec)} />
        </div>
      )}
    </div>
  );
}

/* ── ActionCard — a single course card ── */
function ActionCard({ course, riskLevel, aiData, loading, isExpanded, onToggle, onNavigate }) {
  const meta = riskMeta[riskLevel];
  const trendIcon = course.trend === "up" ? "📈" : course.trend === "down" ? "📉" : "➡️";
  const trendColor = course.trend === "up" ? "#16A34A" : course.trend === "down" ? "#DC2626" : "#64748B";

  // Determine action buttons based on risk
  let buttons = [];
  if (riskLevel === "at-risk") {
    buttons = [
      { label: "🔧 Fix This Course", primary: true },
      { label: "📋 View Recovery Plan", primary: false },
    ];
  } else if (riskLevel === "stable") {
    buttons = [{ label: "📈 Improve Grade", primary: true }];
  } else {
    buttons = [
      { label: "✨ Keep It Up", primary: false },
      { label: "📘 View Course", primary: true },
    ];
  }

  return (
    <div style={{
      ...card, position: "relative", overflow: "hidden", cursor: "pointer",
    }} onClick={onToggle}>
      {/* Top color bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4, background: course.color,
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginTop: 4 }}>
        {/* Left — course info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: course.color }}>{course.code}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{course.name}</span>
            <span style={{
              display: "inline-block", padding: "2px 8px", borderRadius: 12,
              fontSize: 10, fontWeight: 700, background: meta.bg, color: meta.color,
            }}>
              {meta.label.toUpperCase()}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 10 }}>
            {course.instructor} · {course.credits} credits
          </div>

          {/* Grade + trend */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <div>
              <span style={{ fontSize: 26, fontWeight: 800, color: getGradeColor(course.grade) }}>
                {course.grade}%
              </span>
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>{course.letter}</span>
            </div>
            <span style={{ fontSize: 12, color: trendColor, fontWeight: 600 }}>
              {trendIcon} {course.trend}
            </span>
          </div>

          {/* AI suggestion area */}
          <AISuggestionArea course={course} aiData={aiData} loading={loading} />
        </div>

        {/* Right — action buttons */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 8, minWidth: 140,
        }} onClick={e => e.stopPropagation()}>
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={() => onNavigate(course.id)}
              style={{
                background: btn.primary ? "var(--navy)" : "var(--light)",
                color: btn.primary ? "white" : "var(--navy)",
                border: btn.primary ? "none" : "1px solid var(--border)",
                borderRadius: 10, padding: "8px 14px", fontSize: 12,
                fontWeight: 700, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", textAlign: "center",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded assignment details */}
      {isExpanded && (
        <div style={{
          marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)",
        }}>
          <div style={{
            fontSize: 11, color: "var(--muted)", marginBottom: 6, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            Assignments
          </div>
          {course.assignments.map((a, i) => {
            const sc = statusColors[a.status] || statusColors.upcoming;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "6px 0",
                borderBottom: i < course.assignments.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <span style={{ fontSize: 12, color: "var(--slate)", flex: 1 }}>{a.name}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{a.pts}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{a.due}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                  background: sc.bg, color: sc.color,
                }}>
                  {a.status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── CourseGroupSection — renders all three risk groups ── */
export default function CourseGroupSection({ grouped, aiData, loading, expandedCards, onToggleCard, onNavigate }) {
  return (
    <div>
      {["at-risk", "stable", "performing"].map(riskLevel => {
        const courses = grouped[riskLevel];
        if (!courses || courses.length === 0) return null;
        const meta = riskMeta[riskLevel];
        return (
          <div key={riskLevel} style={{ marginBottom: 20 }}>
            {/* Group header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
              padding: "8px 14px", background: meta.bg, borderRadius: 10,
              border: `1px solid ${meta.border}`,
            }}>
              <span style={{ fontSize: 14 }}>{meta.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: meta.color }}>
                {meta.label}
              </span>
              <span style={{ fontSize: 11, color: meta.color, opacity: 0.7 }}>
                ({courses.length} {courses.length === 1 ? "course" : "courses"})
              </span>
            </div>

            {/* Course cards */}
            {courses.map(c => (
              <ActionCard
                key={c.id}
                course={c}
                riskLevel={riskLevel}
                aiData={aiData}
                loading={loading}
                isExpanded={!!expandedCards[c.id]}
                onToggle={() => onToggleCard(c.id)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
