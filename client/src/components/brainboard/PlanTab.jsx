import { useState } from "react";
import { API_BASE } from "./utils/constants";
import { getStudentContext } from "./utils/studentData";

export default function PlanTab() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function generate() {
    setLoading(true);
    setError(null);

    const context = getStudentContext();
    const prompt = `You are BrainBoard, an AI academic advisor. Here is the student's full data:

${context}

Generate a focused, personalized 2-week study plan that addresses their specific weaknesses and upcoming deadlines. Return ONLY valid JSON (no markdown):
{"overview":"2-sentence personalized summary referencing specific courses","week1":{"focus":"specific theme","days":[{"day":"Mon","tasks":["specific task referencing actual assignments"]},{"day":"Tue","tasks":["task"]},{"day":"Wed","tasks":["task1","task2"]},{"day":"Thu","tasks":["task"]},{"day":"Fri","tasks":["task1","task2"]},{"day":"Weekend","tasks":["task1","task2"]}]},"week2":{"focus":"specific theme","days":[{"day":"Mon","tasks":["task1","task2"]},{"day":"Tue","tasks":["task"]},{"day":"Wed","tasks":["task1","task2"]},{"day":"Thu","tasks":["task"]},{"day":"Fri","tasks":["task1","task2"]},{"day":"Weekend","tasks":["task1","task2"]}]}}`;

    try {
      const res = await fetch(`${API_BASE}/study-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.plan) setPlan(data.plan);
      else setError("Failed to generate plan. Try again.");
    } catch {
      setError("Couldn't connect to AI server.");
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 36, animation: "spin 1.5s linear infinite", display: "inline-block" }}>🧠</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Building your personalized plan…</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 42, marginBottom: 12 }}>🗓️</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>Generate Your Study Plan</div>
        <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 20, lineHeight: 1.6 }}>
          BrainBoard will analyze all your grades, assignments, and deadlines to create a personalized 2-week study plan.
        </div>
        {error && <div style={{ color: "#DC2626", fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <button onClick={generate} style={{
          padding: "12px 24px", background: "var(--navy)", color: "white", border: "none",
          borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
        }}>✨ Generate My 2-Week Plan</button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      <div style={{ background: "var(--navy)", color: "white", borderRadius: 10, padding: "12px 14px", fontSize: 12.5, lineHeight: 1.6, marginBottom: 12 }}>{plan.overview}</div>
      {[plan.week1, plan.week2].map((w, wi) => (
        <div key={wi}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--navy)", textTransform: "uppercase", letterSpacing: 0.8, margin: "12px 0 8px" }}>Week {wi + 1} — {w.focus}</div>
          {w.days.map((d, di) => (
            <div key={di} style={{ background: "var(--light)", borderRadius: 10, padding: 12, marginBottom: 8 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{d.day}</h4>
              {d.tasks.map((t, ti) => (
                <div key={ti} style={{ fontSize: 12.5, color: "var(--text)", paddingLeft: 14, position: "relative", marginBottom: 4, lineHeight: 1.5 }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--green)" }}>•</span>{t}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      <button onClick={generate} style={{
        width: "100%", padding: 10, background: "transparent", border: "2px solid var(--navy)",
        color: "var(--navy)", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", marginTop: 4,
      }}>↻ Regenerate</button>
    </div>
  );
}
