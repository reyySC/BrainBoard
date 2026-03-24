import { useState } from "react";
import {
  X, Plus, Trash2, BookOpen, GraduationCap, Clock, CheckCircle2,
} from "lucide-react";

export default function PlanCoursesModal({
  courses, courseCatalog, degreeRequirements, aiData, onClose,
}) {
  const [tab, setTab] = useState("current"); // current | add | degree

  // Current courses
  const currentCodes = courses.map(c => c.code);

  // Degree progress
  const sections = ["major", "minor", "genEd"];
  const allReqs = [];
  for (const s of sections) {
    const req = degreeRequirements[s];
    if (!req?.required) continue;
    for (const r of req.required) {
      allReqs.push({ ...r, section: s, sectionName: req.name });
    }
  }

  // Available to add (not currently enrolled, not done)
  const doneCodes = allReqs.filter(r => r.status === "done").map(r => r.code);
  const inProgressCodes = allReqs.filter(r => r.status === "in-progress").map(r => r.code);
  const availableCatalog = courseCatalog.filter(
    c => !currentCodes.includes(c.code) && !doneCodes.includes(c.code)
  );

  // AI next course suggestions
  const aiNext = aiData?.nextCourses || [];

  const tabs = [
    { id: "current", label: "Current Courses" },
    { id: "add", label: "Add Courses" },
    { id: "degree", label: "Degree Progress" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[750px] max-h-[85vh] overflow-hidden mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Plan Courses</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors" aria-label="Close">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm font-medium px-4 py-2.5 border-b-2 transition-colors ${
                tab === t.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === "current" && (
            <CurrentTab courses={courses} />
          )}
          {tab === "add" && (
            <AddTab catalog={availableCatalog} aiNext={aiNext} />
          )}
          {tab === "degree" && (
            <DegreeTab reqs={allReqs} degreeRequirements={degreeRequirements} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Current Courses Tab ── */
function CurrentTab({ courses }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 mb-3">
        {courses.length} courses · {courses.reduce((s, c) => s + c.credits, 0)} credits enrolled
      </p>
      {courses.map(c => (
        <div key={c.id} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-gray-50 border border-gray-100">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{c.code}</span>
              <span className="text-sm text-gray-600">{c.name}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{c.instructor} · {c.credits} credits</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-sm font-semibold tabular-nums ${
              c.grade >= 85 ? "text-green-600" : c.grade >= 70 ? "text-amber-600" : "text-red-600"
            }`}>{c.grade}%</span>
            <button className="text-gray-400 hover:text-red-500 transition-colors" title="Drop course">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Add Courses Tab ── */
function AddTab({ catalog, aiNext }) {
  const [search, setSearch] = useState("");

  const filtered = catalog.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // AI recommended codes
  const aiCodes = aiNext.map(n => n.courseCode);

  return (
    <div>
      {/* AI suggestions */}
      {aiNext.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">AI Recommended</p>
          <div className="space-y-2">
            {aiNext.map((n, i) => {
              const cat = catalog.find(c => c.code === n.courseCode);
              return (
                <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-800">{n.courseCode}</span>
                      {cat && <span className="text-sm text-blue-600">{cat.name}</span>}
                    </div>
                    <p className="text-xs text-blue-500 mt-0.5">{n.reason} · Fulfills: {n.fulfills}</p>
                  </div>
                  <button className="flex items-center gap-1 bg-blue-600 text-white text-xs font-medium px-2.5 py-1.5 rounded-md hover:bg-blue-700 transition-colors flex-shrink-0">
                    <Plus size={12} /> Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search courses…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
      />

      {/* Catalog list */}
      <div className="space-y-1.5">
        {filtered.map((c, i) => (
          <div key={i} className={`flex items-center justify-between py-2.5 px-3 rounded-lg border ${
            aiCodes.includes(c.code) ? "border-blue-200 bg-blue-50/50" : "border-gray-100 hover:bg-gray-50"
          }`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{c.code}</span>
                <span className="text-sm text-gray-600 truncate">{c.name}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {c.instructor} · {c.credits} cr · {c.schedule} · {c.difficulty} · {c.seats} seats
              </p>
            </div>
            <button className="flex items-center gap-1 border border-gray-200 text-gray-600 text-xs font-medium px-2.5 py-1.5 rounded-md hover:bg-gray-50 transition-colors flex-shrink-0">
              <Plus size={12} /> Add
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No courses found</p>
        )}
      </div>
    </div>
  );
}

/* ── Degree Progress Tab ── */
function DegreeTab({ reqs, degreeRequirements }) {
  const sections = ["major", "minor", "genEd"];

  return (
    <div className="space-y-5">
      {sections.map(s => {
        const req = degreeRequirements[s];
        if (!req) return null;
        const items = reqs.filter(r => r.section === s);
        const done = items.filter(r => r.status === "done").length;
        const total = items.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        return (
          <div key={s}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GraduationCap size={14} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">{req.name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {req.completedCredits}/{req.totalCredits} credits · {pct}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
              <div className="h-1.5 bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            {/* Course list */}
            <div className="space-y-1">
              {items.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    {r.status === "done" ? (
                      <CheckCircle2 size={12} className="text-green-500" />
                    ) : r.status === "in-progress" ? (
                      <Clock size={12} className="text-blue-500" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-300" />
                    )}
                    <span className={`font-medium ${r.status === "done" ? "text-gray-400" : "text-gray-700"}`}>
                      {r.code}
                    </span>
                    <span className={r.status === "done" ? "text-gray-400" : "text-gray-600"}>
                      {r.name}
                    </span>
                  </div>
                  <span className={`${
                    r.status === "done" ? "text-green-500" :
                    r.status === "in-progress" ? "text-blue-500" :
                    "text-gray-400"
                  }`}>
                    {r.status === "done" ? "Complete" : r.status === "in-progress" ? "In Progress" : "Needed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
