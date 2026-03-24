import { useState } from "react";
import { COURSES, SEMESTER_HISTORY, getGradeColor, percentToGPA } from "../data/mockData";

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

function GradeRingEditable({ grade, color, size = 90 }) {
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
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: course.color }} />
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: course.color }}>{course.code}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", lineHeight: 1.3 }}>{course.name}</div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{course.credits} credits · {course.instructor}</div>
      </div>
      <div style={{ position: "relative", width: 90, height: 90 }}>
        <GradeRingEditable grade={value} color={color} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{letter}</div>
        </div>
      </div>
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>0</span>
        <input type="range" min="0" max="100" value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, height: 6, accentColor: color, cursor: "pointer" }}
          aria-label={`Grade slider for ${course.name}`} />
        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>100</span>
        <input type="number" min="0" max="100" value={value}
          onChange={(e) => onChange(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
          style={{ width: 46, height: 30, border: "1px solid var(--border)", borderRadius: 8,
            textAlign: "center", fontSize: 13, fontWeight: 700, color,
            outline: "none", fontFamily: "'DM Sans', sans-serif", background: "var(--light)" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>Current: {course.grade}%</span>
        {diff !== 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
            background: diff > 0 ? "#DCFCE7" : "#FEE2E2", color: diff > 0 ? "#16A34A" : "#DC2626",
          }}>{diff > 0 ? "+" : ""}{diff}</span>
        )}
      </div>
    </div>
  );
}

export default function Grades() {
  const [tab, setTab] = useState("current");

  // Current semester what-if state
  const init = {};
  COURSES.forEach((c) => { init[c.id] = c.grade; });
  const [overrides, setOverrides] = useState(init);
  const [showWhatIf, setShowWhatIf] = useState(false);

  const totalCredits = COURSES.reduce((s, c) => s + c.credits, 0);
  const weightedAvg = COURSES.reduce((s, c) => s + c.grade * c.credits, 0) / totalCredits;
  const currentGPA = COURSES.reduce((s, c) => s + percentToGPA(c.grade) * c.credits, 0) / totalCredits;
  const whatIfGPA = COURSES.reduce((s, c) => s + percentToGPA(overrides[c.id]) * c.credits, 0) / totalCredits;
  const gpaDiff = whatIfGPA - currentGPA;
  const hasChanges = COURSES.some((c) => overrides[c.id] !== c.grade);

  // Cumulative calculations (past semesters excluding current Spring 2026)
  const pastSemesters = SEMESTER_HISTORY.filter((s) => s.semester !== "Spring 2026");
  const pastCredits = pastSemesters.reduce((s, sem) => s + sem.credits, 0);
  const pastQualityPts = pastSemesters.reduce((s, sem) => s + sem.gpa * sem.credits, 0);

  // Cumulative with actual current grades
  const cumCredits = pastCredits + totalCredits;
  const currentCumGPA = (pastQualityPts + currentGPA * totalCredits) / cumCredits;
  // Cumulative with what-if grades
  const whatIfCumGPA = (pastQualityPts + whatIfGPA * totalCredits) / cumCredits;
  const cumDiff = whatIfCumGPA - currentCumGPA;

  function handleChange(id, val) {
    setOverrides((prev) => ({ ...prev, [id]: val }));
  }
  function resetAll() {
    const r = {};
    COURSES.forEach((c) => { r[c.id] = c.grade; });
    setOverrides(r);
  }

  const gradePill = (letter) => {
    const map = { A: { bg: "#DCFCE7", color: "#16A34A" }, B: { bg: "#DBEAFE", color: "#2563EB" }, C: { bg: "#FEF9C3", color: "#92400E" }, D: { bg: "#FEE2E2", color: "#DC2626" } };
    return map[letter] || map.D;
  };

  const tabStyle = (active) => ({
    padding: "10px 24px", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
    border: "none", borderBottom: active ? "3px solid var(--navy)" : "3px solid transparent",
    background: "none", color: active ? "var(--navy)" : "var(--muted)",
    fontFamily: "'DM Sans', sans-serif", transition: "all .15s",
  });

  return (
    <div className="fade-in">
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
        <button onClick={() => setTab("current")} style={tabStyle(tab === "current")}>📚 Current Semester</button>
        <button onClick={() => setTab("overall")} style={tabStyle(tab === "overall")}>🎓 Overall</button>
      </div>

      {tab === "current" && <CurrentSemesterTab
        courses={COURSES} totalCredits={totalCredits} weightedAvg={weightedAvg}
        currentGPA={currentGPA} whatIfGPA={whatIfGPA} gpaDiff={gpaDiff}
        hasChanges={hasChanges} overrides={overrides} showWhatIf={showWhatIf}
        setShowWhatIf={setShowWhatIf} handleChange={handleChange} resetAll={resetAll}
        gradePill={gradePill}
      />}

      {tab === "overall" && <OverallTab
        pastSemesters={pastSemesters} currentGPA={currentGPA} currentCumGPA={currentCumGPA}
        whatIfCumGPA={whatIfCumGPA} cumDiff={cumDiff} hasChanges={hasChanges}
        overrides={overrides} showWhatIf={showWhatIf} setShowWhatIf={setShowWhatIf}
        handleChange={handleChange} resetAll={resetAll} totalCredits={totalCredits}
        cumCredits={cumCredits}
      />}
    </div>
  );
}

