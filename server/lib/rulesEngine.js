// ── Deterministic Rules Engine ──

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

export function classifyRisk(course) {
  const hasMissing = course.assignments.some(a => a.status === 'missing');
  if (course.grade < 70 || hasMissing) return 'at-risk';
  if (course.grade >= 85) return 'performing';
  return 'stable';
}

export function summarizeAssignments(course) {
  const submitted = course.assignments.filter(a => a.status === 'submitted' || a.status === 'graded');
  const missing = course.assignments.filter(a => a.status === 'missing');
  const upcoming = course.assignments.filter(a => a.status === 'upcoming');
  const earned = submitted.reduce((s, a) => s + Number(a.pts.split('/')[0] || 0), 0);
  const totalPossible = course.assignments.reduce((s, a) => s + Number(a.pts.split('/')[1] || 0), 0);
  return {
    earned,
    totalPossible,
    missingCount: missing.length,
    missingPoints: missing.reduce((s, a) => s + Number(a.pts.split('/')[1] || 0), 0),
    upcomingCount: upcoming.length,
    upcomingPoints: upcoming.reduce((s, a) => s + Number(a.pts.split('/')[1] || 0), 0),
  };
}

export function computeGPAProjections(courses, semesterHistory) {
  const totalCredits = courses.reduce((s, c) => s + c.credits, 0);
  const weightedSum = courses.reduce((s, c) => s + percentToGPA(c.grade) * c.credits, 0);
  const currentSemesterGPA = totalCredits > 0 ? Math.round((weightedSum / totalCredits) * 100) / 100 : 0;

  let cumCredits = 0;
  let cumWeighted = 0;
  for (const sem of semesterHistory) {
    if (sem.courses) {
      for (const c of sem.courses) {
        cumCredits += c.credits;
        cumWeighted += percentToGPA(c.grade) * c.credits;
      }
    }
  }
  cumCredits += totalCredits;
  cumWeighted += weightedSum;
  const cumulativeGPA = cumCredits > 0 ? Math.round((cumWeighted / cumCredits) * 100) / 100 : 0;

  const projectedWithout = {};
  for (const course of courses) {
    const cumCreditsWithout = cumCredits - course.credits;
    const cumWeightedWithout = cumWeighted - percentToGPA(course.grade) * course.credits;
    const cumGPAWithout = cumCreditsWithout > 0 ? cumWeightedWithout / cumCreditsWithout : 0;
    projectedWithout[course.id] = Math.round(cumGPAWithout * 100) / 100;
  }

  return { currentSemesterGPA, cumulativeGPA, projectedWithout };
}

export function computeDeadlineFlags(academicDates) {
  const dropDaysLeft = academicDates.dropDaysLeft != null ? academicDates.dropDaysLeft : 0;
  const withdrawDaysLeft = academicDates.withdrawDaysLeft != null ? academicDates.withdrawDaysLeft : 0;
  return {
    dropDeadlinePassed: dropDaysLeft <= 0,
    withdrawDeadlinePassed: withdrawDaysLeft <= 0,
    dropDaysLeft,
    withdrawDaysLeft,
  };
}

export function checkPrerequisites(degreeRequirements, completedCourses) {
  const completedSet = new Set(completedCourses);
  const result = {};
  const sections = ['major', 'minor', 'genEd'];
  for (const section of sections) {
    const req = degreeRequirements[section];
    if (!req || !req.required) continue;
    for (const course of req.required) {
      if (result[course.code] !== undefined) continue;
      result[course.code] = completedSet.has(course.code) || course.status === 'done';
    }
  }
  return result;
}

export function computeFeasibility(courseCatalog, currentCourses) {
  const seatAvailability = {};
  for (const cat of courseCatalog) {
    seatAvailability[cat.code] = cat.seats;
  }

  const scheduleConflicts = [];
  const parseSchedule = (schedStr) => {
    if (!schedStr) return [];
    const match = schedStr.match(/^([A-Za-z]+)\s+(.+)$/);
    if (!match) return [];
    const daysStr = match[1];
    const timeStr = match[2];

    const days = [];
    let i = 0;
    while (i < daysStr.length) {
      if (i + 1 < daysStr.length && daysStr[i] === 'T' && daysStr[i + 1] === 'h') {
        days.push('Th');
        i += 2;
      } else {
        days.push(daysStr[i]);
        i++;
      }
    }

    const timeParts = timeStr.split(/[–-]/);
    if (timeParts.length !== 2) return [];

    const parseTime = (t, fallbackPeriod) => {
      t = t.trim();
      let period = fallbackPeriod;
      if (t.toLowerCase().includes('pm')) { period = 'pm'; t = t.replace(/pm/i, '').trim(); }
      else if (t.toLowerCase().includes('am')) { period = 'am'; t = t.replace(/am/i, '').trim(); }
      const parts = t.split(':');
      let hours = parseInt(parts[0], 10);
      const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const endRaw = timeParts[1].trim();
    const endPeriod = endRaw.toLowerCase().includes('pm') ? 'pm' : 'am';
    const endMin = parseTime(timeParts[1], endPeriod);
    const startMin = parseTime(timeParts[0], endPeriod);
    return days.map(d => ({ day: d, start: startMin, end: endMin }));
  };

  const allCourses = [...courseCatalog, ...(currentCourses || [])];
  const parsed = allCourses.map(c => ({ code: c.code, slots: parseSchedule(c.schedule) }));

  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      const a = parsed[i];
      const b = parsed[j];
      let conflicts = false;
      for (const sa of a.slots) {
        for (const sb of b.slots) {
          if (sa.day === sb.day && sa.start < sb.end && sb.start < sa.end) {
            conflicts = true;
            break;
          }
        }
        if (conflicts) break;
      }
      if (conflicts) scheduleConflicts.push([a.code, b.code]);
    }
  }

  const maxAchievableGrades = {};
  if (currentCourses) {
    for (const course of currentCourses) {
      const summary = summarizeAssignments(course);
      const maxPoints = summary.earned + summary.missingPoints + summary.upcomingPoints;
      const maxPercent = summary.totalPossible > 0
        ? Math.round((maxPoints / summary.totalPossible) * 100) : 0;
      maxAchievableGrades[course.id] = maxPercent;
    }
  }

  return { seatAvailability, scheduleConflicts, maxAchievableGrades };
}
