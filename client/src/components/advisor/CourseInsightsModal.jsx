import { useState } from "react";
import {
  X, Sparkles, AlertTriangle, TrendingDown, TrendingUp, Minus,
  CalendarDays, ArrowRightLeft, BookOpen, ChevronDown, ChevronUp,
  GraduationCap, Clock, Target,
} from "lucide-react";

export default function CourseInsightsModal({
  course, aiData, deterministic, academicDates, courseCatalog, degreeRequirements, onClose,
}) {
  const [showReplacements, setShowReplacements] = useState(false);

  if (!course) return null;

  // ── Gather data for this course ──
  const courseCode = course.code;
  const missingCount = course.assignments.filter(a => a.status === "missing").length;
  const upcomingCount = course.assignments.filter(a => a.status === "upcoming").length;
  const missingPts = course.assignments
    .filter(a => a.status === "missing")
    .reduce((s, a) => s + Number(a.pts.split("/")[1] || 0), 0);

  // AI data for this course
  const insight = aiData?.insights?.find(i => i.courseCode === courseCode);
  const dropRec = aiData?.dropRecommendations?.find(d => d.courseCode === courseCode);
  const replaceRecs = aiData?.replaceRecommendations?.filter(r => r.currentCourseCode === courseCode) || [];
  const riskAdj = aiData?.courseRiskAdjustments?.find(a => a.courseCode === courseCode);

  // Deterministic data
  const gpaProjections = deterministic?.gpaProjections || {};
  const gpaWithout = gpaProjections.projectedWithout?.[course.id];
  const currentSemGPA = gpaProjections.currentSemesterGPA;
  const cumulativeGPA = gpaProjections.cumulativeGPA;
  const assignmentSummary = deterministic?.assignmentSummaries?.[course.id];
  const maxAchievable = deterministic?.feasibilityData?.maxAchievableGrades?.[course.id];

  // Deadlines
  const dropDaysLeft = academicDates.dropDaysLeft;
  const withdrawDaysLeft = academicDates.withdrawDaysLeft;
  const canDrop = dropDaysLeft > 0;
  const canWithdraw = withdrawDaysLeft > 0;

  // Replacement courses from catalog
  const replacementCourses = courseCatalog.filter(c => c.replaces === courseCode);

  // Degree requirement info
  let reqInfo = null;
  for (const section of ["major", "minor", "genEd"]) {
    const req = degreeRequirements[section]?.required?.find(r => r.code === courseCode);
    if (req) { reqInfo = { section, ...req }; break; }
  }

  // Trend
  const trendConfig = {
    down: { icon: TrendingDown, label: "Declining", cls: "text-red-500" },
    up: { icon: TrendingUp, label: "Improving", cls: "text-green-600" },
    stable: { icon: Minus, label: "Stable", cls: "text-gray-400" },
  };
  const trend = trendConfig[course.trend] || trendConfig.stable;
  const TrendIcon = trend.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[680px] max-h-[85vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">AI Insights — {courseCode}</h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 ml-6">{course.name} · {course.instructor}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ── Overview Stats ── */}
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Grade" value={`${course.grade}%`} sub={course.letter}
              color={course.grade >= 85 ? "text-green-600" : course.grade >= 70 ? "text-amber-600" : "text-red-600"} />
            <StatBox label="Trend" value={trend.label} icon={<TrendIcon size={14} />} color={trend.cls} />
            <StatBox label="Missing" value={missingCount} sub={`${missingPts} pts`}
              color={missingCount > 0 ? "text-red-600" : "text-gray-900"} />
            <StatBox label="Upcoming" value={upcomingCount} sub="assignments" color="text-gray-900" />
          </div>

          {maxAchievable != null && (
            <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-xs text-gray-600">
              <span className="font-medium text-gray-800">Max achievable grade:</span> {maxAchievable.toFixed(0)}%
              {assignmentSummary && (
                <span className="ml-2 text-gray-400">
                  ({assignmentSummary.earned}/{assignmentSummary.totalPossible} pts earned)
                </span>
              )}
            </div>
          )}

          {/* ── AI Evaluation ── */}
          {insight && (
            <Section icon={<Sparkles size={14} />} title="AI Evaluation">
              <p className="text-sm font-medium text-gray-800">{insight.title}</p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{insight.description}</p>
              {riskAdj && (
                <p className="text-xs text-blue-600 mt-2">
                  Risk adjusted to <span className="font-semibold">{riskAdj.adjustedRisk}</span>: {riskAdj.justification}
                </p>
              )}
            </Section>
          )}

          {/* ── Drop / Replace Analysis ── */}
          <Section icon={<ArrowRightLeft size={14} />} title="Drop / Replace Analysis">
            {/* Deadlines */}
            <div className="flex gap-4 mb-3">
              <div className="flex items-center gap-1.5 text-xs">
                <CalendarDays size={12} className={canDrop ? "text-amber-500" : "text-gray-300"} />
                <span className={canDrop ? "text-gray-700" : "text-gray-400"}>
                  Drop deadline: {academicDates.dropDeadline}
                  <span className={`ml-1 font-medium ${dropDaysLeft <= 7 ? "text-red-500" : ""}`}>
                    ({dropDaysLeft}d left)
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <CalendarDays size={12} className={canWithdraw ? "text-blue-400" : "text-gray-300"} />
                <span className={canWithdraw ? "text-gray-700" : "text-gray-400"}>
                  Withdraw: {academicDates.withdrawDeadline} ({withdrawDaysLeft}d)
                </span>
              </div>
            </div>

            {/* AI drop recommendation */}
            {dropRec && (
              <div className={`rounded-lg border p-3 mb-3 ${
                dropRec.recommend ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"
              }`}>
                <p className="text-sm font-medium text-gray-800">
                  {dropRec.recommend ? "Consider dropping this course" : "Keep this course"}
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{dropRec.reasoning}</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="text-gray-500">
                    GPA with: <span className="font-semibold text-gray-800">{dropRec.projectedGPAWith?.toFixed(2)}</span>
                  </span>
                  <span className="text-gray-500">
                    GPA without: <span className="font-semibold text-gray-800">{dropRec.projectedGPAWithout?.toFixed(2)}</span>
                  </span>
                </div>
              </div>
            )}

            {/* GPA impact if no AI rec */}
            {!dropRec && gpaWithout != null && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700">
                  If dropped, projected semester GPA: <span className="font-semibold">{gpaWithout.toFixed(2)}</span>
                  <span className="text-xs text-gray-400 ml-1">(current: {currentSemGPA?.toFixed(2)})</span>
                </p>
              </div>
            )}

            {/* Degree requirement note */}
            {reqInfo && (
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{courseCode}</span> fulfills{" "}
                <span className="font-medium">{reqInfo.section === "major" ? "major" : reqInfo.section === "minor" ? "minor" : "gen-ed"}</span>{" "}
                requirement ({reqInfo.name}, {reqInfo.credits} cr)
                {reqInfo.status === "in-progress" && " — currently in progress"}
              </p>
            )}
          </Section>

          {/* ── Replacement Suggestions ── */}
          {(replaceRecs.length > 0 || replacementCourses.length > 0) && (
            <Section icon={<BookOpen size={14} />} title="Replacement Options">
              <button
                onClick={() => setShowReplacements(!showReplacements)}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors mb-2"
              >
                {showReplacements ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {showReplacements ? "Hide" : "Show"} {replaceRecs.length + replacementCourses.length} replacement option(s)
              </button>

              {showReplacements && (
                <div className="space-y-2">
                  {/* AI replacement recs */}
                  {replaceRecs.map((r, i) => (
                    <ReplacementCard
                      key={`ai-${i}`}
                      code={r.replacementCode}
                      reason={r.reasoning}
                      difficulty={r.difficultyComparison}
                      gpaBenefit={r.expectedGPABenefit}
                      confidence={r.confidenceScore}
                      catalog={courseCatalog.find(c => c.code === r.replacementCode)}
                    />
                  ))}
                  {/* Catalog replacements not already in AI recs */}
                  {replacementCourses
                    .filter(rc => !replaceRecs.some(r => r.replacementCode === rc.code))
                    .map((rc, i) => (
                      <ReplacementCard
                        key={`cat-${i}`}
                        code={rc.code}
                        reason={`Fills same requirement. ${rc.difficulty} difficulty, ${rc.rating}★ rating.`}
                        catalog={rc}
                      />
                    ))}
                </div>
              )}
            </Section>
          )}

          {/* ── Assignments Overview ── */}
          <Section icon={<Target size={14} />} title="Assignments">
            <div className="space-y-1.5">
              {course.assignments.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      a.status === "missing" ? "bg-red-500" :
                      a.status === "upcoming" ? "bg-amber-400" :
                      a.status === "graded" ? "bg-blue-400" : "bg-green-400"
                    }`} />
                    <span className="text-gray-700 truncate">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-gray-400">{a.due}</span>
                    <span className={`font-medium tabular-nums ${
                      a.status === "missing" ? "text-red-500" : "text-gray-600"
                    }`}>{a.pts}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                      a.status === "missing" ? "bg-red-100 text-red-600" :
                      a.status === "upcoming" ? "bg-amber-100 text-amber-700" :
                      a.status === "graded" ? "bg-blue-100 text-blue-600" :
                      "bg-green-100 text-green-600"
                    }`}>{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function Section({ icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-400">{icon}</span>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatBox({ label, value, sub, icon, color = "text-gray-900" }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className={`flex items-center justify-center gap-1 ${color}`}>
        {icon}
        <span className="text-lg font-bold">{value}</span>
      </div>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ReplacementCard({ code, reason, difficulty, gpaBenefit, confidence, catalog }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{code}</span>
          {catalog && <span className="text-xs text-gray-500">{catalog.name}</span>}
        </div>
        {confidence && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            confidence === "high" ? "bg-green-100 text-green-700" :
            confidence === "medium" ? "bg-amber-100 text-amber-700" :
            "bg-gray-100 text-gray-500"
          }`}>{confidence}</span>
        )}
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{reason}</p>
      <div className="flex gap-3 mt-2 text-xs text-gray-400">
        {catalog?.schedule && <span>{catalog.schedule}</span>}
        {catalog?.seats != null && <span>{catalog.seats} seats</span>}
        {difficulty && <span>{difficulty}</span>}
        {gpaBenefit != null && <span className="text-green-600 font-medium">+{gpaBenefit.toFixed(2)} GPA</span>}
      </div>
    </div>
  );
}
