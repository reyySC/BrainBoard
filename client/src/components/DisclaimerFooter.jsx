/**
 * DisclaimerFooter — displays a disclaimer that AI suggestions are
 * recommendations only and students should consult their academic advisor.
 *
 * Validates: Requirements 17.3
 */
export default function DisclaimerFooter() {
  return (
    <div style={{
      background: "#F8FAFC",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    }}>
      <span style={{ fontSize: 16 }}>ℹ️</span>
      <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
        AI suggestions are recommendations only and should not replace professional academic advising.
        Please consult your academic advisor before making final decisions about course changes, drops, or degree planning.
      </div>
    </div>
  );
}
