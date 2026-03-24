import { useState } from "react";
import { COURSES, getGradeColor } from "../data/mockData";

function toGPA(pct) {
  if (pct >= 93) return 4.0;
  if (pct >= 90) return 3.7;
  if (pct >= 87) return 3.3;
  if (pct >= 83) return 3.0;
  if (pct >= 80) return 2.7;
  if (pct >= 77) return 2.3;
  if (pct >= 73) return 2.0;
  if (pct >= 70) return 1.7;
  if (pct >= 67) return 1.3;
  if (pct >= 63) return 1.0;
  return 0.0;
}

function toLetter(pct) {
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 67) return "D+";
  if (pct >= 63) return "D";
  return "F";
}

function GradeRingEditable({ grade, color, size = 100 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (grade / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={10} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.4s ease" }} />
    </svg>
  );
}

function CourseWhatIfCard({ course, value, onChange }) {
  const diff = value - course.grade;
  const color = getGradeColor(value);
  const letter = toLetter(value);

  return (
    <div style={{
      background: "white", borderRadius: 16, border: "1px solid var(--border)",
      padding: "20px", display: "flex", flexDirection: "column", alignItems: "center",
      gap: 12, position: "relative", overflow: "hidden",
    }}>
      {/* Course color accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: course.color }} />

      {/* Course info */}
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: course.color }}>{course.code}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", lineHeight: 1.3 }}>{course.name}</div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{course.credits} credits · {course.instructor}</div>
      </div>

      {/* Grade ring with letter inside */}
      <div style={{ position: "relative", width: 90, height: 90 }}>
        <GradeRingEditable grade={value} color={color} size={90} />
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{letter}</div>
        </div>
      </div>

      {/* Slider + input row */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>0</span>
        <input
          type="range" min="0" max="100" value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            flex: 1, height: 6, accentColor: color, cursor: "pointer",
          }}
          aria-label={`Grade slider for ${course.name}`}
        />
        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>100</span>
        <input
          type="number" min="0" max="100" value={value}
          onChange={(e) => onChange(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
          style={{
            width: 46, height: 30, border: "1px solid var(--border)", borderRadius: 8,
            textAlign: "center", fontSize: 13, fontWeight: 700, color,
            outline: "none", fontFamily: "'DM Sans', sans-serif",
            background: "var(--light)",
          }}
        />
      </div>

      {/* Diff from current */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>Current: {course.grade}%</span>
        {diff !== 0 && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
            background: diff > 0 ? "#DCFCE7" : "#FEE2E2",
            color: diff > 0 ? "#16A34A" : "#DC2626",
          }}>
            {diff > 0 ? "+" : ""}{diff}
          </span>
        )}
      </div>
    </div>
  );
}

export default function WhatIf() {
  const init = {};
  COURSES.forEach((c) => { init[c.id] = c.grade; });
  const [overrides, setOverrides] = useState(init);

  function handleChange(id, val) {
    setOverrides((prev) => ({ ...prev, [id]: val }));
  }

  function resetAll() {
    const r = {};
    COURSES.forEach((c) => { r[c.id] = c.grade; });
    setOverrides(r);
  }

  const totalCredits = COURSES.reduce((s, c) => s + c.credits, 0);
  const currentGPA = COURSES.reduce((s, c) => s + toGPA(c.grade) * c.credits, 0) / totalCredits;
  const whatIfGPA = COURSES.reduce((s, c) => s + toGPA(overrides[c.id]) * c.credits, 0) / totalCredits;
  const gpaDiff = whatIfGPA - currentGPA;
  const hasChanges = COURSES.some((c) => overrides[c.id] !== c.grade);

  return (
    <div className="fade-in">
      {/* GPA Comparison Bar */}
      <div style={{
        background: "linear-gradient(135deg, #0F2044, #1E4B8F)", borderRadius: 16,
        padding: "22px 28px", color: "white", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
      }}>
        <GPAStat label="Current GPA" value={currentGPA.toFixed(2)} />
        <span style={{ fontSize: 22, opacity: 0.4 }}>→</span>
        <GPAStat label="What-If GPA" value={whatIfGPA.toFixed(2)} highlight />
        {gpaDiff !== 0 && (
          <span style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
            background: gpaDiff > 0 ? "rgba(22,163,74,.25)" : "rgba(220,38,38,.25)",
            color: gpaDiff > 0 ? "#86EFAC" : "#FCA5A5",
          }}>
            {gpaDiff > 0 ? "+" : ""}{gpaDiff.toFixed(2)}
          </span>
        )}
        <div style={{ marginLeft: "auto" }}>
          {hasChanges && (
            <button onClick={resetAll} style={{
              background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)",
              color: "white", padding: "8px 18px", borderRadius: 10, fontSize: 12,
              fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>↺ Reset All</button>
          )}
        </div>
      </div>

      {/* Tip */}
      <div style={{
        background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12,
        padding: "12px 16px", marginBottom: 20, fontSize: 12.5, color: "#92400E",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        💡 Drag the slider or type a grade to see how it affects your GPA in real time.
      </div>

      {/* Course Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {COURSES.map((c) => (
          <CourseWhatIfCard
            key={c.id}
            course={c}
            value={overrides[c.id]}
            onChange={(val) => handleChange(c.id, val)}
          />
        ))}
      </div>
    </div>
  );
}

function GPAStat({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, opacity: 0.5 }}>{label}</div>
      <div style={{
        fontSize: 32, fontWeight: 800, lineHeight: 1.1,
        color: highlight ? "#D4A017" : "white",
      }}>{value}</div>
    </div>
  );
}
