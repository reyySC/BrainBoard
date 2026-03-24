import {
  STUDENT, COURSES, SEMESTER_HISTORY, GRADE_HISTORY,
  ACADEMIC_DATES, DEGREE_REQUIREMENTS, COURSE_REPLACEMENTS,
} from "../../../data/mockData";

function pToGPA(pct) {
  if (pct >= 93) return 4.0; if (pct >= 90) return 3.7; if (pct >= 87) return 3.3;
  if (pct >= 83) return 3.0; if (pct >= 80) return 2.7; if (pct >= 77) return 2.3;
  if (pct >= 73) return 2.0; if (pct >= 70) return 1.7; if (pct >= 67) return 1.3;
  if (pct >= 63) return 1.0; return 0.0;
}

export function buildFullStudentData() {
  const totalCr = COURSES.reduce((s, c) => s + c.credits, 0);
  const currentGPA = COURSES.reduce((s, c) => s + pToGPA(c.grade) * c.credits, 0) / totalCr;
  const pastSems = SEMESTER_HISTORY.filter((s) => s.semester !== "Spring 2026");
  const pastCr = pastSems.reduce((s, sem) => s + sem.credits, 0);
  const pastQP = pastSems.reduce((s, sem) => s + sem.gpa * sem.credits, 0);
  const cumGPA = (pastQP + currentGPA * totalCr) / (pastCr + totalCr);

  const courseBlocks = COURSES.map((c) => {
    const history = GRADE_HISTORY[c.id] || [];
    const submitted = c.assignments.filter((a) => a.status === "submitted" || a.status === "graded");
    const missing = c.assignments.filter((a) => a.status === "missing");
    const upcoming = c.assignments.filter((a) => a.status === "upcoming");
    const totalPossible = c.assignments.reduce((s, a) => { const m = a.pts.split("/"); return s + Number(m[1] || 0); }, 0);
    const earned = submitted.reduce((s, a) => { const m = a.pts.split("/"); return s + Number(m[0] || 0); }, 0);
    const missingPts = missing.reduce((s, a) => { const m = a.pts.split("/"); return s + Number(m[1] || 0); }, 0);
    const upcomingPts = upcoming.reduce((s, a) => { const m = a.pts.split("/"); return s + Number(m[1] || 0); }, 0);
    const trend = history.length >= 3 ? history.slice(-3).map((h) => h.grade) : [];
    const trendDir = trend.length === 3 ? (trend[2] - trend[0] > 2 ? "improving" : trend[0] - trend[2] > 2 ? "declining" : "stable") : "unknown";
    const bestCase = totalPossible > 0 ? Math.round(((earned + upcomingPts) / totalPossible) * 100) : 0;
    const worstCase = totalPossible > 0 ? Math.round((earned / totalPossible) * 100) : 0;
    const realistic = totalPossible > 0 ? Math.round(((earned + upcomingPts * 0.75) / totalPossible) * 100) : 0;

    const assignmentLines = c.assignments.map((a) => `    - ${a.name}: ${a.pts} pts, due ${a.due}, status: ${a.status}`).join("\n");

    return `📘 ${c.code} ${c.name} (${c.credits}cr)
  Grade: ${c.grade}% (${c.letter}) | GPA: ${pToGPA(c.grade).toFixed(1)} | Trend: ${trendDir} (${trend.join("→") || "N/A"})
  Instructor: ${c.instructor} | Office Hours: ${c.officeHours}
  ${c.alert ? "⚠️ ALERT: " + c.alertMsg : "No alerts"}
  Points: ${earned} earned / ${totalPossible} total | Missing: ${missing.length} (${missingPts}pts) | Upcoming: ${upcoming.length} (${upcomingPts}pts)
  Projections → Best: ${bestCase}% | Realistic: ${realistic}% | Worst: ${worstCase}%
  Need for C(70%): ${Math.max(0, Math.round(0.7 * totalPossible - earned))}pts | B(80%): ${Math.max(0, Math.round(0.8 * totalPossible - earned))}pts | A(90%): ${Math.max(0, Math.round(0.9 * totalPossible - earned))}pts
  Assignments:\n${assignmentLines}`;
  }).join("\n\n");

  const semHistoryBlock = SEMESTER_HISTORY.map((s) => {
    const base = `${s.semester}: GPA ${s.gpa}, ${s.credits}cr`;
    if (!s.courses) return base;
    const details = s.courses.map((c) => `    - ${c.code} ${c.name}: ${c.grade}% (${c.letter}), ${c.credits}cr`).join("\n");
    return `${base}\n${details}`;
  }).join("\n");

  return `STUDENT: ${STUDENT.name} | ${STUDENT.id} | CS Senior, Meridian University
SEMESTER: ${STUDENT.semester} | Week ${STUDENT.week}/${STUDENT.totalWeeks} | ${STUDENT.daysToFinals} days to finals
CURRENT GPA: ${currentGPA.toFixed(2)} (this semester) | CUMULATIVE: ${cumGPA.toFixed(2)} (${pastCr + totalCr} total credits)
Need ${Math.max(0, ((3.0 * (pastCr + totalCr) - pastQP) / totalCr)).toFixed(2)} semester GPA for 3.0 cumulative

═══ CURRENT COURSES ═══
${courseBlocks}

═══ SEMESTER HISTORY ═══
${semHistoryBlock}

═══ COURSE MANAGEMENT ═══
Drop Deadline: ${ACADEMIC_DATES.dropDeadline} (${ACADEMIC_DATES.dropDaysLeft} days left)
Withdraw Deadline: ${ACADEMIC_DATES.withdrawDeadline} (${ACADEMIC_DATES.withdrawDaysLeft} days left)
Fall Registration: ${ACADEMIC_DATES.fallRegistrationOpen} – ${ACADEMIC_DATES.fallRegistrationClose}

DEGREE PROGRESS:
  Major (${DEGREE_REQUIREMENTS.major.name}): ${DEGREE_REQUIREMENTS.major.completedCredits}/${DEGREE_REQUIREMENTS.major.totalCredits}cr
    Needed: ${DEGREE_REQUIREMENTS.major.required.filter(r => r.status === "needed").map(r => r.code + " " + r.name).join(", ") || "None"}
  Minor (${DEGREE_REQUIREMENTS.minor.name}): ${DEGREE_REQUIREMENTS.minor.completedCredits}/${DEGREE_REQUIREMENTS.minor.totalCredits}cr
    Needed: ${DEGREE_REQUIREMENTS.minor.required.filter(r => r.status === "needed").map(r => r.code + " " + r.name).join(", ") || "None"}
  Gen-Ed (${DEGREE_REQUIREMENTS.genEd.name}): ${DEGREE_REQUIREMENTS.genEd.completedCredits}/${DEGREE_REQUIREMENTS.genEd.totalCredits}cr
    Needed: ${DEGREE_REQUIREMENTS.genEd.required.filter(r => r.status === "needed").map(r => r.code + " " + r.name).join(", ") || "None"}

COURSE REPLACEMENTS:
${Object.entries(COURSE_REPLACEMENTS).map(([id, reps]) => {
  if (reps.length === 0) return `  ${id}: No replacements (core requirement)`;
  return `  ${id}: ${reps.map(r => r.catalogCode + " — " + r.reason).join("; ")}`;
}).join("\n")}`;
}

