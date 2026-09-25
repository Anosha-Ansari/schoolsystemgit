const TONES = {
  Active: "bg-emerald-50 text-brand-green",
  Present: "bg-emerald-50 text-brand-green",
  Paid: "bg-emerald-50 text-brand-green",
  Completed: "bg-emerald-50 text-brand-green",
  Inactive: "bg-red-50 text-brand-red",
  Absent: "bg-red-50 text-brand-red",
  Pending: "bg-orange-50 text-orange-500",
  Partial: "bg-orange-50 text-orange-500",
  "On Leave": "bg-orange-50 text-orange-500",
  Late: "bg-orange-50 text-orange-500",
  Upcoming: "bg-blue-50 text-brand-blue",
  Ongoing: "bg-blue-50 text-brand-blue",
  High: "bg-red-50 text-brand-red",
  Medium: "bg-orange-50 text-orange-500",
  Low: "bg-emerald-50 text-brand-green",
};

export default function Pill({ children }) {
  const tone = TONES[children] || "bg-slate-100 text-muted";
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11.5px] font-semibold inline-flex items-center gap-1 ${tone}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
