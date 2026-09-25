import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function StatCard({ icon, iconBg, label, value, delta, deltaTone = "up", to }) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5 text-muted text-[13px]">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[15px] shrink-0"
            style={{ background: iconBg }}
          >
            {icon}
          </div>
          {label}
        </div>
        {to && (
          <span className="w-6 h-6 rounded-full bg-bg flex items-center justify-center text-muted group-hover:bg-brand-blue group-hover:text-white transition-colors shrink-0">
            <ArrowRight size={12} />
          </span>
        )}
      </div>
      <div className="text-2xl font-bold font-heading text-ink">{value}</div>
      {delta && (
        <div className={`text-xs mt-1 ${deltaTone === "up" ? "text-brand-green" : "text-brand-red"}`}>
          {deltaTone === "up" ? "↑" : "↓"} {delta}
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="group block bg-card border border-border rounded-xl2 p-4 card-hover btn-tap">
        {content}
      </Link>
    );
  }
  return <div className="bg-card border border-border rounded-xl2 p-4 card-hover">{content}</div>;
}
