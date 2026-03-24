/**
 * ErrorBanner — Displays when AI is unavailable with a retry button.
 * Static course data with deterministic risk classifications remains visible underneath.
 *
 * Props:
 *   error: string — error message to display
 *   onRetry: () => void — callback to re-trigger the advisor API call
 *
 * Validates: Requirements 13.2, 13.3, 17.4
 */
export default function ErrorBanner({ error, onRetry }) {
  return (
    <div style={{
      background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14,
      padding: "16px 22px", marginBottom: 20, display: "flex",
      alignItems: "center", gap: 12,
    }}>
      <span style={{ fontSize: 20 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#991B1B", marginBottom: 2 }}>
          AI insights are temporarily unavailable
        </div>
        <div style={{ fontSize: 12, color: "#B91C1C" }}>
          {error || "Could not connect to the AI advisor. Showing deterministic analysis only."}
        </div>
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
