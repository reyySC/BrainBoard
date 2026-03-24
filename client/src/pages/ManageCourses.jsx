import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  COURSES, ACADEMIC_DATES, DEGREE_REQUIREMENTS, COURSE_CATALOG,
  SEMESTER_HISTORY, COURSE_GUIDELINES,
} from "../data/mockData";
import CourseInsightsModal from "../components/advisor/CourseInsightsModal";
import PlanCoursesModal from "../components/advisor/PlanCoursesModal";
import AIHeaderBlock from "../components/advisor/AIHeaderBlock";
import DateChip from "../components/advisor/DateChip";
import {
  TrendingUp, TrendingDown, Minus, Sparkles,
  LayoutGrid,
} from "lucide-react";

/* ── Risk classification ── */
function classifyRisk(course) {
  const hasMissing = course.assignments.some(a => a.status === "missing");
  if (course.grade < 70 || hasMissing) return "at-risk";
  if (course.grade >= 85) return "performing";
  return "stable";
}

const statusConfig = {
  "at-risk":    { label: "At Risk", cls: "bg-red-100 text-red-700" },
  "stable":     { label: "Watch",   cls: "bg-yellow-100 text-yellow-700" },
  "performing": { label: "Good",    cls: "bg-green-100 text-green-700" },
};

const trendConfig = {
  down:   { icon: TrendingDown, label: "Declining", cls: "text-red-500" },
  up:     { icon: TrendingUp,   label: "Improving", cls: "text-green-600" },
  stable: { icon: Minus,        label: "Stable",    cls: "text-gray-400" },
};