function CurrentSemesterTab({ courses, totalCredits, weightedAvg, currentGPA, whatIfGPA, gpaDiff,
  hasChanges, overrides, showWhatIf, setShowWhatIf, handleChange, resetAll, gradePill }) {
  return (
    <>
      {/* Grade Summary Table */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "22px 24px", marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>📊 Semester Grade Summary</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Course", "Instructor", "Credits", "Current %", "Letter", "GPA Points"].map((h) => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textAlign: "left", padding: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => {
              const pill = gradePill(c.letter);
              return (
                <tr key={c.id}>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}><strong>{c.code} – {c.name}</strong></td>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>{c.instructor}</td>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>{c.credits}</td>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}><strong style={{ color: getGradeColor(c.grade) }}>{c.grade}%</strong></td>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: pill.bg, color: pill.color }}>{c.letter}</span>
                  </td>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>{percentToGPA(c.grade).toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <StatBox label="Current GPA" value={currentGPA.toFixed(2)} sub="Spring 2026" color={currentGPA >= 3.0 ? "#16A34A" : "#DC2626"} />
        <StatBox label="Total Credits" value={String(totalCredits)} sub="This semester" />
        <StatBox label="Avg Score" value={`${weightedAvg.toFixed(0)}%`} sub="Weighted average" />
      </div>

      {/* What-If */}
      <WhatIfSection semester showWhatIf={showWhatIf} setShowWhatIf={setShowWhatIf}
        currentGPA={currentGPA} whatIfGPA={whatIfGPA} gpaDiff={gpaDiff}
        hasChanges={hasChanges} overrides={overrides} handleChange={handleChange}
        resetAll={resetAll} label="Semester" />
    </>
  );
}

