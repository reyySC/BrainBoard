import { useState } from "react";
import { STUDENT, COURSES, SEMESTER_HISTORY, GRADE_HISTORY, getGradeColor, percentToGPA } from "../data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Profile() {
  const [expanded, setExpanded] = useState(false);
  const totalCredits = COURSES.reduce((s, c) => s + c.credits, 0);
  const currentGPA = COURSES.reduce((s, c) => s + percentToGPA(c.grade) * c.credits, 0) / totalCredits;
  const cumulativeCredits = SEMESTER_HISTORY.reduce((s, sem) => s + sem.credits, 0);
  const cumulativeGPA = SEMESTER_HISTORY.reduce((s, sem) => s + sem.gpa * sem.credits, 0) / cumulativeCredits;

  // Build combined trend data for all courses
  const trendData = GRADE_HISTORY.cs301.map((_, i) => ({
    week: GRADE_HISTORY.cs301[i].week,
    "CS 301": GRADE_HISTORY.cs301[i].grade,
    "CS 355": GRADE_HISTORY.cs355[i].grade,
    "CS 420": GRADE_HISTORY.cs420[i].grade,
    "ENG 310": GRADE_HISTORY.eng310[i].grade,
  }));

  return (
    <div className="fade-in">
      {/* Profile Header — clickable to expand */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "linear-gradient(135deg, #0F2044, #1E4B8F)", borderRadius: 16,
          color: "white", marginBottom: 24, cursor: "pointer",
          overflow: "hidden", transition: "all .3s ease",
        }}
      >
        {/* Top row — always visible */}
        <div style={{
          padding: "28px 30px", display: "flex", alignItems: "center", gap: 20,
        }}>
          <img src="/avatar.png" alt={STUDENT.name} style={{
            width: expanded ? 100 : 72, height: expanded ? 100 : 72,
            borderRadius: "50%", objectFit: "cover", flexShrink: 0,
            border: expanded ? "3px solid rgba(255,255,255,.3)" : "none",
            transition: "all .3s ease",
          }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: expanded ? 28 : 24, margin: 0, transition: "font-size .3s" }}>{STUDENT.name}</h2>
            <p style={{ fontSize: 13, opacity: 0.7, margin: "4px 0 0" }}>
              {STUDENT.major} {STUDENT.year} · ID #{STUDENT.id} · Meridian University
            </p>
            {!expanded && (
              <p style={{ fontSize: 11, opacity: 0.4, margin: "6px 0 0" }}>Click to view full profile ▾</p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, opacity: 0.5, textTransform: "uppercase", letterSpacing: 1 }}>Cumulative GPA</div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{cumulativeGPA.toFixed(2)}</div>
          </div>
        </div>

        {/* Expanded details — white card below blue band */}
        <div style={{
          maxHeight: expanded ? 400 : 0,
          opacity: expanded ? 1 : 0,
          transition: "max-height .4s ease, opacity .3s ease",
          overflow: "hidden",
          background: "white",
          borderRadius: "0 0 16px 16px",
        }}>
          <div style={{ padding: "20px 30px 24px" }}>
            {/* Bio */}
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--slate)", margin: "0 0 20px", maxWidth: 600 }}>
              {STUDENT.bio}
            </p>

            {/* Details grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px 30px" }}>
              <DetailItem label="Date of Birth" value={STUDENT.dob} />
              <DetailItem label="Year" value={STUDENT.year} />
              <DetailItem label="Pronouns" value={STUDENT.pronouns} />
              <DetailItem label="Major" value={STUDENT.major} />
              <DetailItem label="Minor" value={STUDENT.minor} />
              <DetailItem label="Student ID" value={`#${STUDENT.id}`} />
              <DetailItem label="Email" value={STUDENT.email} />
              <DetailItem label="Phone" value={STUDENT.phone} />
              <DetailItem label="Semester" value={`${STUDENT.semester} · Week ${STUDENT.week}/${STUDENT.totalWeeks}`} />
            </div>

            <p style={{ fontSize: 11, color: "var(--muted)", margin: "16px 0 0", textAlign: "center", cursor: "pointer" }}>Click to collapse ▴</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <StatBox label="Current Semester" value={currentGPA.toFixed(2)} sub="Spring 2026 GPA" color={currentGPA >= 3.0 ? "#16A34A" : "#DC2626"} />
        <StatBox label="Cumulative GPA" value={cumulativeGPA.toFixed(2)} sub={`${cumulativeCredits} total credits`} />
        <StatBox label="Academic Standing" value={cumulativeGPA >= 2.0 ? "Good" : "Probation"} sub={cumulativeGPA >= 2.0 ? "Meets requirements" : "Below 2.0 threshold"} color={cumulativeGPA >= 2.0 ? "#16A34A" : "#DC2626"} />
        <StatBox label="Expected Grad" value="May '27" sub="4 semesters remaining" />
      </div>

      {/* Grade Trend Chart */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "22px 24px", marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>📈 Grade Trends – Spring 2026</div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#94A3B8" }} />
            <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: "#94A3B8" }} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="CS 301" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="CS 355" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="CS 420" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="ENG 310" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Semester History */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid var(--border)", padding: "22px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>🎓 Semester History</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Semester", "GPA", "Credits", "Standing"].map((h) => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textAlign: "left", padding: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SEMESTER_HISTORY.map((sem, i) => (
              <tr key={i}>
                <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}><strong>{sem.semester}</strong></td>
                <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>
                  <strong style={{ color: getGradeColor(sem.gpa * 25) }}>{sem.gpa.toFixed(2)}</strong>
                </td>
                <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>{sem.credits}</td>
                <td style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{
                    display: "inline-block", padding: "3px 9px", borderRadius: 6,
                    fontSize: 11, fontWeight: 700,
                    background: sem.gpa >= 2.0 ? "#DCFCE7" : "#FEE2E2",
                    color: sem.gpa >= 2.0 ? "#16A34A" : "#DC2626",
                  }}>{sem.gpa >= 2.0 ? "GOOD STANDING" : "PROBATION"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color }) {
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--border)", padding: "18px 20px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || "var(--navy)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{value}</div>
    </div>
  );
}
