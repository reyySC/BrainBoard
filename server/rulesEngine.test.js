import { describe, it, expect } from 'vitest';
import {
  percentToGPA,
  classifyRisk,
  summarizeAssignments,
  computeGPAProjections,
  computeDeadlineFlags,
  checkPrerequisites,
  computeFeasibility,
} from './server.js';

// ── percentToGPA ──
// Validates: Requirements 14.2
describe('percentToGPA', () => {
  it('returns 4.0 for 93+', () => {
    expect(percentToGPA(93)).toBe(4.0);
    expect(percentToGPA(100)).toBe(4.0);
  });

  it('returns 3.7 for 90–92', () => {
    expect(percentToGPA(90)).toBe(3.7);
    expect(percentToGPA(92)).toBe(3.7);
  });

  it('returns 3.3 for 87–89', () => {
    expect(percentToGPA(87)).toBe(3.3);
  });

  it('returns 3.0 for 83–86', () => {
    expect(percentToGPA(83)).toBe(3.0);
    expect(percentToGPA(86)).toBe(3.0);
  });

  it('returns 2.7 for 80–82', () => {
    expect(percentToGPA(80)).toBe(2.7);
  });

  it('returns 2.3 for 77–79', () => {
    expect(percentToGPA(77)).toBe(2.3);
  });

  it('returns 2.0 for 73–76', () => {
    expect(percentToGPA(73)).toBe(2.0);
  });

  it('returns 1.7 for 70–72', () => {
    expect(percentToGPA(70)).toBe(1.7);
  });

  it('returns 1.3 for 67–69', () => {
    expect(percentToGPA(67)).toBe(1.3);
  });

  it('returns 1.0 for 63–66', () => {
    expect(percentToGPA(63)).toBe(1.0);
  });

  it('returns 0.0 for below 63', () => {
    expect(percentToGPA(62)).toBe(0.0);
    expect(percentToGPA(0)).toBe(0.0);
  });
});

// ── classifyRisk ──
// Validates: Requirements 14.1
describe('classifyRisk', () => {
  it('returns "at-risk" when grade < 70', () => {
    const course = { grade: 69, assignments: [] };
    expect(classifyRisk(course)).toBe('at-risk');
  });

  it('returns "stable" when grade is exactly 70 with no missing', () => {
    const course = { grade: 70, assignments: [{ status: 'submitted' }] };
    expect(classifyRisk(course)).toBe('stable');
  });

  it('returns "stable" when grade is 84 with no missing', () => {
    const course = { grade: 84, assignments: [{ status: 'graded' }] };
    expect(classifyRisk(course)).toBe('stable');
  });

  it('returns "performing" when grade is 85+', () => {
    const course = { grade: 85, assignments: [{ status: 'submitted' }] };
    expect(classifyRisk(course)).toBe('performing');
  });

  it('returns "performing" when grade is 100', () => {
    const course = { grade: 100, assignments: [] };
    expect(classifyRisk(course)).toBe('performing');
  });

  it('returns "at-risk" when any assignment is missing regardless of grade', () => {
    const course = { grade: 95, assignments: [{ status: 'missing' }] };
    expect(classifyRisk(course)).toBe('at-risk');
  });

  it('returns "at-risk" when grade is high but has a missing assignment among others', () => {
    const course = {
      grade: 90,
      assignments: [
        { status: 'submitted' },
        { status: 'missing' },
        { status: 'upcoming' },
      ],
    };
    expect(classifyRisk(course)).toBe('at-risk');
  });
});


