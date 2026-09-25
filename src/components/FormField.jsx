import { CheckCircle2 } from "lucide-react";

export function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="text-[12.5px] font-semibold text-ink block mb-1.5">
        {label} {required && <span className="text-brand-red">*</span>}
      </label>
      {children}
      {hint && <div className="text-[11px] text-muted mt-1">{hint}</div>}
    </div>
  );
}

export function Input(props) {
  return <input {...props} className={"w-full border border-border rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-brand-blue " + (props.className || "")} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={"w-full border border-border rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-brand-blue bg-card " + (props.className || "")}>
      {children}
    </select>
  );
}

export function SectionTitle({ step, title, desc }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-1">
      {step && (
        <span className="w-7 h-7 rounded-full bg-brand-blue text-white text-[12.5px] font-bold flex items-center justify-center shrink-0">
          {step}
        </span>
      )}
      <div>
        <h4 className="font-heading font-semibold text-[14.5px]">{title}</h4>
        {desc && <p className="text-muted text-[12px]">{desc}</p>}
      </div>
    </div>
  );
}

export function SuccessBanner({ show, text }) {
  if (!show) return null;
  return (
    <div className="bg-emerald-50 border border-emerald-200 text-brand-green text-[13px] font-semibold px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
      <CheckCircle2 size={16} /> {text}
    </div>
  );
}
