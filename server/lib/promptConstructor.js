export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

export function constructAdvisorPrompt(studentData, guidelineData, deterministicResults) {
  const systemMessage = `You are an academic advisor AI assistant. Your role is to analyze student academic data and provide thoughtful, personalized recommendations.

IMPORTANT RULES:
- Use advisory language only: "consider", "you might want to", "it may help to", "one option would be"
- Do NOT use directive language: never say "you must", "you need to", "drop this course immediately"
- Format ALL reasoning strings as: Problem → Impact → Recommended Action
  Example: "Problem: Grade has dropped below 70%. Impact: This puts your semester GPA at risk. Recommended Action: You might want to consider attending office hours and focusing on the upcoming midterm."
- Return ONLY valid JSON. No markdown fences, no explanation text outside the JSON.

Return a JSON object with this exact schema:
{
  "insights": [
    { "icon": "string (emoji)", "title": "string", "description": "string (action-oriented)", "courseCode": "string (optional)", "confidenceScore": "high | medium | low" }
  ],
  "dropRecommendations": [
    { "courseCode": "string", "recommend": true/false, "confidenceScore": "high | medium | low", "projectedGPAWith": number, "projectedGPAWithout": number, "reasoning": "string (Problem → Impact → Recommended Action)" }
  ],
  "replaceRecommendations": [
    { "currentCourseCode": "string", "replacementCode": "string", "difficultyComparison": "string", "expectedGPABenefit": number, "confidenceScore": "high | medium | low", "reasoning": "string (Problem → Impact → Recommended Action)" }
  ],
  "minorSuggestions": [
    { "minorName": "string", "overlappingCredits": number, "remainingCourses": ["string"], "confidenceScore": "high | medium | low", "reasoning": "string (Problem → Impact → Recommended Action)" }
  ],
  "nextCourses": [
    { "courseCode": "string", "reason": "string (Problem → Impact → Recommended Action)", "confidenceScore": "high | medium | low", "fulfills": "string" }
  ],
  "courseRiskAdjustments": [
    { "courseCode": "string", "adjustedRisk": "at-risk | stable | performing", "justification": "string" }
  ]
}

Provide 2-4 insights. Be specific and reference actual course codes and grades. All confidence scores must be "high", "medium", or "low".`;

  const courses = (studentData.courses || []).slice(0, 8);
  const courseSummaries = courses.map(c => {
    const summary = deterministicResults.assignmentSummaries?.[c.id] || {};
    const risk = deterministicResults.riskClassifications?.[c.id] || 'unknown';
    const maxGrade = deterministicResults.feasibilityData?.maxAchievableGrades?.[c.id];
    return {
      id: c.id, code: c.code, name: c.name, grade: c.grade,
      credits: c.credits, trend: c.trend, risk,
      assignmentSummary: {
        earned: summary.earned, totalPossible: summary.totalPossible,
        missingCount: summary.missingCount, missingPoints: summary.missingPoints,
        upcomingCount: summary.upcomingCount, upcomingPoints: summary.upcomingPoints,
      },
      ...(maxGrade !== undefined ? { maxAchievableGrade: maxGrade } : {}),
    };
  });

  const semesterHistory = (studentData.semesterHistory || []).slice(-3).map(sem => ({
    semester: sem.semester, gpa: sem.gpa, credits: sem.credits,
  }));

  const studentSection = {
    currentCourses: courseSummaries,
    semesterHistory,
    academicDates: studentData.academicDates || {},
    degreeProgress: studentData.degreeProgress || {},
  };

  const deterministicSection = {
    riskClassifications: deterministicResults.riskClassifications || {},
    gpaProjections: deterministicResults.gpaProjections || {},
    deadlineFlags: deterministicResults.deadlineFlags || {},
    prerequisiteStatus: deterministicResults.prerequisiteStatus || {},
    feasibilityData: {
      seatAvailability: deterministicResults.feasibilityData?.seatAvailability || {},
      scheduleConflicts: deterministicResults.feasibilityData?.scheduleConflicts || [],
    },
  };

  const guidelineSection = guidelineData || {};

  let userContent = `STUDENT DATA:\n${JSON.stringify(studentSection, null, 1)}\n\nPRE-COMPUTED ANALYSIS (use these values, do not recalculate):\n${JSON.stringify(deterministicSection, null, 1)}\n\nCOURSE GUIDELINES:\n${JSON.stringify(guidelineSection, null, 1)}`;

  const studentDataTokens = estimateTokens(JSON.stringify(studentSection));
  if (studentDataTokens > 4000) {
    const trimmedStudent = { ...studentSection };
    trimmedStudent.semesterHistory = semesterHistory.slice(-1);
    trimmedStudent.currentCourses = courseSummaries.map(c => ({
      id: c.id, code: c.code, name: c.name, grade: c.grade,
      credits: c.credits, risk: c.risk,
      assignmentSummary: {
        earned: c.assignmentSummary.earned,
        totalPossible: c.assignmentSummary.totalPossible,
        missingCount: c.assignmentSummary.missingCount,
      },
    }));

    const secondEstimate = estimateTokens(JSON.stringify(trimmedStudent));
    if (secondEstimate > 4000) {
      trimmedStudent.degreeProgress = { summary: 'See deterministic results' };
      trimmedStudent.semesterHistory = [];
    }

    userContent = `STUDENT DATA:\n${JSON.stringify(trimmedStudent, null, 1)}\n\nPRE-COMPUTED ANALYSIS (use these values, do not recalculate):\n${JSON.stringify(deterministicSection, null, 1)}\n\nCOURSE GUIDELINES:\n${JSON.stringify(guidelineSection, null, 1)}`;
  }

  userContent += `\n\nBased on the above data, generate your academic advisor analysis as the specified JSON object. Remember: advisory language only, Problem → Impact → Recommended Action format for all reasoning, and return ONLY valid JSON.`;

  return [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userContent },
  ];
}