// ── computeDeadlineFlags ──
// Validates: Requirements 14.3
describe('computeDeadlineFlags', () => {
  it('marks deadlines as not passed when days remaining are positive', () => {
    const result = computeDeadlineFlags({ dropDaysLeft: 12, withdrawDaysLeft: 27 });
    expect(result.dropDeadlinePassed).toBe(false);
    expect(result.withdrawDeadlinePassed).toBe(false);
    expect(result.dropDaysLeft).toBe(12);
    expect(result.withdrawDaysLeft).toBe(27);
  });

  it('marks deadlines as passed when days remaining are 0', () => {
    const result = computeDeadlineFlags({ dropDaysLeft: 0, withdrawDaysLeft: 0 });
    expect(result.dropDeadlinePassed).toBe(true);
    expect(result.withdrawDeadlinePassed).toBe(true);
  });

  it('marks deadlines as passed when days remaining are negative', () => {
    const result = computeDeadlineFlags({ dropDaysLeft: -5, withdrawDaysLeft: -1 });
    expect(result.dropDeadlinePassed).toBe(true);
    expect(result.withdrawDeadlinePassed).toBe(true);
    expect(result.dropDaysLeft).toBe(-5);
    expect(result.withdrawDaysLeft).toBe(-1);
  });

  it('defaults to 0 (passed) when days fields are null', () => {
    const result = computeDeadlineFlags({ dropDaysLeft: null, withdrawDaysLeft: null });
    expect(result.dropDeadlinePassed).toBe(true);
    expect(result.withdrawDeadlinePassed).toBe(true);
    expect(result.dropDaysLeft).toBe(0);
    expect(result.withdrawDaysLeft).toBe(0);
  });

  it('handles mixed: drop passed, withdraw not passed', () => {
    const result = computeDeadlineFlags({ dropDaysLeft: -2, withdrawDaysLeft: 10 });
    expect(result.dropDeadlinePassed).toBe(true);
    expect(result.withdrawDeadlinePassed).toBe(false);
  });
});

// ── summarizeAssignments ──
// Validates: Requirements 14.2
describe('summarizeAssignments', () => {
  it('summarizes a course with mixed assignment statuses', () => {
    const course = {
      assignments: [
        { name: 'HW1', pts: '30/30', status: 'submitted' },
        { name: 'HW2', pts: '27/30', status: 'submitted' },
        { name: 'HW3', pts: '20/30', status: 'graded' },
        { name: 'HW4', pts: '0/30', status: 'missing' },
        { name: 'Quiz 1', pts: '18/20', status: 'submitted' },
        { name: 'Quiz 2', pts: '0/20', status: 'missing' },
        { name: 'Quiz 3', pts: '—/20', status: 'upcoming' },
        { name: 'Midterm', pts: '—/100', status: 'upcoming' },
      ],
    };
    const result = summarizeAssignments(course);
    // earned: 30 + 27 + 20 + 18 = 95 (submitted + graded)
    expect(result.earned).toBe(95);
    // totalPossible: 30+30+30+30+20+20+20+100 = 280
    expect(result.totalPossible).toBe(280);
    expect(result.missingCount).toBe(2);
    // missingPoints: 30 + 20 = 50
    expect(result.missingPoints).toBe(50);
    expect(result.upcomingCount).toBe(2);
    // upcomingPoints: 20 + 100 = 120
    expect(result.upcomingPoints).toBe(120);
  });

  it('handles a course with no missing or upcoming assignments', () => {
    const course = {
      assignments: [
        { name: 'HW1', pts: '48/50', status: 'submitted' },
        { name: 'HW2', pts: '45/50', status: 'submitted' },
      ],
    };
    const result = summarizeAssignments(course);
    expect(result.earned).toBe(93);
    expect(result.totalPossible).toBe(100);
    expect(result.missingCount).toBe(0);
    expect(result.missingPoints).toBe(0);
    expect(result.upcomingCount).toBe(0);
    expect(result.upcomingPoints).toBe(0);
  });

  it('handles a course with only upcoming assignments', () => {
    const course = {
      assignments: [
        { name: 'Final', pts: '—/100', status: 'upcoming' },
      ],
    };
    const result = summarizeAssignments(course);
    expect(result.earned).toBe(0);
    expect(result.totalPossible).toBe(100);
    expect(result.missingCount).toBe(0);
    expect(result.upcomingCount).toBe(1);
    expect(result.upcomingPoints).toBe(100);
  });
});