export default function ManageCourses() {
  const navigate = useNavigate();

  // AI data state
  const [aiData, setAiData] = useState(null);
  const [deterministic, setDeterministic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [insightsCourse, setInsightsCourse] = useState(null);
  const [planOpen, setPlanOpen] = useState(false);

  // Client-side risk fallback
  const clientRisks = {};
  COURSES.forEach(c => { clientRisks[c.id] = classifyRisk(c); });

  const buildPayload = useCallback(() => ({
    studentData: {
      courses: COURSES.map(c => ({
        id: c.id, code: c.code, name: c.name, grade: c.grade,
        letter: c.letter, credits: c.credits, trend: c.trend,
        alert: c.alert, alertMsg: c.alertMsg, assignments: c.assignments,
      })),
      semesterHistory: SEMESTER_HISTORY,
      academicDates: ACADEMIC_DATES,
      degreeProgress: DEGREE_REQUIREMENTS,
      courseCatalog: COURSE_CATALOG,
    },
    guidelineData: COURSE_GUIDELINES,
  }), []);

  const fetchAdvisor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/course-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json();
      setDeterministic(data.deterministic || null);
      setAiData(data.ai || null);
      if (data.status === "fallback") setError(data.error || "AI unavailable");
    } catch (err) {
      setError(err.message || "Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  }, [buildPayload]);

  useEffect(() => { fetchAdvisor(); }, [fetchAdvisor]);

  // Risk getter — AI adjusted > server deterministic > client fallback
  const getRisk = (courseId) => {
    if (aiData?.courseRiskAdjustments) {
      const course = COURSES.find(c => c.id === courseId);
      const adj = aiData.courseRiskAdjustments.find(a => a.courseCode === course?.code);
      if (adj) return adj.adjustedRisk;
    }
    if (deterministic?.riskClassifications?.[courseId]) {
      return deterministic.riskClassifications[courseId];
    }
    return clientRisks[courseId];
  };

  // Current semester GPA
  const currentGPA = deterministic?.gpaProjections?.currentSemesterGPA
    ?? SEMESTER_HISTORY.find(s => s.semester === "Spring 2026")?.gpa
    ?? 0;
  const cumulativeGPA = deterministic?.gpaProjections?.cumulativeGPA ?? 0;

  // Build rows
  const rows = COURSES.map(c => {
    const risk = getRisk(c.id);
    const missingCount = c.assignments.filter(a => a.status === "missing").length;
    const upcomingCount = c.assignments.filter(a => a.status === "upcoming").length;
    return { ...c, risk, missingCount, upcomingCount };
  });

  // Sort: at-risk first
  const riskOrder = { "at-risk": 0, "stable": 1, "performing": 2 };
  rows.sort((a, b) => (riskOrder[a.risk] ?? 1) - (riskOrder[b.risk] ?? 1));

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manage Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Spring 2026 · {COURSES.length} courses · {COURSES.reduce((s, c) => s + c.credits, 0)} credits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlanOpen(true)}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LayoutGrid size={15} />
            Plan Courses
          </button>
        </div>
      </div>

      {/* ── AI Suggestions Header Block ── */}
      <AIHeaderBlock
        aiData={aiData}
        loading={loading}
        error={error}
        onRetry={fetchAdvisor}
        currentGPA={currentGPA}
        cumulativeGPA={cumulativeGPA}
      />

      {/* ── Course Table ── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2.5fr_0.8fr_0.8fr_0.8fr_0.7fr_1.4fr] px-6 py-3 border-b border-gray-200 bg-gray-50 gap-4">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Course</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Grade</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trend</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Details</span>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Actions</span>
        </div>

        {/* Rows */}
        {rows.map((course) => {
          const status = statusConfig[course.risk] || statusConfig.stable;
          const trend = trendConfig[course.trend] || trendConfig.stable;
          const TrendIcon = trend.icon;

          // Per-course AI insight snippet
          const courseInsight = aiData?.insights?.find(i => i.courseCode === course.code);

          return (
            <div
              key={course.id}
              className="grid grid-cols-[2.5fr_0.8fr_0.8fr_0.8fr_0.7fr_1.4fr] items-center px-6 py-5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors gap-4"
            >
              {/* Course info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{course.code}</p>
                  <span className="text-xs text-gray-400">·</span>
                  <p className="text-sm text-gray-600 truncate">{course.name}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {course.instructor} · {course.credits} cr · {course.officeHours}
                </p>
                {/* AI insight snippet */}
                {courseInsight && (
                  <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                    <Sparkles size={11} className="flex-shrink-0" />
                    <span className="truncate">{courseInsight.title}</span>
                  </p>
                )}
              </div>

              {/* Grade */}
              <div>
                <span className={`text-lg font-bold tabular-nums ${
                  course.grade >= 85 ? "text-gray-900" :
                  course.grade >= 70 ? "text-amber-600" : "text-red-600"
                }`}>{course.grade}%</span>
                <span className="text-xs text-gray-400 ml-1">({course.letter})</span>
              </div>

              {/* Trend */}
              <div className={`flex items-center gap-1.5 ${trend.cls}`}>
                <TrendIcon size={14} />
                <span className="text-xs font-medium">{trend.label}</span>
              </div>

              {/* Status */}
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${status.cls}`}>
                  {status.label}
                </span>
              </div>

              {/* Details */}
              <div className="text-xs text-gray-500 space-y-0.5">
                {course.missingCount > 0 && (
                  <p className="text-red-500 font-medium">{course.missingCount} missing</p>
                )}
                {course.upcomingCount > 0 && (
                  <p>{course.upcomingCount} upcoming</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => setInsightsCourse(course)}
                  className="flex items-center gap-1 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Sparkles size={11} />
                  AI Insights
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Key Dates ── */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Key Dates</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DateChip label="Drop Deadline" date={ACADEMIC_DATES.dropDeadline} days={ACADEMIC_DATES.dropDaysLeft} urgent={ACADEMIC_DATES.dropDaysLeft <= 14} />
          <DateChip label="Withdraw Deadline" date={ACADEMIC_DATES.withdrawDeadline} days={ACADEMIC_DATES.withdrawDaysLeft} />
          <DateChip label="Fall Registration" date={ACADEMIC_DATES.fallRegistrationOpen} days={Math.max(0, ACADEMIC_DATES.dropDaysLeft + 10)} />
          <DateChip label="Registration Closes" date={ACADEMIC_DATES.fallRegistrationClose} days={Math.max(0, ACADEMIC_DATES.dropDaysLeft + 25)} />
        </div>
      </div>

      {/* ── Modals ── */}
      {insightsCourse && (
        <CourseInsightsModal
          course={insightsCourse}
          aiData={aiData}
          deterministic={deterministic}
          academicDates={ACADEMIC_DATES}
          courseCatalog={COURSE_CATALOG}
          degreeRequirements={DEGREE_REQUIREMENTS}
          onClose={() => setInsightsCourse(null)}
        />
      )}

      {planOpen && (
        <PlanCoursesModal
          courses={COURSES}
          courseCatalog={COURSE_CATALOG}
          degreeRequirements={DEGREE_REQUIREMENTS}
          aiData={aiData}
          onClose={() => setPlanOpen(false)}
        />
      )}
    </div>
  );
}
