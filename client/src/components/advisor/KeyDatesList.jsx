import { CalendarDays } from "lucide-react";
import { ACADEMIC_DATES } from "../../data/mockData";

export default function KeyDatesList() {
  const dates = [
    {
      label: "Drop Deadline",
      date: ACADEMIC_DATES.dropDeadline,
      days: ACADEMIC_DATES.dropDaysLeft,
      urgent: ACADEMIC_DATES.dropDaysLeft <= 14,
    },
    {
      label: "Withdraw Deadline",
      date: ACADEMIC_DATES.withdrawDeadline,
      days: ACADEMIC_DATES.withdrawDaysLeft,
      urgent: false,
    },
    {
      label: "Fall Registration",
      date: ACADEMIC_DATES.fallRegistrationOpen,
      days: Math.max(0, ACADEMIC_DATES.dropDaysLeft + 10),
      urgent: false,
    },
    {
      label: "Registration Closes",
      date: ACADEMIC_DATES.fallRegistrationClose,
      days: Math.max(0, ACADEMIC_DATES.dropDaysLeft + 25),
      urgent: false,
    },
  ];

  return (
    <div style={{
      background: "white", border: "1px solid #E5E7EB",
      borderRadius: 14, padding: 20, marginTop: 16,
    }}>
      <h3 style={{
        fontSize: 10, fontWeight: 500, color: "#9CA3AF",
        textTransform: "uppercase", letterSpacing: "0.05em",
        margin: "0 0 12px",
      }}>Key Dates</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {dates.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CalendarDays size={14} color={d.urgent ? "#F87171" : "#9CA3AF"} />
            <div>
              <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>{d.label}</p>
              <p style={{
                fontSize: 13, fontWeight: 500, margin: "2px 0 0",
                color: d.urgent ? "#DC2626" : "#1F2937",
              }}>
                {d.date}
                <span style={{
                  marginLeft: 6, fontSize: 11, fontWeight: 400,
                  color: d.urgent ? "#F87171" : "#9CA3AF",
                }}>({d.days}d)</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
