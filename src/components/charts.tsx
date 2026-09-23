import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useUIStore } from "@/lib/store";
import { cn } from "@/utils/cn";

export const CHART_COLORS = {
  primary: "#0F5FFF",
  primarySoft: "#5A8CFF",
  secondary: "#FACC15",
  peach: "#FDBA74",
  success: "#10B981",
  danger: "#EF4444",
  analytics: "#8B5CF6",
  ink: "#0F172A",
  slate: "#64748B",
};

export const PIE_COLORS = [CHART_COLORS.primary, CHART_COLORS.analytics, CHART_COLORS.secondary, CHART_COLORS.success, CHART_COLORS.danger, CHART_COLORS.peach];

function useAxis() {
  const theme = useUIStore((s) => s.theme);
  const dark = theme === "dark";
  return {
    stroke: dark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)",
    tick: dark ? "#94A3B8" : "#64748B",
    grid: dark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.07)",
  };
}

type TooltipRow = { name?: string; value?: number | string; color?: string; payload?: Record<string, unknown> };

function LuxTooltip({ active, payload, label, suffix = "" }: { active?: boolean; payload?: TooltipRow[]; label?: string; suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-2xl px-4 py-3 text-[0.78rem] shadow-lift">
      {label && <p className="mb-1.5 font-display text-[0.8rem] font-bold text-slate-900 dark:text-white">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize">{p.name}</span>
          <span className="ml-auto font-numeric font-bold text-slate-900 dark:text-white">
            {typeof p.value === "number" ? p.value.toLocaleString("en-US") : p.value}
            {suffix}
          </span>
        </p>
      ))}
    </div>
  );
}

const baseMargin = { top: 8, right: 12, left: -14, bottom: 0 };

/* -------------------------------------------------------- Attendance */

export function AttendanceAreaChart({ data, height = 300 }: { data: { date: string; present: number; absent: number; late: number; rate: number }[]; height?: number }) {
  const a = useAxis();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={baseMargin}>
        <defs>
          <linearGradient id="grad-present" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.55} />
            <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="grad-absent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.danger} stopOpacity={0.4} />
            <stop offset="100%" stopColor={CHART_COLORS.danger} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="grad-late" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.secondary} stopOpacity={0.45} />
            <stop offset="100%" stopColor={CHART_COLORS.secondary} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={a.grid} vertical={false} />
        <XAxis dataKey="date" tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={{ stroke: a.grid }} minTickGap={28} tickFormatter={(v: string) => v.slice(5)} />
        <YAxis tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={54} />
        <Tooltip content={<LuxTooltip />} />
        <Area type="monotone" dataKey="present" name="Present" stroke={CHART_COLORS.primary} strokeWidth={2.4} fill="url(#grad-present)" animationDuration={1200} />
        <Area type="monotone" dataKey="late" name="Late" stroke={CHART_COLORS.secondary} strokeWidth={1.8} fill="url(#grad-late)" animationDuration={1400} />
        <Area type="monotone" dataKey="absent" name="Absent" stroke={CHART_COLORS.danger} strokeWidth={1.8} fill="url(#grad-absent)" animationDuration={1600} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ----------------------------------------------------------- Revenue */