// ── computeGPAProjections ──
// Validates: Requirements 14.2
describe('computeGPAProjections', () => {
  it('computes current semester GPA from courses', () => {
    // Two courses: grade 90 (3 credits) → GPA 3.7, grade 80 (3 credits) → GPA 2.7
    const courses = [
      { id: 'c1', grade: 90, credits: 3 },
      { id: 'c2', grade: 80, credits: 3 },
    ];
    const result = computeGPAProjections(courses, []);
    // (3.7*3 + 2.7*3) / 6 = 19.2 / 6 = 3.2
    expect(result.currentSemesterGPA).toBe(3.2);
  });

  it('computes cumulative GPA including past semesters', () => {
    const courses = [
      { id: 'c1', grade: 93, credits: 3 }, // GPA 4.0
    ];
    const semesterHistory = [
      {
        courses: [
          { grade: 93, credits: 3 }, // GPA 4.0
        ],
      },
    ];
    const result = computeGPAProjections(courses, semesterHistory);
    // current: 4.0*3 = 12, past: 4.0*3 = 12, total: 24/6 = 4.0
    expect(result.cumulativeGPA).toBe(4.0);
  });

  it('computes projected GPA without each course', () => {
    const courses = [
      { id: 'c1', grade: 93, credits: 3 }, // GPA 4.0
      { id: 'c2', grade: 63, credits: 3 }, // GPA 1.0
    ];
    const semesterHistory = [];
    const result = computeGPAProjections(courses, semesterHistory);

    // Without c1: only c2 remains → GPA 1.0
    expect(result.projectedWithout['c1']).toBe(1.0);
    // Without c2: only c1 remains → GPA 4.0
    expect(result.projectedWithout['c2']).toBe(4.0);
  });

  it('handles empty courses array', () => {
    const result = computeGPAProjections([], []);
    expect(result.currentSemesterGPA).toBe(0);
    expect(result.cumulativeGPA).toBe(0);
  });

  it('uses percentToGPA consistently with mockData', () => {
    // Verify the server's percentToGPA matches expected values from the spec
    const courses = [
      { id: 'cs301', grade: 74, credits: 3 },  // → 2.0
      { id: 'cs355', grade: 91, credits: 3 },  // → 3.7
      { id: 'cs420', grade: 85, credits: 3 },  // → 3.0
      { id: 'eng310', grade: 62, credits: 2 }, // → 0.0
    ];
    const result = computeGPAProjections(courses, []);
    // (2.0*3 + 3.7*3 + 3.0*3 + 0.0*2) / 11 = 26.1 / 11 ≈ 2.37
    const expected = Math.round(((2.0 * 3 + 3.7 * 3 + 3.0 * 3 + 0.0 * 2) / 11) * 100) / 100;
    expect(result.currentSemesterGPA).toBe(expected);
  });
});

