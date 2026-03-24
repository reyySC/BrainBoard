/**
 * DegreePlanningSection — AI-augmented degree planning with three sub-sections:
 *   1. Next Course Suggestions (chips with code, name, reason, confidence, seats, schedule)
 *   2. Minor Suggestions (overlapping credits, remaining courses, reasoning, confidence)
 *   3. Drop/Replace Recommendations (GPA projections, reasoning, confidence)
 *
 * All AI suggestions labeled with "AI Recommendation" badge.
 * Skeleton loaders shown when data is null (loading).
 * No actions auto-execute; all require explicit button click.
 */

/* ── Skeleton helpers ── */
function SkeletonBlock({ width = "100%", height = 16, borderRadius = 8, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius, background: "#E2E8F0",
      animation: "skeletonPulse 1.5s ease-in-out infinite",
      ...style,
    }} />
  );
}

function SkeletonCard({ lines = 3, style = {} }) {
  return (
    <div style={{
      background: "white", borderRadius: 16, border: "1px solid var(--border)",
      padding: "22px 24px", ...style,
    }}>
      <SkeletonBlock width="40%" height={14} style={{ marginBottom: 12 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          width={i === lines - 1 ? "60%" : "90%"}
          height={12}
          style={{ marginBottom: i < lines - 1 ? 10 : 0 }}
        />
      ))}
    </div>
  );
}

/* ── Shared styles ── */
const card = {
  background: "white", borderRadius: 16, border: "1px solid var(--border)",
  padding: "22px 24px", marginBottom: 0,
};

const aiBadge = {
  fontSize: 10, fontWeight: 700, color: "#D97706", background: "#FEF3C7",
  padding: "2px 8px", borderRadius: 4, display: "inline-block",
};

const chipBadge = (bg, color) => ({
  fontSize: 10, fontWeight: 600, color, background: bg,
  padding: "2px 8px", borderRadius: 4, display: "inline-block",
});

function confidenceColor(level) {
  if (level === "high") return { bg: "#DCFCE7", color: "#16A34A" };
  if (level === "medium") return { bg: "#FEF3C7", color: "#92400E" };
  return { bg: "#F1F5F9", color: "#64748B" }; // low / muted
}

function ConfidenceBadge({ level }) {
  const c = confidenceColor(level);
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: c.color, background: c.bg,
      padding: "2px 8px", borderRadius: 4,
    }}>
      {level ? level.charAt(0).toUpperCase() + level.slice(1) : "—"} confidence
    </span>
  );
}

