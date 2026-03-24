import { CalendarDays } from "lucide-react";

export default function DateChip({ label, date, days, urgent }) {
  return (
    <div className="flex items-center gap-2.5">
      <CalendarDays size={14} className={urgent ? "text-red-400" : "text-gray-400"} />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium ${urgent ? "text-red-600" : "text-gray-800"}`}>
          {date}
          <span className={`ml-1.5 text-xs font-normal ${urgent ? "text-red-400" : "text-gray-400"}`}>
            ({days}d)
          </span>
        </p>
      </div>
    </div>
  );
}
