/**
 * NeedsAttentionSection — displays top 2–3 urgent issues ordered by severity.
 *
 * Props:
 *   items: AttentionItem[] | null   (null = loading → show skeletons)
 *   onAction: (courseId: string) => void
 *
 * AttentionItem shape:
 *   { courseCode, issue, actionLabel, courseId, severity: 'red' | 'amber' }
 */

const SKELETON_KEYFRAMES = `
@keyframes skeletonPulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
`;

const severityStyles = {
  red: {
    bg: "#FEF2F2",
    border: "#FECACA",
    dot: "#DC2626",
    codeColor: "#DC2626",
    textColor: "#991B1B",
    btnBg: "#DC2626",
  },
  amber: {
    bg: "#FFFBEB",
    border: "#FDE68A",
    dot: "#D97706",
    codeColor: "#D97706",
    textColor: "#92400E",
    btnBg: "#D97706",
  },
};

function SkeletonAttention() {
  return (
    <div style={{
      background: "#F1F5F9",
      border: "1px solid #E2E8F0",
      borderRadius: 14,
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", background: "#E2E8F0",
        animation: "skeletonPulse 1.5s ease-in-out infinite", flexShrink: 0,
      }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          width: "30%", height: 12, borderRadius: 6, background: "#E2E8F0",
          animation: "skeletonPulse 1.5s ease-in-out infinite",
        }} />
        <div style={{
          width: "60%", height: 10, borderRadius: 6, background: "#E2E8F0",
          animation: "skeletonPulse 1.5s ease-in-out infinite",
        }} />
      </div>
      <div style={{
        width: 70, height: 28, borderRadius: 10, background: "#E2E8F0",
        animation: "skeletonPulse 1.5s ease-in-out infinite", flexShrink: 0,
      }} />
    </div>
  );
}

export default function NeedsAttentionSection({ items, onAction }) {
  // Loading state — show 2 skeleton placeholders
  if (items === null || items === undefined) {
    return (
      <>
        <style>{SKELETON_KEYFRAMES}</style>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SkeletonAttention />
          <SkeletonAttention />
        </div>
      </>
    );
  }

  // Nothing to show
  if (items.length === 0) {
    return (
      <div style={{
        background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 14,
        padding: "14px 20px", fontSize: 13, color: "#16A34A", textAlign: "center",
      }}>
        ✅ No urgent issues — you're on track!
      </div>
    );
  }

  // Sort by severity: red first, then amber
  const sorted = [...items].sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "red" ? -1 : 1;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {sorted.map((item, idx) => {
        const s = severityStyles[item.severity] || severityStyles.red;
        return (
          <div key={item.courseId + "-" + idx} style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: 14,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.codeColor, marginRight: 8 }}>
                {item.courseCode}
              </span>
              <span style={{ fontSize: 12, color: s.textColor }}>
                {item.issue}
              </span>
            </div>
            <button
              onClick={() => onAction(item.courseId)}
              style={{
                background: s.btnBg,
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "6px 14px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {item.actionLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
}
