/**
 * KeyDatesSection — displays academic deadlines with severity-colored items
 * and days-left countdown badges.
 *
 * Props:
 *   dates: Array<{ icon: string, label: string, date: string, daysLeft: number, severity: 'red'|'amber'|'blue'|'green'|'muted' }>
 *
 * Validates: Requirements 13.4
 */

const severityMap = {
  red: { bg: "#FEE2E2", color: "#DC2626", border: "#FECACA" },
  amber: { bg: "#FEF9C3", color: "#92400E", border: "#FDE68A" },
  blue: { bg: "#DBEAFE", color: "#2563EB", border: "#BFDBFE" },
  green: { bg: "#DCFCE7", color: "#16A34A", border: "#BBF7D0" },
  muted: { bg: "#F1F5F9", color: "#64748B", border: "#E2E8F0" },
};

export default function KeyDatesSection({ dates = [] }) {
  if (dates.length === 0) return null;

  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      border: "1px solid var(--border)",
      padding: "22px 24px",
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {dates.map((d, i) => {
          const s = severityMap[d.severity] || severityMap.muted;
          return (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 18px",
              borderRadius: 12,
              border: `1px solid ${s.border}`,
              background: s.bg,
            }}>
              <span style={{ fontSize: 22 }}>{d.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
                  {d.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--slate)" }}>
                  {d.date}
                </div>
              </div>
              <div style={{
                background: "white",
                borderRadius: 10,
                padding: "6px 14px",
                textAlign: "center",
                border: `1px solid ${s.border}`,
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {d.daysLeft}
                </div>
                <div style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                }}>
                  days left
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
