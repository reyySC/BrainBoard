import { useState } from "react";
import { X, Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { COURSES } from "../../data/mockData";

export default function AIDrawer({ visible, onClose, aiData, loading, error, onRetry }) {
  const [expandedCourse, setExpandedCourse] = useState(null);

  if (!visible) return null;

  const insights = aiData?.insights || [];
  const dropRecs = aiData?.dropRecommendations || [];
  const replaceRecs = aiData?.replaceRecommendations || [];
  const nextCourses = aiData?.nextCourses || [];
  const minorSuggestions = aiData?.minorSuggestions || [];

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: 420,
      background: "white", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)",
      zIndex: 100, display: "flex", flexDirection: "column",
      borderLeft: "1px solid #E5E7EB",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid #F3F4F6",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} color="#2563EB" />
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", margin: 0 }}>AI Advisor</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!loading && (
            <button
              onClick={onRetry}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}
              aria-label="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>
            <Sparkles size={24} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p style={{ fontSize: 13 }}>Analyzing your courses...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{
            background: "#FFFBEB", border: "1px solid #FDE68A",
            borderRadius: 10, padding: 14, fontSize: 13, color: "#92400E",
          }}>
            {error}
            <button
              onClick={onRetry}
              style={{
                marginLeft: 8, background: "none", border: "none",
                textDecoration: "underline", cursor: "pointer", fontSize: 12, color: "#92400E",
              }}
            >Retry</button>
          </div>
        )}

        {!loading && !error && aiData && (
          <div>
            {/* Course Insights */}
            {insights.length > 0 && (
              <Section title="Course Insights">
                {insights.map((insight, i) => {
                  const course = COURSES.find(c => c.code === insight.courseCode);
                  const isExpanded = expandedCourse === i;
                  const dropRec = dropRecs.find(d => d.courseCode === insight.courseCode);

                  return (
                    <div key={i} style={{
                      border: "1px solid #E5E7EB", borderRadius: 10,
                      padding: 14, marginBottom: 10,
                    }}>
                      <div
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                        onClick={() => setExpandedCourse(isExpanded ? null : i)}
                      >
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{insight.courseCode}</span>
                          {course && <span style={{ fontSize: 12, color: "#6B7280", marginLeft: 6 }}>{course.grade}%</span>}
                        </div>
                        {isExpanded ? <ChevronUp size={14} color="#9CA3AF" /> : <ChevronDown size={14} color="#9CA3AF" />}
                      </div>
                      <p style={{ fontSize: 12, color: "#374151", margin: "6px 0 0" }}>{insight.title}</p>
                      {isExpanded && (
                        <div style={{ marginTop: 8 }}>
                          <p style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>{insight.description}</p>
                          {dropRec && (
                            <div style={{
                              marginTop: 8, background: "#FEF2F2",
                              border: "1px solid #FECACA", borderRadius: 6, padding: 10,
                            }}>
                              <p style={{ fontSize: 11, fontWeight: 600, color: "#374151", margin: 0 }}>
                                {dropRec.recommend ? "Consider dropping" : "Keep this course"}
                              </p>
                              <p style={{ fontSize: 11, color: "#6B7280", margin: "4px 0 0" }}>{dropRec.reasoning}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Section>
            )}

            {/* Next Courses */}
            {nextCourses.length > 0 && (
              <Section title="Recommended Next Courses">
                {nextCourses.map((c, i) => (
                  <div key={i} style={{
                    background: "#EFF6FF", border: "1px solid #BFDBFE",
                    borderRadius: 8, padding: 10, marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1E40AF" }}>{c.courseCode}</span>
                    <p style={{ fontSize: 11, color: "#2563EB", margin: "2px 0 0" }}>{c.reason}</p>
                  </div>
                ))}
              </Section>
            )}

            {/* Minor Suggestions */}
            {minorSuggestions.length > 0 && (
              <Section title="Minor Suggestions">
                {minorSuggestions.map((m, i) => (
                  <div key={i} style={{
                    background: "#FAF5FF", border: "1px solid #E9D5FF",
                    borderRadius: 8, padding: 10, marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#581C87" }}>{m.minorName}</span>
                    <p style={{ fontSize: 11, color: "#7C3AED", margin: "2px 0 0" }}>{m.reasoning}</p>
                  </div>
                ))}
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{
        fontSize: 10, fontWeight: 600, color: "#9CA3AF",
        textTransform: "uppercase", letterSpacing: "0.05em",
        margin: "0 0 10px",
      }}>{title}</h3>
      {children}
    </div>
  );
}
