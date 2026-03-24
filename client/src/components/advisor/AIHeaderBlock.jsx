import {
  Sparkles, AlertTriangle, BookOpen, GraduationCap,
  ArrowRight, RefreshCw,
} from "lucide-react";
import {
  COURSES, ACADEMIC_DATES, DEGREE_REQUIREMENTS,
  COURSE_CATALOG, COURSE_GUIDELINES,
} from "../../data/mockData";

export default function AIHeaderBlock({ aiData, loading, error, onRetry, currentGPA, cumulativeGPA }) {
  // Separate at-risk insights from others
  const atRiskInsights = (aiData?.insights || []).filter(i => {
    const course = COURSES.find(c => c.code === i.courseCode);
    return course && (course.grade < 70 || course.assignments.some(a => a.status === "missing"));
  });
  const otherInsights = (aiData?.insights || []).filter(i => !atRiskInsights.includes(i));

  // Minor discovery data
  const mathMinor = DEGREE_REQUIREMENTS.minor;
  const mathDone = mathMinor?.required?.filter(r => r.status === "done").length || 0;
  const mathTotal = mathMinor?.required?.length || 0;

  // Economics minor from guidelines
  const econMinor = COURSE_GUIDELINES.minorOptions?.find(m => m.name === "Economics Minor");

  return (
    <div className="mb-6 space-y-3">
      {/* ── Title bar ── */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Sparkles size={16} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">AI Course Advisor</h2>
              <p className="text-xs text-gray-400">Personalized suggestions based on your courses, GPA, and university guidelines</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-center">
              <p className="text-gray-400">Semester GPA</p>
              <p className="text-lg font-bold text-gray-900 tabular-nums">{currentGPA.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-gray-400">Cumulative</p>
              <p className="text-lg font-bold text-gray-900 tabular-nums">{cumulativeGPA.toFixed(2)}</p>
            </div>
            {!loading && (
              <button onClick={onRetry} className="text-gray-400 hover:text-gray-600 transition-colors ml-1" aria-label="Refresh">
                <RefreshCw size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          {error}
          <button onClick={onRetry} className="ml-2 underline text-xs font-medium">Retry</button>
        </div>
      )}

      {/* ── AI Content Cards ── */}
      {!loading && !error && aiData && (
        <>
          {/* At-Risk Course Cards — full width, red themed */}
          {atRiskInsights.map((insight, i) => {
            const course = COURSES.find(c => c.code === insight.courseCode);
            const dropRec = aiData.dropRecommendations?.find(d => d.courseCode === insight.courseCode);
            return (
              <div key={`risk-${i}`} className="bg-red-50 border border-red-200 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle size={18} className="text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wide">At Risk</span>
                        <span className="text-sm font-semibold text-gray-900">{insight.courseCode}</span>
                        {course && <span className="text-sm text-gray-500">· {course.name}</span>}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{insight.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{insight.description}</p>

                      {/* Drop recommendation if exists */}
                      {dropRec && (
                        <div className="mt-3 bg-white/70 border border-red-100 rounded-lg px-3 py-2.5">
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            {dropRec.recommend ? "💡 Consider dropping this course" : "📌 Recommended: Keep and improve"}
                          </p>
                          <p className="text-xs text-gray-500 leading-relaxed">{dropRec.reasoning}</p>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-gray-500">GPA if kept: <span className="font-bold text-gray-800">{dropRec.projectedGPAWith?.toFixed(2)}</span></span>
                            <span className="text-gray-500">GPA if dropped: <span className="font-bold text-green-700">{dropRec.projectedGPAWithout?.toFixed(2)}</span></span>
                            <span className="text-gray-400">Drop deadline: {ACADEMIC_DATES.dropDeadline} ({ACADEMIC_DATES.dropDaysLeft}d left)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {course && (
                    <span className={`text-2xl font-bold tabular-nums flex-shrink-0 ml-4 ${
                      course.grade < 70 ? "text-red-600" : "text-amber-600"
                    }`}>{course.grade}%</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Other insights — full width cards, neutral */}
          {otherInsights.map((insight, i) => {
            const course = COURSES.find(c => c.code === insight.courseCode);
            return (
              <div key={`ins-${i}`} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles size={15} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {insight.courseCode && <span className="text-sm font-semibold text-gray-900">{insight.courseCode}</span>}
                      {course && <span className="text-sm text-gray-500">· {course.name}</span>}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{insight.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{insight.description}</p>
                  </div>
                  {course && (
                    <span className={`text-lg font-bold tabular-nums flex-shrink-0 ${
                      course.grade >= 85 ? "text-green-600" : course.grade >= 70 ? "text-amber-600" : "text-red-600"
                    }`}>{course.grade}%</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* ── Strategic Suggestions + Minor Discovery ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Next semester courses */}
            {aiData.nextCourses?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={15} className="text-blue-500" />
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Next Semester Courses</h3>
                </div>
                <div className="space-y-2.5">
                  {aiData.nextCourses.map((c, i) => {
                    const cat = COURSE_CATALOG.find(cc => cc.code === c.courseCode);
                    return (
                      <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-blue-800">{c.courseCode}</span>
                          {cat && <span className="text-xs text-blue-500">{cat.seats} seats · {cat.schedule}</span>}
                        </div>
                        <p className="text-xs text-blue-600 mt-0.5">{c.reason}</p>
                        <p className="text-xs text-blue-400 mt-0.5">Fulfills: {c.fulfills}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Minor discovery */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap size={15} className="text-purple-500" />
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Minor Opportunities</h3>
              </div>

              {/* Current math minor progress */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 mb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-800">{mathMinor?.name || "Mathematics Minor"}</span>
                  <span className="text-xs text-gray-500">{mathDone}/{mathTotal} courses done</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                  <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: `${mathTotal > 0 ? (mathDone / mathTotal) * 100 : 0}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Remaining: {mathMinor?.required?.filter(r => r.status === "needed").map(r => r.code).join(", ")}
                </p>
              </div>

              {/* Economics minor suggestion */}
              {econMinor && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-purple-700 uppercase">Discover</span>
                    <span className="text-sm font-semibold text-purple-900">{econMinor.name}</span>
                  </div>
                  <p className="text-xs text-purple-600 leading-relaxed">
                    Only {econMinor.requiredCourses.length} courses needed ({econMinor.totalCredits} credits).
                    {econMinor.eligibility}. Start with {econMinor.requiredCourses[0]} this fall and pair with {econMinor.requiredCourses[1]} next spring to complete in 2 semesters.
                  </p>
                </div>
              )}

              {/* AI minor suggestions */}
              {aiData?.minorSuggestions?.map((m, i) => (
                <div key={i} className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2.5 mt-2.5">
                  <span className="text-sm font-semibold text-purple-900">{m.minorName}</span>
                  <p className="text-xs text-purple-600 mt-0.5 leading-relaxed">{m.reasoning}</p>
                  {m.overlappingCredits > 0 && (
                    <p className="text-xs text-purple-500 mt-1">
                      You already have {m.overlappingCredits} overlapping credits from courses you've taken.
                    </p>
                  )}
                  {m.remainingCourses?.length > 0 && (
                    <p className="text-xs text-purple-400 mt-0.5">
                      Remaining: {m.remainingCourses.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Replace recommendations — full width */}
          {aiData.replaceRecommendations?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight size={15} className="text-amber-500" />
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Course Replacements</h3>
              </div>
              <div className="space-y-2">
                {aiData.replaceRecommendations.map((r, i) => {
                  const replacement = COURSE_CATALOG.find(c => c.code === r.replacementCode);
                  return (
                    <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{r.currentCourseCode}</span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm font-semibold text-amber-800">{r.replacementCode}</span>
                          {replacement && <span className="text-xs text-gray-500">{replacement.name}</span>}
                        </div>
                        {r.expectedGPABenefit != null && (
                          <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                            +{r.expectedGPABenefit.toFixed(2)} GPA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{r.reasoning}</p>
                      {replacement && (
                        <p className="text-xs text-gray-400 mt-1">
                          {replacement.schedule} · {replacement.instructor} · {replacement.seats} seats · {replacement.difficulty}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