export function RevenueBarChart({ data, height = 300 }: { data: { month: string; collected: number; outstanding: number; target: number; expenses: number }[]; height?: number }) {
  const a = useAxis();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={baseMargin} barGap={4}>
        <CartesianGrid stroke={a.grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={{ stroke: a.grid }} />
        <YAxis tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={58} tickFormatter={(v: number) => `${Math.round(v / 1_000_000)}M`} />
        <Tooltip content={<LuxTooltip />} cursor={{ fill: "rgba(15,95,255,0.06)" }} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
        <Bar dataKey="collected" name="Collected" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} animationDuration={1100} />
        <Bar dataKey="outstanding" name="Outstanding" fill={CHART_COLORS.secondary} radius={[6, 6, 0, 0]} animationDuration={1300} />
        <Bar dataKey="expenses" name="Expenses" fill={CHART_COLORS.analytics} radius={[6, 6, 0, 0]} animationDuration={1500} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------ Growth */

export function GrowthAreaChart({ data, height = 280 }: { data: { month: string; students: number; admissions: number; left: number }[]; height?: number }) {
  const a = useAxis();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={baseMargin}>
        <defs>
          <linearGradient id="grad-growth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.analytics} stopOpacity={0.5} />
            <stop offset="100%" stopColor={CHART_COLORS.analytics} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={a.grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={{ stroke: a.grid }} />
        <YAxis tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={58} domain={["dataMin - 120", "dataMax + 120"]} />
        <Tooltip content={<LuxTooltip />} />
        <Area type="monotone" dataKey="students" name="Enrolled" stroke={CHART_COLORS.analytics} strokeWidth={2.6} fill="url(#grad-growth)" animationDuration={1300} />
        <Line type="monotone" dataKey="admissions" name="New admissions" stroke={CHART_COLORS.success} strokeWidth={2} dot={false} animationDuration={1500} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StudentGrowthLine({ data, height = 260 }: { data: { month: string; students: number }[]; height?: number }) {
  const a = useAxis();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={baseMargin}>
        <CartesianGrid stroke={a.grid} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={{ stroke: a.grid }} />
        <YAxis tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={54} />
        <Tooltip content={<LuxTooltip />} />
        <Line type="monotone" dataKey="students" name="Students" stroke={CHART_COLORS.primary} strokeWidth={2.6} dot={{ r: 3, strokeWidth: 0, fill: CHART_COLORS.primary }} animationDuration={1200} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------ Radar */

export function SubjectRadarChart({ data, height = 320, comparison }: { data: { subject: string; score: number; lastTerm: number }[]; height?: number; comparison?: boolean }) {
  const a = useAxis();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={a.grid} />
        <PolarAngleAxis dataKey="subject" tick={{ fill: a.tick, fontSize: 10.5 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: a.tick, fontSize: 9 }} stroke={a.grid} />
        <Radar name="This term" dataKey="score" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.42} animationDuration={1300} />
        {comparison && <Radar name="Last term" dataKey="lastTerm" stroke={CHART_COLORS.secondary} fill={CHART_COLORS.secondary} fillOpacity={0.2} animationDuration={1500} />}
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
        <Tooltip content={<LuxTooltip suffix="%" />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------ Donuts */

export function DonutChart({ data, height = 280, centerLabel, centerValue }: { data: { name: string; value: number }[]; height?: number; centerLabel?: string; centerValue?: string }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={3} stroke="none" animationDuration={1200}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<LuxTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-x-0 top-[38%] -translate-y-1/2 text-center">
          <p className="font-numeric text-[1.5rem] font-bold text-slate-900 dark:text-white">{centerValue ?? total.toLocaleString("en-US")}</p>
          <p className="text-[0.66rem] font-semibold uppercase tracking-wider text-slate-400">{centerLabel}</p>
        </div>
      )}
    </div>
  );
}

export function FeePieChart({ data, height = 280 }: { data: { name: string; value: number }[]; height?: number }) {
  return (
    <DonutChart
      data={data}
      height={height}
      centerLabel="Collected"
      centerValue={`${Math.round((data.find((d) => d.name === "Paid")?.value ?? 0) / Math.max(1, data.reduce((a, d) => a + d.value, 0)) * 100)}%`}
    />
  );
}

/* -------------------------------------------------------------- Bars */

export function ExamBarChart({ data, height = 300 }: { data: { exam: string; passed: number; failed: number; distinction: number; avg: number }[]; height?: number }) {
  const a = useAxis();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={baseMargin} layout="vertical" barSize={16}>
        <CartesianGrid stroke={a.grid} horizontal={false} />
        <XAxis type="number" tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={{ stroke: a.grid }} />
        <YAxis type="category" dataKey="exam" tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={92} />
        <Tooltip content={<LuxTooltip />} cursor={{ fill: "rgba(15,95,255,0.06)" }} />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
        <Bar dataKey="distinction" name="Distinction" stackId="a" fill={CHART_COLORS.analytics} radius={[0, 0, 0, 0]} animationDuration={1100} />
        <Bar dataKey="passed" name="Passed" stackId="a" fill={CHART_COLORS.primary} animationDuration={1200} />
        <Bar dataKey="failed" name="Failed" stackId="a" fill={CHART_COLORS.danger} radius={[0, 6, 6, 0]} animationDuration={1300} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBarChart({ data, height = 280, dataKey = "value", nameKey = "name", tone = CHART_COLORS.primary }: { data: Record<string, unknown>[]; height?: number; dataKey?: string; nameKey?: string; tone?: string }) {
  const a = useAxis();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={baseMargin} barSize={14}>
        <CartesianGrid stroke={a.grid} horizontal={false} />
        <XAxis type="number" tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={{ stroke: a.grid }} />
        <YAxis type="category" dataKey={nameKey} tick={{ fill: a.tick, fontSize: 11 }} tickLine={false} axisLine={false} width={104} />
        <Tooltip content={<LuxTooltip />} cursor={{ fill: "rgba(15,95,255,0.06)" }} />
        <Bar dataKey={dataKey} fill={tone} radius={[0, 8, 8, 0]} animationDuration={1200}>
          {data.map((_, i) => (
            <Cell key={i} fill={i % 2 === 0 ? tone : CHART_COLORS.primarySoft} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Sparkline({ data, color = CHART_COLORS.primary, height = 44 }: { data: number[]; color?: string; height?: number }) {
  const rows = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${color.replace("#", "")})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------- Heatmap grid */

export function AttendanceHeatmap({ data }: { data: { date: string; rate: number }[] }) {
  const tone = (rate: number) => {
    if (rate >= 96) return "bg-primary-600";
    if (rate >= 92) return "bg-primary-500";
    if (rate >= 88) return "bg-primary-400";
    if (rate >= 82) return "bg-secondary-400";
    if (rate >= 70) return "bg-secondary-300";
    if (rate > 0) return "bg-danger-400";
    return "bg-slate-200 dark:bg-white/8";
  };
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-1.5">
        {data.map((d, i) => (
          <span
            key={i}
            title={`${d.date} — ${d.rate}% attendance`}
            className={cn("h-4 w-4 rounded-[4px] transition-transform hover:scale-125", tone(d.rate))}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[0.7rem] text-slate-400">
        <span>Low</span>
        {["bg-danger-400", "bg-secondary-300", "bg-secondary-400", "bg-primary-400", "bg-primary-500", "bg-primary-600"].map((c) => (
          <span key={c} className={cn("h-3 w-3 rounded-[3px]", c)} />
        ))}
        <span>High</span>
      </div>
    </div>
  );
}