export function getStudentContext() {
  const courseDetails = COURSES.map((c) => {
    const history = GRADE_HISTORY[c.id];
    const trendStr = history ? history.map((w) => `${w.week}:${w.grade}`).join(", ") : "N/A";
    const assignments = c.assignments.map((a) => `${a.name} (${a.pts}, ${a.status})`).join("; ");
    return `- ${c.code} ${c.name}: ${c.grade}% (${c.letter}), ${c.credits}cr, instructor: ${c.instructor}, trend: ${c.trend}${c.alert ? ", ALERT: " + c.alertMsg : ""}
  Weekly grades: [${trendStr}]
  Assignments: ${assignments}
  Office hours: ${c.officeHours}`;
  }).join("\n");

  const semHistory = SEMESTER_HISTORY.map(
    (s) => `${s.semester}: GPA ${s.gpa}, ${s.credits} credits`
  ).join("; ");

  return `STUDENT PROFILE:
Name: ${STUDENT.name}, ID: ${STUDENT.id}, CS Senior at Meridian University
Semester: ${STUDENT.semester}, Week ${STUDENT.week} of ${STUDENT.totalWeeks}, ${STUDENT.daysToFinals} days to finals

CURRENT COURSES (${STUDENT.semester}):
${courseDetails}

SEMESTER HISTORY: ${semHistory}

KEY CONCERNS:
${COURSES.filter((c) => c.alert).map((c) => `- ${c.code}: ${c.alertMsg}`).join("\n") || "None"}`;
}
