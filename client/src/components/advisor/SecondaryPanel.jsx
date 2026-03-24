import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { COURSE_CATALOG, DEGREE_REQUIREMENTS, COURSE_GUIDELINES } from "../../data/mockData";

export default function SecondaryPanel({ aiData }) {
  if (!aiData) return null;

  const mathMinor = DEGREE_REQUIREMENTS.minor;
  const mathDone = mathMinor?.required?.filter(r => r.status === "done").length || 0;
  const mathTotal = mathMinor?.required?.length || 0;
  const econMinor = COURSE_GUIDELINES.minorOptions?.find(m => m.name === "Economics Minor");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
      {/* Next Semester Courses */}
      {aiData.nextCourses?.length > 0 && (
        <div style={{
          background: "white", border: "1px solid #E5E7EB",
          borderRadius: 14, padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <BookOpen size={15} color="#3B82F6" />
            <h3 style={{
              fontSize: 10, fontWeight: 600, color: "#9CA3AF",
              textTransform: "uppercase", letterSpacing: "0.05em", margin: 0,
            }}>Next Semester Courses</h3>
          </div>
          {aiData.nextCourses.map((c, i) => {
            const cat = COURSE_CATALOG.find(cc => cc.code === c.courseCode);
            return (
              <div key={i} style={{
                background: "#EFF6FF", border: "1px solid #BFDBFE",
                borderRadius: 8, padding: "10px 12px", marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1E40AF" }}>{c.courseCode}</span>
                  {cat && <span style={{ fontSize: 11, color: "#3B82F6" }}>{cat.seats} seats · {cat.schedule}</span>}
                </div>
                <p style={{ fontSize: 11, color: "#2563EB", margin: "4px 0 0" }}>{c.reason}</p>
                <p style={{ fontSize: 11, color: "#93C5FD", margin: "2px 0 0" }}>Fulfills: {c.fulfills}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Minor Opportunities */}
      <div style={{
        background: "white", border: "1px solid #E5E7EB",
        borderRadius: 14, padding: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <GraduationCap size={15} color="#8B5CF6" />
          <h3 style={{
            fontSize: 10, fontWeight: 600, color: "#9CA3AF",
            textTransform: "uppercase", letterSpacing: "0.05em", margin: 0,
          }}>Minor Opportunities</h3>
        </div>

        {/* Math minor progress */}
        <div style={{
          background: "#F9FAFB", border: "1px solid #F3F4F6",
          borderRadius: 8, padding: "10px 12px", marginBottom: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1F2937" }}>
              {mathMinor?.name || "Mathematics Minor"}
            </span>
            <span style={{ fontSize: 11, color: "#6B7280" }}>{mathDone}/{mathTotal} done</span>
          </div>
          <div style={{ width: "100%", height: 6, background: "#E5E7EB", borderRadius: 3 }}>
            <div style={{
              height: 6, background: "#8B5CF6", borderRadius: 3,
              width: `${mathTotal > 0 ? (mathDone / mathTotal) * 100 : 0}%`,
            }} />
          </div>
          <p style={{ fontSize: 11, color: "#6B7280", margin: "6px 0 0" }}>
            Remaining: {mathMinor?.required?.filter(r => r.status === "needed").map(r => r.code).join(", ")}
          </p>
        </div>

        {/* Economics minor */}
        {econMinor && (
          <div style={{
            background: "#FAF5FF", border: "1px solid #E9D5FF",
            borderRadius: 8, padding: "10px 12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase" }}>Discover</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#581C87" }}>{econMinor.name}</span>
            </div>
            <p style={{ fontSize: 11, color: "#7C3AED", lineHeight: 1.5, margin: 0 }}>
              Only {econMinor.requiredCourses.length} courses needed ({econMinor.totalCredits} credits).
              {econMinor.eligibility}.
            </p>
          </div>
        )}

        {/* AI minor suggestions */}
        {aiData.minorSuggestions?.map((m, i) => (
          <div key={i} style={{
            background: "#FAF5FF", border: "1px solid #E9D5FF",
            borderRadius: 8, padding: "10px 12px", marginTop: 10,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#581C87" }}>{m.minorName}</span>
            <p style={{ fontSize: 11, color: "#7C3AED", margin: "4px 0 0", lineHeight: 1.5 }}>{m.reasoning}</p>
            {m.overlappingCredits > 0 && (
              <p style={{ fontSize: 11, color: "#A78BFA", margin: "4px 0 0" }}>
                {m.overlappingCredits} overlapping credits already earned
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Replace Recommendations */}
      {aiData.replaceRecommendations?.length > 0 && (
        <div style={{
          gridColumn: "1 / -1", background: "white",
          border: "1px solid #E5E7EB", borderRadius: 14, padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <ArrowRight size={15} color="#F59E0B" />
            <h3 style={{
              fontSize: 10, fontWeight: 600, color: "#9CA3AF",
              textTransform: "uppercase", letterSpacing: "0.05em", margin: 0,
            }}>Course Replacements</h3>
          </div>
          {aiData.replaceRecommendations.map((r, i) => {
            const replacement = COURSE_CATALOG.find(c => c.code === r.replacementCode);
            return (
              <div key={i} style={{
                background: "#FFFBEB", border: "1px solid #FDE68A",
                borderRadius: 8, padding: "12px 16px", marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{r.currentCourseCode}</span>
                    <span style={{ color: "#9CA3AF" }}>→</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>{r.replacementCode}</span>
                    {replacement && <span style={{ fontSize: 11, color: "#6B7280" }}>{replacement.name}</span>}
                  </div>
                  {r.expectedGPABenefit != null && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "#15803D",
                      background: "#F0FDF4", padding: "2px 8px", borderRadius: 4,
                    }}>+{r.expectedGPABenefit.toFixed(2)} GPA</span>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "#4B5563", lineHeight: 1.5, margin: 0 }}>{r.reasoning}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