// ── computeFeasibility ──
// Validates: Requirements 19.5
describe('computeFeasibility', () => {
  it('returns seat availability from catalog', () => {
    const catalog = [
      { code: 'CS 450', seats: 12, schedule: 'MWF 10–11am' },
      { code: 'CS 460', seats: 0, schedule: 'TTh 1–2:30pm' },
    ];
    const result = computeFeasibility(catalog, []);
    expect(result.seatAvailability['CS 450']).toBe(12);
    expect(result.seatAvailability['CS 460']).toBe(0);
  });

  it('detects schedule conflicts between overlapping courses', () => {
    const catalog = [
      { code: 'A', schedule: 'MWF 10–11am' },
      { code: 'B', schedule: 'MWF 10–11am' }, // same time → conflict
    ];
    const result = computeFeasibility(catalog, []);
    expect(result.scheduleConflicts.length).toBe(1);
    expect(result.scheduleConflicts[0]).toEqual(expect.arrayContaining(['A', 'B']));
  });

  it('reports no conflicts for non-overlapping schedules', () => {
    const catalog = [
      { code: 'A', schedule: 'MWF 9–10am' },
      { code: 'B', schedule: 'MWF 10–11am' }, // adjacent, not overlapping
    ];
    const result = computeFeasibility(catalog, []);
    expect(result.scheduleConflicts.length).toBe(0);
  });

  it('detects conflicts between catalog and current courses', () => {
    const catalog = [
      { code: 'CS 450', schedule: 'MWF 10–11am' },
    ];
    const currentCourses = [
      {
        id: 'cs301',
        code: 'CS 301',
        schedule: 'MWF 10–11am',
        assignments: [{ name: 'HW1', pts: '30/30', status: 'submitted' }],
      },
    ];
    const result = computeFeasibility(catalog, currentCourses);
    expect(result.scheduleConflicts.length).toBe(1);
  });

  it('computes max achievable grade for current courses', () => {
    const currentCourses = [
      {
        id: 'cs301',
        code: 'CS 301',
        assignments: [
          { name: 'HW1', pts: '30/30', status: 'submitted' },
          { name: 'HW2', pts: '0/30', status: 'missing' },
          { name: 'Final', pts: '—/100', status: 'upcoming' },
        ],
      },
    ];
    const result = computeFeasibility([], currentCourses);
    // earned: 30, missingPoints: 30, upcomingPoints: 100
    // maxPoints = 30 + 30 + 100 = 160, totalPossible = 30 + 30 + 100 = 160
    // maxPercent = 160/160 * 100 = 100
    expect(result.maxAchievableGrades['cs301']).toBe(100);
  });

  it('computes max achievable grade with partial earned points', () => {
    const currentCourses = [
      {
        id: 'eng310',
        code: 'ENG 310',
        assignments: [
          { name: 'Summary', pts: '18/20', status: 'submitted' },
          { name: 'Proposal', pts: '0/40', status: 'missing' },
          { name: 'Review', pts: '—/20', status: 'upcoming' },
          { name: 'Final', pts: '—/100', status: 'upcoming' },
        ],
      },
    ];
    const result = computeFeasibility([], currentCourses);
    // earned: 18, missingPoints: 40, upcomingPoints: 120
    // maxPoints = 18 + 40 + 120 = 178, totalPossible = 20+40+20+100 = 180
    // maxPercent = round(178/180 * 100) = 99
    expect(result.maxAchievableGrades['eng310']).toBe(99);
  });
});

// ── checkPrerequisites ──
describe('checkPrerequisites', () => {
  it('marks completed courses as satisfied', () => {
    const degreeReqs = {
      major: {
        required: [
          { code: 'CS 101', status: 'done' },
          { code: 'CS 301', status: 'in-progress' },
        ],
      },
    };
    const completed = ['CS 101'];
    const result = checkPrerequisites(degreeReqs, completed);
    expect(result['CS 101']).toBe(true);
  });

  it('marks courses with status "done" as satisfied even if not in completedCourses', () => {
    const degreeReqs = {
      major: {
        required: [{ code: 'CS 101', status: 'done' }],
      },
    };
    const result = checkPrerequisites(degreeReqs, []);
    expect(result['CS 101']).toBe(true);
  });

  it('marks needed courses as not satisfied', () => {
    const degreeReqs = {
      major: {
        required: [{ code: 'CS 450', status: 'needed' }],
      },
    };
    const result = checkPrerequisites(degreeReqs, []);
    expect(result['CS 450']).toBe(false);
  });

  it('checks across major, minor, and genEd sections', () => {
    const degreeReqs = {
      major: { required: [{ code: 'CS 101', status: 'done' }] },
      minor: { required: [{ code: 'MATH 201', status: 'done' }] },
      genEd: { required: [{ code: 'ART 101', status: 'needed' }] },
    };
    const result = checkPrerequisites(degreeReqs, ['CS 101', 'MATH 201']);
    expect(result['CS 101']).toBe(true);
    expect(result['MATH 201']).toBe(true);
    expect(result['ART 101']).toBe(false);
  });
});
