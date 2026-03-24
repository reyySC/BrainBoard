import { useState, useEffect } from "react";
import { API_BASE } from "./utils/constants";
import { getStudentContext } from "./utils/studentData";

export default function AlertsTab() {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { if (!alerts) generateAlerts(); }, []);

  async function generateAlerts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentContext: getStudentContext() }),
      });
      const data = await res.json();
      if (data.alerts) setAlerts(data.alerts);
      else setError("Failed to analyze grades.");
    } catch {
      setError("Couldn't connect to AI server.");
    }
    setLoading(false);
  }

  const icons = { red: "🔴", amber: "🟡", green: "🟢" };
  const borders = { red: "#DC2626", amber: "#F59E0B", green: "#16A34A" };

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 36, animation: "spin 1.5s linear infinite", display: "inline-block" }}>🧠</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Analyzing your academic risks…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 13, color: "#DC2626", marginBottom: 12 }}>{error}</div>
        <button onClick={generateAlerts} style={{
          padding: "10px 20px", background: "var(--navy)", color: "white", border: "none",
          borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>↻ Retry</button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginBottom: 4 }}>AI-generated based on your current grades & trends</div>
      {alerts && alerts.map((a, i) => (
        <div key={i} style={{ background: "var(--light)", borderRadius: 10, padding: "12px 14px", borderLeft: `4px solid ${borders[a.level] || "#64748B"}` }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginBottom: 3 }}>{icons[a.level] || "ℹ️"} {a.title}</h4>
          <p style={{ fontSize: 12, color: "var(--slate)", lineHeight: 1.5, margin: 0 }}>{a.msg}</p>
        </div>
      ))}
      <button onClick={generateAlerts} style={{
        width: "100%", padding: 8, background: "transparent", border: "1.5px solid var(--border)",
        color: "var(--navy)", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", marginTop: 4,
      }}>↻ Refresh Alerts</button>
    </div>
  );
}