function OverallTab({ pastSemesters, currentGPA, currentCumGPA, whatIfCumGPA, cumDiff,
  hasChanges, overrides, showWhatIf, setShowWhatIf, handleChange, resetAll, totalCredits, cumCredits }) {
  const [expanded, setExpanded] = useState(null);

  function toggle(semester) {
    setExpanded(expanded === semester ? null : semester);
  }

  return (
    <>
      {/* Cumulative Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <StatBox label="Cumulative GPA" value={currentCumGPA.toFixed(2)} sub={`${cumCredits} total credits`} color={currentCumGPA >= 3.0 ? "#16A34A" : "#DC2626"} />
        <StatBox label="Current Semester" value={currentGPA.toFixed(2)} sub={`Spring 2026 · ${totalCredits} credits`} color={currentGPA >= 3.0 ? "#16A34A" : "#DC2626"} />
        <StatBox label="Standing" value={currentCumGPA >= 2.0 ? "Good" : "Probation"} sub={currentCumGPA >= 2.0 ? "Meets requirements" : "Below 2.0 threshold"} color={currentCumGPA >= 2.0 ? "#16A34A" : "#DC2626"} />
      </div>

      {/* Semester History */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: 8 }}>🎓 Semester History</div>
        </div>

        {pastSemesters.map((sem) => {
          const isOpen = expanded === sem.semester;
          const hasCourses = sem.courses && sem.courses.length > 0;
          return (
            <div key={sem.semester}>
              <div
                onClick={() => hasCourses && toggle(sem.semester)}
                style={{
                  padding: "14px 24px", borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 16,
                  cursor: hasCourses ? "pointer" : "default",
                  background: isOpen ? "#F8FAFC" : "white",
                  transition: "background .15s",
                }}
              >
                {hasCourses && <span style={{ fontSize: 11, color: "var(--muted)", width: 14 }}>{isOpen ? "▼" : "▶"}</span>}
                <strong style={{ fontSize: 13.5, flex: 1 }}>{sem.semester}</strong>
                <strong style={{ fontSize: 13.5, color: sem.gpa >= 3.0 ? "#16A34A" : sem.gpa >= 2.0 ? "#D97706" : "#DC2626", width: 50 }}>{sem.gpa.toFixed(2)}</strong>
                <span style={{ fontSize: 13, color: "var(--slate)", width: 70 }}>{sem.credits} credits</span>
                <span style={{
                  display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: sem.gpa >= 2.0 ? "#DCFCE7" : "#FEE2E2", color: sem.gpa >= 2.0 ? "#16A34A" : "#DC2626",
                }}>{sem.gpa >= 2.0 ? "GOOD" : "PROBATION"}</span>
              </div>

              {isOpen && hasCourses && (
                <div style={{ background: "#F8FAFC", borderBottom: "1px solid var(--border)", padding: "0 24px 16px" }}>
                  {/* Semester stats mini row */}
                  <div style={{ display: "flex", gap: 16, padding: "12px 0 14px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                    <MiniStat label="Semester GPA" value={sem.gpa.toFixed(2)} color={sem.gpa >= 3.0 ? "#16A34A" : "#D97706"} />
                    <MiniStat label="Courses" value={String(sem.courses.length)} />
                    <MiniStat label="Credits" value={String(sem.credits)} />
                    <MiniStat label="Avg Grade" value={`${Math.round(sem.courses.reduce((s, c) => s + c.grade, 0) / sem.courses.length)}%`} />
                  </div>
                  {/* Course list */}
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Course", "Instructor", "Credits", "Grade", "Letter"].map((h) => (
                          <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textAlign: "left", padding: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sem.courses.map((c, i) => (
                        <tr key={i}>
                          <td style={{ padding: "8px 0", fontSize: 13, borderBottom: i < sem.courses.length - 1 ? "1px solid #E2E8F0" : "none" }}>
                            <strong>{c.code}</strong> <span style={{ color: "var(--slate)" }}>– {c.name}</span>
                          </td>
                          <td style={{ padding: "8px 0", fontSize: 13, color: "var(--slate)", borderBottom: i < sem.courses.length - 1 ? "1px solid #E2E8F0" : "none" }}>{c.instructor}</td>
                          <td style={{ padding: "8px 0", fontSize: 13, borderBottom: i < sem.courses.length - 1 ? "1px solid #E2E8F0" : "none" }}>{c.credits}</td>
                          <td style={{ padding: "8px 0", fontSize: 13, borderBottom: i < sem.courses.length - 1 ? "1px solid #E2E8F0" : "none" }}>
                            <strong style={{ color: getGradeColor(c.grade) }}>{c.grade}%</strong>
                          </td>
                          <td style={{ padding: "8px 0", borderBottom: i < sem.courses.length - 1 ? "1px solid #E2E8F0" : "none" }}>
                            <span style={{
                              display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                              background: c.grade >= 90 ? "#DCFCE7" : c.grade >= 80 ? "#DBEAFE" : c.grade >= 70 ? "#FEF9C3" : "#FEE2E2",
                              color: c.grade >= 90 ? "#16A34A" : c.grade >= 80 ? "#2563EB" : c.grade >= 70 ? "#92400E" : "#DC2626",
                            }}>{c.letter}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {/* Current semester row - expandable */}
        <div>
          <div
            onClick={() => toggle("Spring 2026")}
            style={{
              padding: "14px 24px", display: "flex", alignItems: "center", gap: 16,
              background: expanded === "Spring 2026" ? "#E8F0FE" : "#F0F7FF",
              cursor: "pointer", transition: "background .15s",
            }}
          >
            <span style={{ fontSize: 11, color: "var(--muted)", width: 14 }}>{expanded === "Spring 2026" ? "▼" : "▶"}</span>
            <strong style={{ fontSize: 13.5, flex: 1 }}>Spring 2026 <span style={{ fontSize: 10, color: "var(--blue)", fontWeight: 700, marginLeft: 6 }}>CURRENT</span></strong>
            <strong style={{ fontSize: 13.5, color: currentGPA >= 3.0 ? "#16A34A" : currentGPA >= 2.0 ? "#D97706" : "#DC2626", width: 50 }}>{currentGPA.toFixed(2)}</strong>
            <span style={{ fontSize: 13, color: "var(--slate)", width: 70 }}>{totalCredits} credits</span>
            <span style={{
              display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700,
              background: "#DBEAFE", color: "#2563EB",
            }}>IN PROGRESS</span>
          </div>

          {expanded === "Spring 2026" && (
            <div style={{ background: "#F0F7FF", borderTop: "1px solid var(--border)", padding: "0 24px 16px" }}>
              <div style={{ display: "flex", gap: 16, padding: "12px 0 14px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
                <MiniStat label="Projected GPA" value={currentGPA.toFixed(2)} color={currentGPA >= 3.0 ? "#16A34A" : "#D97706"} />
                <MiniStat label="Courses" value={String(COURSES.length)} />
                <MiniStat label="Credits" value={String(totalCredits)} />
                <MiniStat label="Avg Grade" value={`${Math.round(COURSES.reduce((s, c) => s + c.grade, 0) / COURSES.length)}%`} />
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Course", "Instructor", "Credits", "Grade", "Letter", "Status"].map((h) => (
                      <th key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textAlign: "left", padding: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COURSES.map((c, i) => (
                    <tr key={c.id}>
                      <td style={{ padding: "8px 0", fontSize: 13, borderBottom: i < COURSES.length - 1 ? "1px solid #DBEAFE" : "none" }}>
                        <strong>{c.code}</strong> <span style={{ color: "var(--slate)" }}>– {c.name}</span>
                      </td>
                      <td style={{ padding: "8px 0", fontSize: 13, color: "var(--slate)", borderBottom: i < COURSES.length - 1 ? "1px solid #DBEAFE" : "none" }}>{c.instructor}</td>
                      <td style={{ padding: "8px 0", fontSize: 13, borderBottom: i < COURSES.length - 1 ? "1px solid #DBEAFE" : "none" }}>{c.credits}</td>
                      <td style={{ padding: "8px 0", fontSize: 13, borderBottom: i < COURSES.length - 1 ? "1px solid #DBEAFE" : "none" }}>
                        <strong style={{ color: getGradeColor(c.grade) }}>{c.grade}%</strong>
                      </td>
                      <td style={{ padding: "8px 0", borderBottom: i < COURSES.length - 1 ? "1px solid #DBEAFE" : "none" }}>
                        <span style={{
                          display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                          background: c.grade >= 90 ? "#DCFCE7" : c.grade >= 80 ? "#DBEAFE" : c.grade >= 70 ? "#FEF9C3" : "#FEE2E2",
                          color: c.grade >= 90 ? "#16A34A" : c.grade >= 80 ? "#2563EB" : c.grade >= 70 ? "#92400E" : "#DC2626",
                        }}>{c.letter}</span>
                      </td>
                      <td style={{ padding: "8px 0", borderBottom: i < COURSES.length - 1 ? "1px solid #DBEAFE" : "none" }}>
                        {c.alert ? (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#FEE2E2", color: "#DC2626" }}>⚠ AT RISK</span>
                        ) : c.trend === "up" ? (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#DCFCE7", color: "#16A34A" }}>↑ IMPROVING</span>
                        ) : (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "#F1F5F9", color: "#64748B" }}>— STABLE</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* What-If for cumulative */}
      <WhatIfSection showWhatIf={showWhatIf} setShowWhatIf={setShowWhatIf}
        currentGPA={currentCumGPA} whatIfGPA={whatIfCumGPA} gpaDiff={cumDiff}
        hasChanges={hasChanges} overrides={overrides} handleChange={handleChange}
        resetAll={resetAll} label="Cumulative" />
    </>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: color || "var(--navy)", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function WhatIfSection({ showWhatIf, setShowWhatIf, currentGPA, whatIfGPA, gpaDiff,
  hasChanges, overrides, handleChange, resetAll, label }) {
  return (
    <>
      <button onClick={() => setShowWhatIf(!showWhatIf)} style={{
        width: "100%", background: showWhatIf ? "var(--navy)" : "white",
        border: "1px solid var(--border)", borderRadius: 14, padding: "16px 22px",
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", marginBottom: showWhatIf ? 20 : 0,
        transition: "all .2s",
      }}>
        <span style={{ fontSize: 18 }}>🎯</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: showWhatIf ? "white" : "var(--navy)", flex: 1, textAlign: "left" }}>
          What-If Grade Calculator
        </span>
        <span style={{ fontSize: 12, color: showWhatIf ? "rgba(255,255,255,.6)" : "var(--muted)" }}>
          {showWhatIf ? "▲ Collapse" : "▼ Expand"}
        </span>
      </button>

      {showWhatIf && (
        <div style={{ animation: "fadeIn .25s ease" }}>
          <div style={{
            background: "linear-gradient(135deg, #0F2044, #1E4B8F)", borderRadius: 16,
            padding: "22px 28px", color: "white", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
          }}>
            <GPAStat label={`Current ${label} GPA`} value={currentGPA.toFixed(2)} />
            <span style={{ fontSize: 22, opacity: 0.4 }}>→</span>
            <GPAStat label={`What-If ${label} GPA`} value={whatIfGPA.toFixed(2)} highlight />
            {gpaDiff !== 0 && (
              <span style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                background: gpaDiff > 0 ? "rgba(22,163,74,.25)" : "rgba(220,38,38,.25)",
                color: gpaDiff > 0 ? "#86EFAC" : "#FCA5A5",
              }}>{gpaDiff > 0 ? "+" : ""}{gpaDiff.toFixed(2)}</span>
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

          <div style={{
            background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12,
            padding: "12px 16px", marginBottom: 20, fontSize: 12.5, color: "#92400E",
            display: "flex", alignItems: "center", gap: 8,
          }}>💡 Drag the slider or type a grade to see how it affects your {label.toLowerCase()} GPA in real time.</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {COURSES.map((c) => (
              <CourseWhatIfCard key={c.id} course={c} value={overrides[c.id]}
                onChange={(val) => handleChange(c.id, val)} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StatBox({ label, value, sub, color }) {
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--border)", padding: "18px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || "var(--navy)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function GPAStat({ label, value, highlight }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, opacity: 0.5 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1, color: highlight ? "#D4A017" : "white" }}>{value}</div>
    </div>
  );
}
