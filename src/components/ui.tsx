import { createContext, useContext, useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Inbox,
  Info,
  LayoutGrid,
  List,
  Loader2,
  Lock,
  MoreHorizontal,
  Printer,
  RotateCcw,
  Search,
  Settings2,
  ShieldAlert,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { toast, useCountUp, useToastStore, type Toast } from "@/lib/store";
import { exportCSV, exportExcel, exportPDF, exportColumnsOf } from "@/lib/api";

/* ------------------------------------------------------------- Button */

type BtnVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading,
  className,
  ...rest
}: {
  children?: ReactNode;
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg" | "xs";
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<BtnVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    ghost: "btn-ghost",
    danger: "btn-danger",
  };
  const sizes = { xs: "px-2.5 py-1.5 text-[0.72rem]", sm: "px-3 py-2 text-[0.8rem]", md: "", lg: "px-5 py-3 text-[0.95rem]" };
  return (
    <button className={cn(variants[variant], sizes[size], className)} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
      {iconRight}
    </button>
  );
}

export function IconButton({ label, children, className, active, ...rest }: { label: string; children: ReactNode; active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-primary-400 hover:text-primary-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white",
        active && "border-primary-400 bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-white",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* --------------------------------------------------------------- Card */

export function Card({ children, className, hover = false, as: Tag = "div" }: { children: ReactNode; className?: string; hover?: boolean; as?: "div" | "section" | "article" | "li" }) {
  return <Tag className={cn("card-saas", hover && "card-hover", className)}>{children}</Tag>;
}

export function CardHeader({ title, subtitle, action, icon, className }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-white/8", className)}>
      <div className="flex items-start gap-3">
        {icon && <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/12 dark:text-primary-300">{icon}</span>}
        <div>
          <h3 className="text-[0.98rem] font-bold leading-tight">{title}</h3>
          {subtitle && <p className="mt-1 text-[0.78rem] text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* -------------------------------------------------------------- Badge */

type Tone = "primary" | "success" | "danger" | "warn" | "analytics" | "muted";
export function Badge({ children, tone = "muted", className, dot }: { children: ReactNode; tone?: Tone; className?: string; dot?: boolean }) {
  const classes: Record<Tone, string> = {
    primary: "badge-primary",
    success: "badge-success",
    danger: "badge-danger",
    warn: "badge-warn",
    analytics: "badge-analytics",
    muted: "badge-muted",
  };
  return (
    <span className={cn(classes[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export const statusTone = (status: string): Tone => {
  const s = status.toLowerCase();
  if (["paid", "present", "active", "approved", "operational", "published", "completed", "available", "returned", "verified", "submitted"].some((k) => s.includes(k))) return "success";
  if (["overdue", "absent", "rejected", "degraded", "suspended", "failed", "f", "high"].some((k) => s.includes(k))) return "danger";
  if (["pending", "partial", "late", "leave", "processing", "maintenance", "degraded", "medium", "important", "ongoing", "grading", "closed"].some((k) => s.includes(k))) return "warn";
  if (["unpaid", "scheduled", "upcoming", "info", "issued", "open", "new"].some((k) => s.includes(k))) return "primary";
  return "muted";
};

/* -------------------------------------------------------------- Avatar */

export function Avatar({ name, size = 36, ring, className }: { name: string; size?: number; ring?: boolean; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-numeric font-bold text-white", ring && "ring-2 ring-white dark:ring-ink", className)}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, hsl(${hue} 78% 52%), hsl(${(hue + 42) % 360} 72% 42%))` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/* -------------------------------------------------------------- Fields */

export function Field({ label, children, hint, error, required, className }: { label?: string; children: ReactNode; hint?: string; error?: string; required?: boolean; className?: string }) {
  return (
    <div className={className}>
      {label && (
        <label className="label-saas">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      {children}
      {error ? <p className="mt-1.5 text-[0.72rem] font-medium text-danger-500">{error}</p> : hint ? <p className="mt-1.5 text-[0.72rem] text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function Input({ className, icon, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  if (!icon) return <input className={cn("input-saas", className)} {...rest} />;
  return (
    <span className="relative block">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">{icon}</span>
      <input className={cn("input-saas pl-10", className)} {...rest} />
    </span>
  );
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("input-saas appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9", className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")" }} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("input-saas min-h-24 resize-y", className)} {...rest} />;
}

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>}
          {description && <span className="mt-0.5 block text-[0.76rem] text-slate-500 dark:text-slate-400">{description}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300", checked ? "bg-primary-500" : "bg-slate-300 dark:bg-white/15")}
      >
        <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }} className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm", checked ? "left-5.5" : "left-0.5")} />
      </button>
    </label>
  );
}

/* --------------------------------------------------------------- Tabs */

export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { id: T; label: string; icon?: ReactNode; badge?: string | number }[]; value: T; onChange: (id: T) => void; className?: string }) {
  return (
    <div className={cn("no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5", className)} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn("relative flex shrink-0 items-center gap-2 whitespace-nowrap", "pill-tab", value === t.id && "pill-tab-active")}
        >
          {value === t.id && <motion.span layoutId={`tab-${useId()}`} className="absolute inset-0 rounded-full bg-primary-500" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="relative z-10 flex items-center gap-2">
            {t.icon}
            {t.label}
            {t.badge !== undefined && <span className={cn("rounded-full px-1.5 py-0.5 text-[0.62rem] font-bold", value === t.id ? "bg-white/25" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300")}>{t.badge}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

export function SegmentedControl<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={cn("rounded-lg px-3 py-1.5 text-[0.75rem] font-semibold transition", value === o.id ? "bg-white text-primary-600 shadow-sm dark:bg-white/12 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- Modal */

const ModalCtx = createContext<(() => void) | null>(null);
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  icon,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  icon?: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  const widths = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="scrim" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn("glass-strong relative z-50 my-8 w-full rounded-3xl", widths[size])}
          >
            <ModalCtx.Provider value={onClose}>
              <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-6 py-5 dark:border-white/10">
                <div className="flex items-start gap-3">
                  {icon && <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">{icon}</span>}
                  <div>
                    <h3 className="text-[1.05rem] font-bold">{title}</h3>
                    {subtitle && <p className="mt-1 text-[0.8rem] text-slate-500 dark:text-slate-400">{subtitle}</p>}
                  </div>
                </div>
                <IconButton label="Close dialog" onClick={onClose}>
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
              <div className="px-6 py-5">{children}</div>
              {footer && <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-200/70 px-6 py-4 dark:border-white/10">{footer}</div>}
            </ModalCtx.Provider>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export const useModalClose = () => useContext(ModalCtx) ?? (() => {});

/* ------------------------------------------------------------- Drawer */

export function Drawer({ open, onClose, title, children, footer, width = "max-w-xl", side = "right" }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; width?: string; side?: "right" | "left" }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="scrim" onClick={onClose} />
          <motion.aside
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className={cn("glass-strong absolute top-0 flex h-full w-full flex-col", side === "right" ? "right-0" : "left-0", width)}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/70 px-6 py-4 dark:border-white/10">
              <h3 className="text-[1rem] font-bold">{title}</h3>
              <IconButton label="Close panel" onClick={onClose}>
                <X className="h-4 w-4" />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2.5 border-t border-slate-200/70 px-6 py-4 dark:border-white/10">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------- Toaster */

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  const icons: Record<Toast["tone"], ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-success-500" />,
    error: <XCircle className="h-5 w-5 text-danger-500" />,
    info: <Info className="h-5 w-5 text-primary-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-secondary-500" />,
  };
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[90] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2.5 px-4 sm:right-6 sm:left-auto sm:translate-x-0" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="glass-strong pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3.5"
          >
            {icons[t.tone]}
            <div className="min-w-0 flex-1">
              <p className="text-[0.86rem] font-semibold text-slate-900 dark:text-white">{t.title}</p>
              {t.message && <p className="mt-0.5 text-[0.78rem] text-slate-500 dark:text-slate-400">{t.message}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-slate-400 transition hover:text-slate-700 dark:hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------- Loaders / states */

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("skeleton", className)} style={style} />;
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2.5 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={cn("h-4", c === 0 ? "w-40" : c === cols - 1 ? "w-20" : "w-24")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="flex items-end gap-3 p-6" style={{ height }}>
      {[40, 65, 52, 80, 46, 72, 58, 88, 62, 76].map((h, i) => (
        <Skeleton key={i} className="w-full" style={{ height: `${h}%` } as React.CSSProperties} />
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, message, action, secondary, className }: { icon?: ReactNode; title: string; message: string; action?: ReactNode; secondary?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center dark:border-white/12 dark:bg-white/3", className)}>
      <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary-500 shadow-soft dark:bg-white/8 dark:text-primary-300">
        <span className="absolute inset-0 animate-ping-slow rounded-2xl bg-primary-500/20" />
        {icon ?? <Inbox className="h-7 w-7" />}
      </span>
      <h3 className="mt-5 text-base font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-[0.84rem] text-slate-500 dark:text-slate-400">{message}</p>
      {(action || secondary) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {action}
          {secondary}
        </div>
      )}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: { title?: string; message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-danger-500/25 bg-danger-100/40 px-6 py-12 text-center dark:bg-danger-500/8">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-danger-500 shadow-soft dark:bg-white/8">
        <ShieldAlert className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-[0.84rem] text-slate-500 dark:text-slate-400">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" icon={<RotateCcw className="h-4 w-4" />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function ProgressBar({ value, tone = "primary", showLabel, className, animated }: { value: number; tone?: Tone; showLabel?: boolean; className?: string; animated?: boolean }) {
  const fill: Record<Tone, string> = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600",
    success: "bg-gradient-to-r from-success-400 to-success-500",
    danger: "bg-gradient-to-r from-danger-400 to-danger-500",
    warn: "bg-gradient-to-r from-secondary-300 to-secondary-500",
    analytics: "bg-gradient-to-r from-analytics-400 to-analytics-500",
    muted: "bg-slate-400",
  };
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="progress-track">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, value))}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className={cn("h-full rounded-full", fill[tone], animated && "animate-stripes")} />
      </div>
      {showLabel && <span className="w-10 shrink-0 text-right font-numeric text-[0.75rem] font-bold text-slate-600 dark:text-slate-300">{value}%</span>}
    </div>
  );
}

export function RadialProgress({ value, size = 88, stroke = 9, label, tone = "#0F5FFF" }: { value: number; size?: number; stroke?: number; label?: string; tone?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const animated = useCountUp(value, 1100);
  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-200 dark:stroke-white/10" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={tone}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * Math.min(100, value)) / 100 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="block font-numeric text-[1.05rem] font-bold text-slate-900 dark:text-white">{animated}%</span>
        {label && <span className="block text-[0.58rem] font-semibold uppercase tracking-wide text-slate-400">{label}</span>}
      </span>
    </div>
  );
}

/* --------------------------------------------------------------- KPI */

export function StatCard({
  label,
  value,
  suffix = "",
  icon,
  delta,
  tone = "primary",
  hint,
  spark,
  decimals = 0,
  prefix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: ReactNode;
  delta?: number;
  tone?: Tone;
  hint?: string;
  spark?: number[];
  decimals?: number;
  prefix?: string;
}) {
  const animated = useCountUp(value, 1300, decimals);
  const tones: Record<Tone, string> = {
    primary: "from-primary-500/12 text-primary-600 dark:text-primary-300",
    success: "from-success-500/12 text-success-600 dark:text-success-400",
    danger: "from-danger-500/12 text-danger-600 dark:text-danger-400",
    warn: "from-secondary-400/16 text-secondary-600 dark:text-secondary-300",
    analytics: "from-analytics-500/12 text-analytics-600 dark:text-analytics-400",
    muted: "from-slate-400/12 text-slate-600 dark:text-slate-300",
  };
  const max = spark ? Math.max(...spark) : 1;
  return (
    <Card hover className="relative overflow-hidden p-5">
      <div className={cn("pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-gradient-to-b to-transparent blur-2xl", tones[tone])} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
          <p className="stat-number mt-2 text-[1.7rem] leading-none sm:text-[2rem]">
            {prefix}
            {animated.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            <span className="ml-0.5 text-[0.9rem] font-semibold text-slate-400">{suffix}</span>
          </p>
        </div>
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-b to-transparent", tones[tone])}>{icon}</span>
      </div>
      <div className="relative mt-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          {delta !== undefined && (
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-bold", delta >= 0 ? "bg-success-100 text-success-600 dark:bg-success-500/12 dark:text-success-400" : "bg-danger-100 text-danger-600 dark:bg-danger-500/12 dark:text-danger-400")}>
              {delta >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-[0.72rem] text-slate-400">{hint}</span>}
        </span>
        {spark && (
          <span className="flex h-8 items-end gap-0.5" aria-hidden="true">
            {spark.map((s, i) => (
              <span key={i} className="w-1.5 rounded-full bg-primary-400/60 dark:bg-primary-400/40" style={{ height: `${Math.max(14, (s / max) * 100)}%` }} />
            ))}
          </span>
        )}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------- Data table */

export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => ReactNode;
  hideOnMobile?: boolean;
};

export function DataTable<T extends object>({
  columns,
  rows,
  total,
  page,
  pageSize,
  pages,
  onPage,
  onPageSize,
  search,
  onSearch,
  searchPlaceholder = "Search…",
  sortBy,
  sortDir,
  onSort,
  filters,
  onFiltersChange,
  filterOptions,
  selected,
  onSelect,
  bulkActions,
  onRowClick,
  loading,
  empty,
  exportName = "export",
  toolbarExtra,
  serverHint,
}: {
  columns: Column<T>[];
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  onPage: (p: number) => void;
  onPageSize?: (s: number) => void;
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
  filters?: Record<string, string>;
  onFiltersChange?: (f: Record<string, string>) => void;
  filterOptions?: { key: string; label: string; options: string[] }[];
  selected?: string[];
  onSelect?: (ids: string[]) => void;
  bulkActions?: ReactNode;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  empty?: ReactNode;
  exportName?: string;
  toolbarExtra?: ReactNode;
  serverHint?: string;
}) {
  const [visible, setVisible] = useState<string[]>(columns.map((c) => c.key));
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const allSelected = rows.length > 0 && selected?.length === rows.length;

  const shown = columns.filter((c) => visible.includes(c.key));
  const asRecords = rows as unknown as Record<string, unknown>[];
  const exportCols = exportColumnsOf((rows[0] ?? {}) as Record<string, unknown>);
  const activeFilters = Object.values(filters ?? {}).filter((v) => v && v !== "All").length;

  const toggleSort = (key: string) => onSort?.(key);
  const sortIcon = (key: string) =>
    sortBy !== key ? <ArrowUpDown className="h-3.5 w-3.5 opacity-40" /> : sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary-500" /> : <ArrowDown className="h-3.5 w-3.5 text-primary-500" />;

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-white/8">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="min-w-[13rem] flex-1">
            <Input value={search} onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)} placeholder={searchPlaceholder} icon={<Search className="h-4 w-4" />} />
          </div>

          {filterOptions && filterOptions.length > 0 && (
            <Button variant={filtersOpen || activeFilters ? "primary" : "outline"} icon={<Filter className="h-4 w-4" />} onClick={() => setFiltersOpen((v) => !v)}>
              Filters {activeFilters > 0 && <span className="rounded-full bg-white/25 px-1.5 text-[0.65rem]">{activeFilters}</span>}
            </Button>
          )}

          <div className="relative">
            <Button variant="outline" icon={<Columns3 className="h-4 w-4" />} onClick={() => setColumnsOpen((v) => !v)}>
              Columns
            </Button>
            {columnsOpen && (
              <div className="glass-strong absolute right-0 z-30 mt-2 w-56 rounded-2xl p-3">
                {columns.map((c) => (
                  <label key={c.key} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[0.8rem] hover:bg-slate-100 dark:hover:bg-white/8">
                    <input
                      type="checkbox"
                      checked={visible.includes(c.key)}
                      onChange={() => setVisible((v) => (v.includes(c.key) ? v.filter((k) => k !== c.key) : [...v, c.key]))}
                      className="h-3.5 w-3.5 accent-primary-500"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          <Button variant="outline" icon={density === "compact" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />} onClick={() => setDensity((d) => (d === "compact" ? "comfortable" : "compact"))}>
            {density === "compact" ? "Compact" : "Comfort"}
          </Button>

          <div className="relative">
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => exportCSV(asRecords, exportCols, exportName)}>
              Export
            </Button>
          </div>

          <Button variant="ghost" icon={<FileSpreadsheet className="h-4 w-4" />} onClick={() => { exportExcel(asRecords, exportCols, exportName); toast.success("Excel export ready", `${exportName}.xls downloaded.`); }}>
            Excel
          </Button>
          <Button variant="ghost" icon={<Printer className="h-4 w-4" />} onClick={() => exportPDF(exportName)}>
            PDF
          </Button>
          {toolbarExtra}
        </div>

        {filtersOpen && filterOptions && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid gap-3 overflow-hidden sm:grid-cols-3 lg:grid-cols-4">
            {filterOptions.map((f) => (
              <Field key={f.key} label={f.label}>
                <Select value={filters?.[f.key] ?? "All"} onChange={(e) => onFiltersChange?.({ ...(filters ?? {}), [f.key]: e.target.value })}>
                  <option value="All">All {f.label}</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </Select>
              </Field>
            ))}
            <div className="flex items-end">
              <Button variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={() => onFiltersChange?.({})}>
                Reset filters
              </Button>
            </div>
          </motion.div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.76rem] text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{rows.length}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{total.toLocaleString()}</span> records
            {serverHint && <span className="ml-2 text-slate-400">· {serverHint}</span>}
          </p>
          {selected && selected.length > 0 && (
            <div className="flex items-center gap-2.5">
              <Badge tone="primary">{selected.length} selected</Badge>
              {bulkActions}
              <Button variant="ghost" size="sm" onClick={() => onSelect?.([])}>
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-saas min-w-full">
          <thead>
            <tr>
              {selected && onSelect && (
                <th className="w-10">
                  <input type="checkbox" aria-label="Select all rows" checked={!!allSelected} onChange={() => onSelect(allSelected ? [] : rows.map((r) => String(r.id)))} className="h-3.5 w-3.5 accent-primary-500" />
                </th>
              )}
              {shown.map((c) => (
                <th key={c.key} className={cn(c.className, c.hideOnMobile && "hidden md:table-cell")}>
                  {c.sortable ? (
                    <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1.5 transition hover:text-primary-600 dark:hover:text-white">
                      {c.label} {sortIcon(c.key)}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: Math.min(6, pageSize) }).map((_, i) => (
                <tr key={i}>
                  {selected && onSelect && <td />}
                  {shown.map((c) => (
                    <td key={c.key}>
                      <Skeleton className="h-4 w-full max-w-[10rem]" />
                    </td>
                  ))}
                </tr>
              ))}
            {!loading &&
              rows.map((row, idx) => (
                <motion.tr
                  key={String(row.id ?? idx)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.24) }}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer", density === "compact" && "[&>td]:py-2")}
                >
                  {selected && onSelect && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={selected.includes(String(row.id))}
                        onChange={() => onSelect(selected.includes(String(row.id)) ? selected.filter((i) => i !== String(row.id)) : [...selected, String(row.id)])}
                        className="h-3.5 w-3.5 accent-primary-500"
                      />
                    </td>
                  )}
                  {shown.map((c) => (
                    <td key={c.key} className={cn(c.className, c.hideOnMobile && "hidden md:table-cell")}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "—")}
                    </td>
                  ))}
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && rows.length === 0 && (empty ?? <EmptyState title="No records found" message="Adjust your search or filters to widen the result set." />)}

      {/* Pagination */}
      {!loading && rows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-white/8">
          <div className="flex items-center gap-2.5">
            <span className="text-[0.76rem] text-slate-500 dark:text-slate-400">Rows per page</span>
            <Select value={String(pageSize)} onChange={(e) => onPageSize?.(Number(e.target.value))} className="w-20 py-1.5 text-[0.78rem]">
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-1.5">
            <IconButton label="First page" onClick={() => onPage(1)} disabled={page === 1} className="disabled:opacity-40">
              <ChevronsLeft className="h-4 w-4" />
            </IconButton>
            <IconButton label="Previous page" onClick={() => onPage(page - 1)} disabled={page === 1} className="disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </IconButton>
            <span className="px-2 font-numeric text-[0.8rem] font-semibold text-slate-600 dark:text-slate-300">
              {page} / {pages}
            </span>
            <IconButton label="Next page" onClick={() => onPage(page + 1)} disabled={page === pages} className="disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </IconButton>
            <IconButton label="Last page" onClick={() => onPage(pages)} disabled={page === pages} className="disabled:opacity-40">
              <ChevronsRight className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------------------------------------------------------- Page shell */

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  badge,
  icon,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; to?: string }[];
  actions?: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="animate-slide-up">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2.5 flex flex-wrap items-center gap-1.5 text-[0.72rem] text-slate-400">
            {breadcrumb.map((b, i) => (
              <span key={b.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                <span className={i === breadcrumb.length - 1 ? "font-semibold text-slate-600 dark:text-slate-300" : ""}>{b.label}</span>
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {icon && <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-[0_12px_30px_-14px_rgba(15,95,255,0.9)]">{icon}</span>}
          <h1 className="text-[1.5rem] leading-tight sm:text-[1.85rem]">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="mt-2 max-w-3xl text-[0.86rem] text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------- Timeline */

export function Timeline({ items }: { items: { title: string; meta?: string; body?: string; tone?: Tone; icon?: ReactNode }[] }) {
  return (
    <ol className="relative space-y-5 pl-6">
      <span className="absolute top-1 bottom-1 left-2 w-px bg-gradient-to-b from-primary-400/60 via-slate-200 to-transparent dark:via-white/10" />
      {items.map((it, i) => (
        <motion.li key={it.title} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="relative">
          <span
            className={cn(
              "absolute -left-[1.35rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-white dark:border-ink",
              it.tone === "success" ? "bg-success-500" : it.tone === "danger" ? "bg-danger-500" : it.tone === "warn" ? "bg-secondary-400" : it.tone === "analytics" ? "bg-analytics-500" : "bg-primary-500",
            )}
          >
            {it.icon ?? <Check className="h-3 w-3" />}
          </span>
          <p className="text-[0.88rem] font-semibold text-slate-800 dark:text-slate-100">{it.title}</p>
          {it.meta && <p className="mt-0.5 text-[0.72rem] uppercase tracking-wide text-slate-400">{it.meta}</p>}
          {it.body && <p className="mt-1.5 text-[0.8rem] text-slate-500 dark:text-slate-400">{it.body}</p>}
        </motion.li>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------- Kanban */

export function KanbanBoard<T extends { id: string }>({
  columns,
  items,
  onMove,
  renderCard,
}: {
  columns: { id: string; title: string; tone?: Tone }[];
  items: T[];
  onMove: (id: string, to: string) => void;
  renderCard: (item: T) => ReactNode;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
      {columns.map((col) => {
        const colItems = items.filter((i) => (i as unknown as { stage: string }).stage === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) onMove(dragId, col.id);
              setDragId(null);
            }}
            className="kanban-col"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="flex items-center gap-2 text-[0.8rem] font-bold">
                <Badge tone={col.tone ?? "muted"} dot>
                  {col.title}
                </Badge>
              </span>
              <span className="font-numeric text-[0.75rem] font-bold text-slate-400">{colItems.length}</span>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              {colItems.map((item) => (
                <div key={item.id} draggable onDragStart={() => setDragId(item.id)} onDragEnd={() => setDragId(null)} className={cn("cursor-grab active:cursor-grabbing", dragId === item.id && "opacity-50")}>
                  {renderCard(item)}
                </div>
              ))}
              {colItems.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-[0.75rem] text-slate-400 dark:border-white/12">Drop cards here</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ Stepper */

export function Stepper({ steps, current, onJump }: { steps: { id: string; label: string }[]; current: number; onJump?: (i: number) => void }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <li key={s.id} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onJump?.(i)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold transition",
                state === "active" && "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-white",
                state === "done" && "border-success-500/40 bg-success-100 text-success-600 dark:bg-success-500/12 dark:text-success-400",
                state === "todo" && "border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400",
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/70 font-numeric text-[0.68rem] dark:bg-white/10">{state === "done" ? <Check className="h-3 w-3" /> : i + 1}</span>
              {s.label}
            </button>
            {i < steps.length - 1 && <span className="hidden h-px w-6 bg-slate-200 sm:block dark:bg-white/10" />}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------- Date range */

export function DateRangePicker({ from, to, onChange, className }: { from: string; to: string; onChange: (v: { from: string; to: string }) => void; className?: string }) {
  const presets = [
    { label: "7 days", days: 7 },
    { label: "30 days", days: 30 },
    { label: "90 days", days: 90 },
    { label: "This year", days: 360 },
  ];
  const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  return (
    <div className={cn("flex flex-wrap items-end gap-2.5", className)}>
      <Field label="From" className="min-w-[9rem]">
        <Input type="date" value={from} onChange={(e) => onChange({ from: e.target.value, to })} />
      </Field>
      <Field label="To" className="min-w-[9rem]">
        <Input type="date" value={to} onChange={(e) => onChange({ from, to: e.target.value })} />
      </Field>
      <div className="flex flex-wrap gap-1.5 pb-0.5">
        {presets.map((p) => (
          <Button key={p.label} variant="outline" size="sm" icon={<Calendar className="h-3.5 w-3.5" />} onClick={() => onChange({ from: daysAgo(p.days), to: daysAgo(0) })}>
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Upload */

export function FileDrop({ onFiles, accept = ".pdf,.jpg,.png,.docx,.xlsx", multiple = true, hint }: { onFiles: (names: string[]) => void; accept?: string; multiple?: boolean; hint?: string }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files).map((f) => f.name);
        if (files.length) onFiles(files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition",
        dragging ? "border-primary-500 bg-primary-50/70 dark:bg-primary-500/10" : "border-slate-300 bg-slate-50/60 hover:border-primary-400 dark:border-white/12 dark:bg-white/3",
      )}
      onClick={() => inputRef.current?.click()}
    >
      <Upload className="h-6 w-6 text-primary-500" />
      <p className="mt-3 text-[0.86rem] font-semibold text-slate-700 dark:text-slate-200">Drop files here or click to browse</p>
      <p className="mt-1 text-[0.75rem] text-slate-400">{hint ?? `Accepted: ${accept} · max 25 MB per file · Cloudinary signed upload`}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const names = Array.from(e.target.files ?? []).map((f) => f.name);
          if (names.length) onFiles(names);
        }}
      />
    </div>
  );
}

/* ----------------------------------------------------------- Utilities */

export function InfoRow({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0 dark:border-white/8">
      <span className="flex items-center gap-2 text-[0.78rem] text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </span>
      <span className="text-right text-[0.84rem] font-semibold text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", tone = "danger" }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; tone?: "danger" | "primary" }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      icon={<AlertTriangle className={tone === "danger" ? "h-5 w-5 text-danger-500" : "h-5 w-5"} />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[0.88rem] text-slate-600 dark:text-slate-300">{message}</p>
    </Modal>
  );
}

export function MoreMenu({ items }: { items: { label: string; icon?: ReactNode; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <IconButton label="More actions" onClick={() => setOpen((v) => !v)}>
        <MoreHorizontal className="h-4 w-4" />
      </IconButton>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="glass-strong absolute right-0 z-40 mt-2 w-52 rounded-2xl p-2">
            {items.map((it) => (
              <button
                key={it.label}
                onClick={() => {
                  it.onClick();
                  setOpen(false);
                }}
                className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[0.82rem] font-medium transition hover:bg-slate-100 dark:hover:bg-white/8", it.danger ? "text-danger-500" : "text-slate-600 dark:text-slate-300")}
              >
                {it.icon}
                {it.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LockedNotice({ title = "You do not have access to this module", message }: { title?: string; message?: string }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-slate-200 bg-white px-8 py-14 text-center dark:border-white/10 dark:bg-white/4">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-100 text-danger-500 dark:bg-danger-500/12">
        <Lock className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-lg font-bold">{title}</h2>
      <p className="mt-2 text-[0.85rem] text-slate-500 dark:text-slate-400">{message ?? "Your role permissions do not include this module. Contact your administrator to request elevated access."}</p>
    </div>
  );
}

export { Trash2, Settings2, Bell, ArrowRight, FileText };
