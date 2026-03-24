export const FALLBACK_AI_RESPONSE = {
  insights: [],
  dropRecommendations: [],
  replaceRecommendations: [],
  minorSuggestions: [],
  nextCourses: [],
  courseRiskAdjustments: [],
};

const VALID_CONFIDENCE = new Set(['high', 'medium', 'low']);

export function parseAdvisorResponse(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return { ...FALLBACK_AI_RESPONSE };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    const stripped = rawText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '').trim();
    try {
      parsed = JSON.parse(stripped);
    } catch {
      return { ...FALLBACK_AI_RESPONSE };
    }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ...FALLBACK_AI_RESPONSE };
  }

  return validateAdvisorResponse(parsed);
}

export function validateAdvisorResponse(parsed) {
  const result = {};

  if (Array.isArray(parsed.insights)) {
    result.insights = parsed.insights.filter(item =>
      item && typeof item === 'object' &&
      typeof item.icon === 'string' &&
      typeof item.title === 'string' &&
      typeof item.description === 'string' &&
      VALID_CONFIDENCE.has(item.confidenceScore)
    );
  } else { result.insights = []; }

  if (Array.isArray(parsed.dropRecommendations)) {
    result.dropRecommendations = parsed.dropRecommendations.filter(item =>
      item && typeof item === 'object' &&
      typeof item.courseCode === 'string' &&
      typeof item.recommend === 'boolean' &&
      VALID_CONFIDENCE.has(item.confidenceScore) &&
      typeof item.projectedGPAWith === 'number' &&
      typeof item.projectedGPAWithout === 'number' &&
      typeof item.reasoning === 'string'
    );
  } else { result.dropRecommendations = []; }

  if (Array.isArray(parsed.replaceRecommendations)) {
    result.replaceRecommendations = parsed.replaceRecommendations.filter(item =>
      item && typeof item === 'object' &&
      typeof item.currentCourseCode === 'string' &&
      typeof item.replacementCode === 'string' &&
      typeof item.difficultyComparison === 'string' &&
      typeof item.expectedGPABenefit === 'number' &&
      VALID_CONFIDENCE.has(item.confidenceScore) &&
      typeof item.reasoning === 'string'
    );
  } else { result.replaceRecommendations = []; }

  if (Array.isArray(parsed.minorSuggestions)) {
    result.minorSuggestions = parsed.minorSuggestions.filter(item =>
      item && typeof item === 'object' &&
      typeof item.minorName === 'string' &&
      typeof item.overlappingCredits === 'number' &&
      Array.isArray(item.remainingCourses) &&
      VALID_CONFIDENCE.has(item.confidenceScore) &&
      typeof item.reasoning === 'string'
    );
  } else { result.minorSuggestions = []; }

  if (Array.isArray(parsed.nextCourses)) {
    result.nextCourses = parsed.nextCourses.filter(item =>
      item && typeof item === 'object' &&
      typeof item.courseCode === 'string' &&
      typeof item.reason === 'string' &&
      VALID_CONFIDENCE.has(item.confidenceScore) &&
      typeof item.fulfills === 'string'
    );
  } else { result.nextCourses = []; }

  if (Array.isArray(parsed.courseRiskAdjustments)) {
    result.courseRiskAdjustments = parsed.courseRiskAdjustments.filter(item =>
      item && typeof item === 'object' &&
      typeof item.courseCode === 'string' &&
      ['at-risk', 'stable', 'performing'].includes(item.adjustedRisk) &&
      typeof item.justification === 'string'
    );
  } else { result.courseRiskAdjustments = []; }

  return result;
}
