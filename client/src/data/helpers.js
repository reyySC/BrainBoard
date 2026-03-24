export function getGradeColor(grade) {
  if (grade >= 90) return "#16A34A";
  if (grade >= 80) return "#2563EB";
  if (grade >= 70) return "#D97706";
  return "#DC2626";
}

export function getLetterGPA(letter) {
  const map = { "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0 };
  return map[letter] || 0;
}

export function percentToGPA(pct) {
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

export const STATUS_STYLES = {
  submitted: { bg: "#DCFCE7", color: "#16A34A", label: "SUBMITTED" },
  graded: { bg: "#DBEAFE", color: "#2563EB", label: "GRADED" },
  missing: { bg: "#FEE2E2", color: "#DC2626", label: "MISSING" },
  upcoming: { bg: "#FEF9C3", color: "#92400E", label: "UPCOMING" },
  overdue: { bg: "#FEE2E2", color: "#DC2626", label: "OVERDUE" },
};
