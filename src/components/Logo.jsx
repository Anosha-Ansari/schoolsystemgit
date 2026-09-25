import { GraduationCap } from "lucide-react";

const SIZES = {
  sm: { box: "w-8 h-8", icon: 16, text: "text-[15px]", dot: "w-2 h-2" },
  md: { box: "w-10 h-10", icon: 20, text: "text-lg", dot: "w-2.5 h-2.5" },
  lg: { box: "w-16 h-16", icon: 30, text: "text-2xl", dot: "w-4 h-4" },
};

export default function Logo({ size = "md", light = false, stacked = false }) {
  const s = SIZES[size];
  return (
    <div className={`flex items-center gap-2.5 ${stacked ? "flex-col text-center" : ""}`}>
      <div className={`${s.box} relative rounded-2xl bg-gradient-to-br from-brand-blue via-[#5b6fed] to-brand-purple flex items-center justify-center shadow-lg shadow-brand-blue/30 shrink-0`}>
        <GraduationCap size={s.icon} className="text-white" strokeWidth={2.2} />
        <span className={`absolute -top-1 -right-1 ${s.dot} rounded-full bg-brand-orange border-2 border-white`} />
      </div>
      <div className={`font-heading font-extrabold ${s.text} ${light ? "text-white" : "text-navy"} leading-none`}>
        Smart{" "}
        <span className="bg-gradient-to-r from-brand-orange via-brand-pink to-brand-purple bg-clip-text text-transparent">
          School
        </span>
      </div>
    </div>
  );
}