/* ── Sub-section header ── */
function SubHeader({ icon, title, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{title}</span>
      {count != null && (
        <span style={{
          fontSize: 10, fontWeight: 700, color: "var(--blue)", background: "#DBEAFE",
          padding: "1px 8px", borderRadius: 10,
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ message }) {
  return (
    <div style={{
      ...card, textAlign: "center", color: "var(--muted)", fontSize: 13, padding: "18px 24px",
    }}>
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. Next Course Suggestions
   ═══════════════════════════════════════════════════════════════ */
function NextCourseSuggestions({ nextCourses, courseCatalog }) {
  if (nextCourses === null) {
    return (
      <>
        <SubHeader icon="📘" title="Next Course Suggestions" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[1, 2].map(i => <SkeletonCard key={i} lines={2} />)}
        </div>
      </>
    );
  }

  if (!nextCourses || nextCourses.length === 0) {
    return (
      <>
        <SubHeader icon="📘" title="Next Course Suggestions" count={0} />
        <EmptyState message="No next-course suggestions available." />
      </>
    );
  }

  return (
    <>
      <SubHeader icon="📘" title="Next Course Suggestions" count={nextCourses.length} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {nextCourses.map((nc, i) => {
          const cat = (courseCatalog || []).find(c => c.code === nc.courseCode);
          return (
            <div key={i} style={{
              ...card,
              background: "linear-gradient(135deg, #F8FAFC, #F0FDF4)",
            }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
                  {nc.courseCode}
                </span>
                {cat && (
                  <span style={{ fontSize: 12, color: "var(--slate)" }}>{cat.name}</span>
                )}
              </div>

              {/* Reason */}
              <div style={{ fontSize: 11, color: "var(--slate)", marginBottom: 8, lineHeight: 1.5 }}>
                {nc.reason}
              </div>

              {/* Badges row */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={aiBadge}>AI Recommendation</span>
                <ConfidenceBadge level={nc.confidenceScore} />
                {nc.fulfills && (
                  <span style={chipBadge("var(--light)", "var(--muted)")}>
                    {nc.fulfills}
                  </span>
                )}
              </div>

              {/* Seats & schedule */}
              {cat && (
                <div style={{
                  display: "flex", gap: 10, marginTop: 8, fontSize: 10, color: "var(--muted)",
                }}>
                  <span>🪑 {cat.seats} seats</span>
                  <span>🕐 {cat.schedule}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. Minor Suggestions
   ═══════════════════════════════════════════════════════════════ */
function MinorSuggestions({ minorSuggestions }) {
  if (minorSuggestions === null) {
    return (
      <>
        <SubHeader icon="📎" title="Minor Suggestions" />
        <SkeletonCard lines={3} />
      </>
    );
  }

  if (!minorSuggestions || minorSuggestions.length === 0) {
    return (
      <>
        <SubHeader icon="📎" title="Minor Suggestions" count={0} />
        <EmptyState message="No minor suggestions available." />
      </>
    );
  }

  return (
    <>
      <SubHeader icon="📎" title="Minor Suggestions" count={minorSuggestions.length} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {minorSuggestions.map((ms, i) => (
          <div key={i} style={{
            ...card,
            background: "linear-gradient(135deg, #F8FAFC, #EFF6FF)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>
                {ms.minorName || ms.name}
              </span>
              <span style={aiBadge}>Suggested by AI</span>
              <ConfidenceBadge level={ms.confidenceScore} />
            </div>

            {/* Overlapping credits */}
            <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>Overlapping credits:</span>{" "}
              {ms.overlappingCredits ?? "—"}
            </div>

            {/* Remaining courses */}
            {ms.remainingCourses && ms.remainingCourses.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--slate)", marginBottom: 4 }}>
                  Remaining courses:
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ms.remainingCourses.map((rc, j) => (
                    <span key={j} style={chipBadge("#F1F5F9", "#475569")}>
                      {rc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reasoning */}
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
              {ms.reasoning}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. Drop / Replace Recommendations
   ═══════════════════════════════════════════════════════════════ */
function DropReplaceRecommendations({ dropRecommendations, replaceRecommendations }) {
  const isDropLoading = dropRecommendations === null;
  const isReplaceLoading = replaceRecommendations === null;

  if (isDropLoading && isReplaceLoading) {
    return (
      <>
        <SubHeader icon="🔄" title="Drop / Replace Recommendations" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[1, 2].map(i => <SkeletonCard key={i} lines={3} />)}
        </div>
      </>
    );
  }

  const drops = dropRecommendations || [];
  const replaces = replaceRecommendations || [];
  const total = drops.length + replaces.length;

  if (total === 0) {
    return (
      <>
        <SubHeader icon="🔄" title="Drop / Replace Recommendations" count={0} />
        <EmptyState message="No drop or replace recommendations at this time." />
      </>
    );
  }

  return (
    <>
      <SubHeader icon="🔄" title="Drop / Replace Recommendations" count={total} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Drop recommendations */}
        {drops.map((dr, i) => (
          <div key={`drop-${i}`} style={{
            ...card,
            background: dr.recommend
              ? "linear-gradient(135deg, #FEF2F2, #FFF7ED)"
              : "linear-gradient(135deg, #F8FAFC, #F0FDF4)",
            borderLeft: dr.recommend ? "4px solid #EF4444" : "4px solid #22C55E",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
                {dr.courseCode}
              </span>
              <span style={chipBadge(
                dr.recommend ? "#FEE2E2" : "#DCFCE7",
                dr.recommend ? "#DC2626" : "#16A34A"
              )}>
                {dr.recommend ? "Consider Dropping" : "Keep Course"}
              </span>
              <span style={aiBadge}>AI Recommendation</span>
              <ConfidenceBadge level={dr.confidenceScore} />
            </div>

            {/* GPA projections */}
            <div style={{
              display: "flex", gap: 16, marginBottom: 8, fontSize: 12,
            }}>
              {dr.projectedGPAWith != null && (
                <div>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>GPA with course: </span>
                  <span style={{ fontWeight: 700, color: "var(--navy)" }}>
                    {Number(dr.projectedGPAWith).toFixed(2)}
                  </span>
                </div>
              )}
              {dr.projectedGPAWithout != null && (
                <div>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>GPA without: </span>
                  <span style={{ fontWeight: 700, color: "#16A34A" }}>
                    {Number(dr.projectedGPAWithout).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Reasoning */}
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
              {dr.reasoning}
            </div>
          </div>
        ))}

        {/* Replace recommendations */}
        {replaces.map((rr, i) => (
          <div key={`replace-${i}`} style={{
            ...card,
            background: "linear-gradient(135deg, #F8FAFC, #EFF6FF)",
            borderLeft: "4px solid #3B82F6",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
                {rr.currentCourseCode}
              </span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>→</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#3B82F6" }}>
                {rr.replacementCode}
              </span>
              <span style={chipBadge("#DBEAFE", "#2563EB")}>Replace</span>
              <span style={aiBadge}>AI Recommendation</span>
              <ConfidenceBadge level={rr.confidenceScore} />
            </div>

            {/* Difficulty comparison & GPA benefit */}
            <div style={{ display: "flex", gap: 16, marginBottom: 8, fontSize: 12 }}>
              {rr.difficultyComparison && (
                <div>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>Difficulty: </span>
                  <span style={{ color: "var(--slate)" }}>{rr.difficultyComparison}</span>
                </div>
              )}
              {rr.expectedGPABenefit != null && (
                <div>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>GPA benefit: </span>
                  <span style={{ fontWeight: 700, color: "#16A34A" }}>
                    +{Number(rr.expectedGPABenefit).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Reasoning */}
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
              {rr.reasoning}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main DegreePlanningSection Component
   ═══════════════════════════════════════════════════════════════ */
export default function DegreePlanningSection({
  nextCourses = null,
  minorSuggestions = null,
  dropRecommendations = null,
  replaceRecommendations = null,
  courseCatalog = [],
  error = false,
}) {
  // If there's an error and all data is empty, show a single error state
  const allEmpty =
    (!nextCourses || nextCourses.length === 0) &&
    (!minorSuggestions || minorSuggestions.length === 0) &&
    (!dropRecommendations || dropRecommendations.length === 0) &&
    (!replaceRecommendations || replaceRecommendations.length === 0);

  const isLoading =
    nextCourses === null &&
    minorSuggestions === null &&
    dropRecommendations === null &&
    replaceRecommendations === null;

  if (error && !isLoading && allEmpty) {
    return (
      <div style={{
        background: "white", borderRadius: 16, border: "1px solid var(--border)",
        padding: "22px 24px", textAlign: "center", color: "var(--muted)", fontSize: 13,
      }}>
        Degree planning suggestions require AI analysis. Retry to load.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 1. Next Course Suggestions */}
      <NextCourseSuggestions nextCourses={nextCourses} courseCatalog={courseCatalog} />

      {/* 2. Minor Suggestions */}
      <MinorSuggestions minorSuggestions={minorSuggestions} />

      {/* 3. Drop / Replace Recommendations */}
      <DropReplaceRecommendations
        dropRecommendations={dropRecommendations}
        replaceRecommendations={replaceRecommendations}
      />
    </div>
  );
}
