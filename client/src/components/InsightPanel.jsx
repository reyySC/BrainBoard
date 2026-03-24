/* ── InsightPanel & InsightCard ──
   Displays 2–4 prioritized LLM-generated insights.
   Shows skeleton placeholders while loading, error state with retry on failure.
   All insight text is LLM-generated — nothing hardcoded.
*/

/* ── SkeletonInsight placeholder ── */
function SkeletonInsight() {
  return (
    <div style={{
      background: "white", borderRadius: 16, border: "1px solid var(--border)",
      padding: "22px 24px",
    }}>
      <div style={{
        width: "40%", height: 14, borderRadius: 8, background: "#E2E8F0",
        animation: "skeletonPulse 1.5s ease-in-out infinite", marginBottom: 12,
      }} />
      <div style={{
        width: "90%", height: 12, borderRadius: 8, background: "#E2E8F0",
        animation: "skeletonPulse 1.5s ease-in-out infinite", marginBottom: 10,
      }} />
      <div style={{
        width: "60%", height: 12, borderRadius: 8, background: "#E2E8F0",
        animation: "skeletonPulse 1.5s ease-in-out infinite",
      }} />
    </div>
  );
}

/* ── Confidence indicator ── */
const confidenceStyles = {
  high:   { bg: "#DCFCE7", color: "#16A34A", label: "High confidence" },
  medium: { bg: "#FEF9C3", color: "#92400E", label: "Medium confidence" },
  low:    { bg: "#FEE2E2", color: "#DC2626", label: "Low confidence" },
};

/* ── InsightCard ── */
function InsightCard({ insight }) {
  const conf = confidenceStyles[insight.confidenceScore] || confidenceStyles.medium;

  return (
    <div style={{
      background: "linear-gradient(135deg, #F8FAFC, #EFF6FF)",
      borderRadius: 16, border: "1px solid var(--border)",
      padding: "22px 24px", display: "flex", gap: 12,
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{insight.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
          {insight.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--slate)", lineHeight: 1.5, marginBottom: 8 }}>
          {insight.description}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {insight.courseCode && (
            <span style={{
              display: "inline-block", fontSize: 10, fontWeight: 700,
              color: "var(--blue)", background: "#DBEAFE", padding: "2px 8px", borderRadius: 6,
            }}>
              {insight.courseCode}
            </span>
          )}
          <span style={{
            display: "inline-block", fontSize: 10, fontWeight: 600,
            color: conf.color, background: conf.bg, padding: "2px 8px", borderRadius: 6,
          }}>
            {conf.label}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── InsightPanel ── */
export default function InsightPanel({ insights, error, onRetry }) {
  const isLoading = insights === null && !error;

  // Loading state — 2 skeleton cards in a 2-column grid
  if (isLoading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <SkeletonInsight />
        <SkeletonInsight />
      </div>
    );
  }

  // Error state with no insights — show retry
  if (error && (!insights || insights.length === 0)) {
    return (
      <div style={{
        background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14,
        padding: "20px 24px", textAlign: "center",
      }}>
        <div style={{ fontSize: 22, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#991B1B", marginBottom: 4 }}>
          Could not load AI insights
        </div>
        <div style={{ fontSize: 12, color: "#B91C1C", marginBottom: 12 }}>
          {typeof error === "string" ? error : "Something went wrong. Please try again."}
        </div>
        <button
          onClick={onRetry}
          style={{
            background: "#DC2626", color: "white", border: "none", borderRadius: 10,
            padding: "8px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ↻ Retry
        </button>
      </div>
    );
  }

  // No insights available (empty array, no error)
  if (!insights || insights.length === 0) {
    return (
      <div style={{
        background: "white", borderRadius: 16, border: "1px solid var(--border)",
        padding: "22px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13,
      }}>
        No AI insights available at this time.
      </div>
    );
  }

  // Render 2–4 InsightCards in a 2-column grid
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {insights.slice(0, 4).map((insight, i) => (
        <InsightCard key={i} insight={insight} />
      ))}
    </div>
  );
}
