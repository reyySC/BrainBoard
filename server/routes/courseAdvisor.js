import express from "express";
import fetch from "node-fetch";
import {
  classifyRisk, summarizeAssignments, computeGPAProjections,
  computeDeadlineFlags, checkPrerequisites, computeFeasibility,
} from "../lib/rulesEngine.js";
import { ResponseCache } from "../lib/responseCache.js";
import { constructAdvisorPrompt } from "../lib/promptConstructor.js";
import { parseAdvisorResponse } from "../lib/responseParser.js";
import { callGroq, GROQ_URL, MODEL } from "../lib/groqClient.js";

const router = express.Router();
const advisorCache = new ResponseCache();
const courseAiCache = new ResponseCache(10 * 60 * 1000);

// ── Full Course Advisor ──
router.post("/course-advisor", async (req, res) => {
  const { studentData, guidelineData } = req.body;
  if (!studentData) return res.status(400).json({ error: "studentData is required" });

  const cacheResult = advisorCache.get(studentData);
  if (cacheResult.hit) return res.json({ ...cacheResult.data, cached: true });

  const courses = studentData.courses || [];
  const semesterHistory = studentData.semesterHistory || [];
  const academicDates = studentData.academicDates || {};
  const degreeProgress = studentData.degreeProgress || {};
  const courseCatalog = studentData.courseCatalog || [];

  const completedCourses = [];
  for (const section of ['major', 'minor', 'genEd']) {
    const req2 = degreeProgress[section];
    if (!req2?.required) continue;
    for (const c of req2.required) {
      if (c.status === 'done') completedCourses.push(c.code);
    }
  }

  const riskClassifications = {};
  const assignmentSummaries = {};
  for (const course of courses) {
    riskClassifications[course.id] = classifyRisk(course);
    assignmentSummaries[course.id] = summarizeAssignments(course);
  }

  const gpaProjections = computeGPAProjections(courses, semesterHistory);
  const deadlineFlags = computeDeadlineFlags(academicDates);
  const prerequisiteStatus = checkPrerequisites(degreeProgress, completedCourses);
  const feasibilityData = computeFeasibility(courseCatalog, courses);

  const deterministicResults = {
    riskClassifications, gpaProjections, deadlineFlags,
    assignmentSummaries, prerequisiteStatus, feasibilityData,
  };

  const buildFallbackResponse = (errorMsg) => ({
    status: 'fallback', deterministic: deterministicResults,
    ai: undefined, cached: false, error: errorMsg,
  });

  const callAdvisorGroq = async () => {
    const messages = constructAdvisorPrompt(studentData, guidelineData, deterministicResults);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const GROQ_KEY = process.env.GROQ_API_KEY;
      const groqRes = await fetch(GROQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({ model: MODEL, messages, temperature: 0.4, max_tokens: 1024 }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await groqRes.json();
      if (data.error) throw new Error(data.error.message || "Groq API error");
      return data.choices?.[0]?.message?.content || "";
    } catch (err) { clearTimeout(timeoutId); throw err; }
  };

  let rawText, groqFailed = false, groqError = '';
  try { rawText = await callAdvisorGroq(); }
  catch (firstErr) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      rawText = await callAdvisorGroq();
    } catch (secondErr) {
      groqFailed = true;
      groqError = secondErr.name === 'AbortError' ? 'Request timeout' : secondErr.message;
    }
  }

  if (groqFailed) {
    if (cacheResult.stale && cacheResult.data) {
      return res.json({ ...cacheResult.data, status: 'partial', cached: true, error: 'Using cached data — AI service temporarily unavailable' });
    }
    return res.json(buildFallbackResponse(groqError || 'AI service unavailable'));
  }

  let aiResponse = parseAdvisorResponse(rawText);

  if (deadlineFlags.dropDeadlinePassed) aiResponse.dropRecommendations = [];
  if (deadlineFlags.withdrawDeadlinePassed) {
    aiResponse.dropRecommendations = aiResponse.dropRecommendations.filter(
      rec => !rec.reasoning?.toLowerCase().includes('withdraw')
    );
  }

  if (aiResponse.replaceRecommendations.length > 0) {
    aiResponse.replaceRecommendations = aiResponse.replaceRecommendations.filter(rec => {
      const seats = feasibilityData.seatAvailability[rec.replacementCode];
      if (seats !== undefined && seats === 0) return false;
      if (feasibilityData.scheduleConflicts.some(pair => pair.includes(rec.replacementCode))) return false;
      return true;
    });
  }

  if (aiResponse.nextCourses.length > 0) {
    aiResponse.nextCourses = aiResponse.nextCourses.filter(rec => {
      const seats = feasibilityData.seatAvailability[rec.courseCode];
      if (seats !== undefined && seats === 0) return false;
      if (feasibilityData.scheduleConflicts.some(pair => pair.includes(rec.courseCode))) return false;
      return true;
    });
  }

  const allFields = [aiResponse.insights, aiResponse.dropRecommendations, aiResponse.replaceRecommendations, aiResponse.minorSuggestions, aiResponse.nextCourses];
  const hasAnyContent = allFields.some(arr => arr.length > 0);
  const allHaveContent = allFields.every(arr => arr.length > 0);
  const status = hasAnyContent ? (allHaveContent ? 'success' : 'partial') : 'partial';

  const response = { status, deterministic: deterministicResults, ai: aiResponse, cached: false };
  advisorCache.set(studentData, response);
  return res.json(response);
});

// ── Per-Course AI ──
router.post("/course-ai", async (req, res) => {
  const { course, gpa, deadlineDays } = req.body;
  if (!course || !course.name) return res.status(400).json({ error: "course is required" });

  const cacheResult = courseAiCache.get(req.body);
  if (cacheResult.hit) return res.json({ ...cacheResult.data, cached: true });

  const prompt = `You are an academic advisor.
Given a course and student performance, return:
- problem
- impact
- 2 options (improve with 2-3 bullet steps, drop with short explanation and GPA result)
- recommendation (either "improve" or "drop")

Student GPA: ${gpa || 'N/A'}
Days until drop deadline: ${deadlineDays || 'N/A'}
Course: ${course.name}
Grade: ${course.grade}%
Trend: ${course.trend}
Missing assignments: ${course.missingAssignments || 0}

Return ONLY valid JSON with this exact structure:
{ "problem": "short sentence", "impact": "short sentence", "options": { "improve": ["step 1", "step 2", "step 3"], "drop": "short explanation with GPA impact" }, "recommended": "improve" or "drop" }`;

  try {
    const text = await callGroq([
      { role: "system", content: "You are an academic advisor AI. Return ONLY valid JSON, no markdown fences." },
      { role: "user", content: prompt },
    ], 0.4);
    const clean = text.replace(/```json|```/g, "").trim();
    let parsed;
    try { parsed = JSON.parse(clean); }
    catch {
      return res.json({
        problem: "Unable to parse AI response", impact: "AI suggestions unavailable",
        options: { improve: ["Review course materials", "Attend office hours"], drop: "Consider dropping if grade is below passing" },
        recommended: "improve", cached: false,
      });
    }
    courseAiCache.set(req.body, parsed);
    return res.json({ ...parsed, cached: false });
  } catch (err) {
    console.error("Course AI error:", err.message);
    return res.status(500).json({ error: "AI suggestions unavailable" });
  }
});

export default router;
export { advisorCache };
