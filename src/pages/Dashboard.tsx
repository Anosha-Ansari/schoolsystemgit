import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardList,
  CreditCard,
  Download,
  FileBarChart2,
  GraduationCap,
  Library,
  MessageSquare,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import {
  AttendanceAreaChart,
  DonutChart,
  ExamBarChart,
  FeePieChart,
  GrowthAreaChart,
  HorizontalBarChart,
  RevenueBarChart,
  StudentGrowthLine,
  SubjectRadarChart,
} from "@/components/charts";
import { Avatar, Badge, Button, Card, CardHeader, ChartSkeleton, EmptyState, PageHeader, ProgressBar, RadialProgress, StatCard, TableSkeleton, Timeline } from "@/components/ui";
import { api, ROLE_MATRIX, exportExcel, exportPDF } from "@/lib/api";
import { qk, toast, useAuthStore, useCountUp, useLiveTicker, usePageTitle } from "@/lib/store";
import { activities as seedActivities, systemStatus, teachers, timetableSlots, type Role } from "@/lib/db";
import { cn } from "@/utils/cn";

const SCHOOL_LABEL = "Beaconhouse Smart Campus";

/* consts -------------------------------------------------------------- */
const money = (n: number) => `Rs ${(n / 1_000_000).toFixed(2)}M`;

const ROLE_KPIS: Record<Role, string[]> = {
  super_admin: ["students", "teachers", "attendance", "revenue", "fees", "exam"],
  admin: ["students", "teachers", "attendance", "fees", "classes", "exam"],
  teacher: ["students", "attendance", "classes", "exam", "assignments", "leaves"],
  student: ["attendance", "exam", "assignments", "fees"],
  parent: ["attendance", "exam", "fees", "assignments"],
  accountant: ["fees", "revenue", "students", "transport"],
  librarian: ["library", "students", "attendance"],
};

export function useDashboardData() {
  const dash = useQuery({ queryKey: qk.dashboard, queryFn: () => api.metrics.dashboard() });
  const attendance = useQuery({ queryKey: qk.attendance(90), queryFn: () => api.metrics.attendance(90) });
  const revenue = useQuery({ queryKey: qk.revenue, queryFn: () => api.metrics.revenue() });
  const growth = useQuery({ queryKey: qk.growth, queryFn: () => api.metrics.growth() });
  const subjects = useQuery({ queryKey: qk.subjects, queryFn: () => api.metrics.subjects() });
  const examStats = useQuery({ queryKey: qk.examStats, queryFn: () => api.metrics.examStats() });
  const teacherPerf = useQuery({ queryKey: qk.teacherPerf, queryFn: () => api.metrics.teacherPerformance() });
  return { dash, attendance, revenue, growth, subjects, examStats, teacherPerf };
}

/* ------------------------------------------------------- KPI builder */

function KpiGrid({ role }: { role: Role }) {
  const { dash, revenue } = useDashboardData();
  const live = useLiveTicker(dash.data?.kpis.attendanceRate ?? 94, 0.6);
  const k = dash.data?.kpis;
  const rev = revenue.data ?? [];
  const sparkRevenue = rev.slice(-8).map((r) => r.collected / 100000);

  const all = {
    students: { label: "Total Students", value: k?.students ?? 0, icon: <Users className="h-5 w-5" />, tone: "primary" as const, delta: 4.2, spark: sparkRevenue, hint: "5,180 active on roll" },
    teachers: { label: "Total Teachers", value: k?.teachers ?? 0, icon: <GraduationCap className="h-5 w-5" />, tone: "analytics" as const, delta: 2.1, hint: `${teachers.filter((t) => t.status === "on_leave").length} on leave today` },
    attendance: { label: "Attendance Rate", value: Number(live / 1), icon: <ClipboardList className="h-5 w-5" />, tone: "success" as const, decimals: 1, suffix: "%", delta: 1.4, hint: "Live · updated 12s ago" },
    fees: { label: "Fee Collection", value: Math.round((k?.feeCollectedThisMonth ?? 0) / 1_000_000), icon: <CreditCard className="h-5 w-5" />, tone: "warn" as const, prefix: "Rs ", suffix: "M", delta: 6.8, hint: `${money(k?.outstandingTotal ?? 0)} outstanding` },
    revenue: { label: "Revenue YTD", value: Math.round((k?.revenueYTD ?? 0) / 1_000_000), icon: <Wallet className="h-5 w-5" />, tone: "primary" as const, prefix: "Rs ", suffix: "M", delta: 9.3, spark: sparkRevenue },
    exam: { label: "Exam Average", value: k?.examAverage ?? 0, icon: <Award className="h-5 w-5" />, tone: "analytics" as const, suffix: "%", decimals: 1, delta: 2.6, hint: `${k?.passRate ?? 0}% pass rate` },
    classes: { label: "Active Classes", value: k?.activeClasses ?? 0, icon: <BookOpen className="h-5 w-5" />, tone: "primary" as const, hint: "32 avg. students / section" },
    assignments: { label: "Open Assignments", value: k?.openAssignments ?? 0, icon: <FileBarChart2 className="h-5 w-5" />, tone: "muted" as const, hint: "Across all sections" },
    leaves: { label: "Pending Leaves", value: k?.pendingLeaves ?? 0, icon: <CalendarDays className="h-5 w-5" />, tone: "warn" as const, hint: "Awaiting approval" },
    library: { label: "Books Issued", value: k?.libraryIssued ?? 0, icon: <Library className="h-5 w-5" />, tone: "primary" as const, hint: "11 overdue this week" },
    transport: { label: "Transport Utilisation", value: k?.transportUtilisation ?? 0, icon: <Activity className="h-5 w-5" />, tone: "success" as const, suffix: "%", hint: "14 routes active" },
  };

  const list = ROLE_KPIS[role].map((key) => all[key as keyof typeof all]).filter(Boolean);

  if (dash.isLoading) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Card key={i} className="p-5"><div className="skeleton h-24 w-full" /></Card>)}</div>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {list.map((card, i) => (
        <motion.div key={card.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
          <StatCard {...card} />
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ widgets */

function QuickActions({ role }: { role: Role }) {
  const actions: Record<Role, { label: string; to: string; icon: React.ReactNode }[]> = {
    super_admin: [
      { label: "Add student", to: "/students/new", icon: <UserPlus className="h-4 w-4" /> },
      { label: "Generate challans", to: "/fees/generate", icon: <CreditCard className="h-4 w-4" /> },
      { label: "Publish results", to: "/results/publish", icon: <Award className="h-4 w-4" /> },
      { label: "Create exam", to: "/examinations/new", icon: <BookOpen className="h-4 w-4" /> },
    ],
    admin: [
      { label: "Add student", to: "/students/new", icon: <UserPlus className="h-4 w-4" /> },
      { label: "Mark attendance", to: "/attendance/mark", icon: <ClipboardList className="h-4 w-4" /> },
      { label: "New notice", to: "/notices", icon: <CalendarDays className="h-4 w-4" /> },
      { label: "Fee generation", to: "/fees/generate", icon: <CreditCard className="h-4 w-4" /> },
    ],
    teacher: [
      { label: "Mark attendance", to: "/attendance/mark", icon: <ClipboardList className="h-4 w-4" /> },
      { label: "Enter marks", to: "/examinations/marks", icon: <BookOpen className="h-4 w-4" /> },
      { label: "New assignment", to: "/assignments/new", icon: <FileBarChart2 className="h-4 w-4" /> },
      { label: "My timetable", to: "/classes", icon: <CalendarDays className="h-4 w-4" /> },
    ],
    student: [
      { label: "My results", to: "/my?tab=results", icon: <Award className="h-4 w-4" /> },
      { label: "Assignments", to: "/my?tab=assignments", icon: <FileBarChart2 className="h-4 w-4" /> },
      { label: "Timetable", to: "/my?tab=timetable", icon: <CalendarDays className="h-4 w-4" /> },
      { label: "Message teacher", to: "/messages", icon: <Sparkles className="h-4 w-4" /> },
    ],
    parent: [
      { label: "Child progress", to: "/parent", icon: <TrendingUp className="h-4 w-4" /> },
      { label: "Fee history", to: "/parent?tab=fees", icon: <Wallet className="h-4 w-4" /> },
      { label: "Report cards", to: "/parent?tab=results", icon: <Award className="h-4 w-4" /> },
      { label: "Message teacher", to: "/messages", icon: <Sparkles className="h-4 w-4" /> },
    ],
    accountant: [
      { label: "Fee challans", to: "/fees", icon: <CreditCard className="h-4 w-4" /> },
      { label: "Overdue list", to: "/fees/overdue", icon: <AlertTriangle className="h-4 w-4" /> },
      { label: "Payroll run", to: "/payroll", icon: <Wallet className="h-4 w-4" /> },
      { label: "Revenue report", to: "/fees/revenue", icon: <FileBarChart2 className="h-4 w-4" /> },
    ],
    librarian: [
      { label: "Issue book", to: "/library", icon: <BookOpen className="h-4 w-4" /> },
      { label: "Return & fines", to: "/library/issues", icon: <Library className="h-4 w-4" /> },
      { label: "Library report", to: "/reports", icon: <FileBarChart2 className="h-4 w-4" /> },
      { label: "Notice board", to: "/notices", icon: <CalendarDays className="h-4 w-4" /> },
    ],
  };
  return (
    <Card className="p-5">
      <CardHeader title="Quick actions" subtitle="Jump straight into your daily tasks" className="-mx-5 -mt-5 mb-4" />
      <div className="grid gap-2.5 sm:grid-cols-2">
        {actions[role].map((a) => (
          <Link key={a.label} to={a.to} className="group flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 text-[0.82rem] font-semibold text-slate-600 transition hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 dark:border-white/10 dark:text-slate-300 dark:hover:bg-primary-500/10 dark:hover:text-white">
            <span className="text-primary-500">{a.icon}</span>
            {a.label}
            <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </Card>
  );
}

function SystemStatusCard() {
  return (
    <Card className="p-5">
      <CardHeader title="System status" subtitle="API · database · realtime · backups" className="-mx-5 -mt-5 mb-4" />
      <ul className="space-y-3.5">
        {systemStatus.map((s) => (
          <li key={s.name}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[0.82rem] font-semibold text-slate-700 dark:text-slate-200">{s.name}</span>
              <Badge tone={s.status === "Operational" ? "success" : "warn"} dot>
                {s.latency} ms
              </Badge>
            </div>
            <div className="mt-2">
              <ProgressBar value={s.uptime} tone={s.status === "Operational" ? "success" : "warn"} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function AiBanner() {
  const { data } = useQuery({ queryKey: qk.ai, queryFn: () => api.ai.insights() });
  const top = data?.insights[0];
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-analytics-500/12 via-primary-500/8 to-transparent p-5">
      <div className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-analytics-500/20 blur-2xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-analytics-100 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-analytics-600 dark:bg-analytics-500/15 dark:text-analytics-300">
            <Sparkles className="h-3.5 w-3.5" /> AI insight engine
          </span>
          <p className="mt-3 text-[1rem] font-bold text-slate-900 dark:text-white">{top?.title ?? "Analysing campus data…"}</p>
          <p className="mt-1.5 text-[0.84rem] text-slate-500 dark:text-slate-400">{top?.detail ?? "Generating recommendations from attendance, results and fee signals."}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/ai-insights">
            <Button variant="primary" icon={<Sparkles className="h-4 w-4" />}>
              Open insights
            </Button>
          </Link>
          <Button variant="outline" onClick={() => exportPDF("AI-insight-summary")} icon={<Download className="h-4 w-4" />}>
            Export
          </Button>
        </div>
      </div>
      {top && (
        <div className="relative mt-4 flex flex-wrap gap-3">
          <Badge tone="analytics">Confidence {Math.round(top.confidence * 100)}%</Badge>
          <Badge tone="success">Expected impact {top.impact}</Badge>
          <Badge tone="muted">Model {data?.model}</Badge>
        </div>
      )}
    </Card>
  );
}

function TeacherPerformanceTable() {
  const { teacherPerf } = useDashboardData();
  const [selected, setSelected] = useState<string[]>([]);
  const rows = (teacherPerf.data ?? []).map((t) => ({ ...t, classes: Math.round(t.students / 32), score: Math.round(t.rating * 18 + t.attendance * 0.1) }));

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Teacher performance"
        subtitle="Observation ratings, attendance and class load"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => { exportExcel(rows, [{ key: "name", label: "Teacher" }, { key: "rating", label: "Rating" }, { key: "attendance", label: "Attendance %" }, { key: "students", label: "Students" }], "teacher-performance"); toast.success("Excel exported"); }}>
              Excel
            </Button>
            <Button variant="ghost" size="sm" onClick={() => exportPDF("teacher-performance")}>
              PDF
            </Button>
          </div>
        }
      />
      {teacherPerf.isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <div className="overflow-x-auto">
          <table className="table-saas">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Department</th>
                <th>Rating</th>
                <th>Attendance</th>
                <th>Students</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="cursor-pointer" onClick={() => setSelected(selected.includes(t.id) ? selected.filter((s) => s !== t.id) : [...selected, t.id])}>
                  <td>
                    <span className="flex items-center gap-3">
                      <Avatar name={t.name} size={30} />
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{t.name}</span>
                    </span>
                  </td>
                  <td>{t.department}</td>
                  <td className="font-numeric font-bold text-secondary-600 dark:text-secondary-300">{t.rating} ★</td>
                  <td>{t.attendance}%</td>
                  <td className="font-numeric">{t.students}</td>
                  <td className="w-40">
                    <ProgressBar value={Math.min(100, t.score)} tone={t.score > 90 ? "success" : t.score > 80 ? "primary" : "warn"} showLabel />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------- page */

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)!;
  if (user.role === "teacher") return <TeacherHome />;
  return <StaffDashboard />;
}

function StaffDashboard() {
  const user = useAuthStore((s) => s.user)!;
  const role = user.role;
  const { dash, attendance, growth, subjects, examStats, revenue } = useDashboardData();
  const [range, setRange] = useState<"30" | "60" | "90">("30");
  usePageTitle(`${ROLE_MATRIX[role].label} Dashboard`);

  const attendanceData = (attendance.data ?? []).slice(-Number(range));
  const sessionCount = useCountUp(312, 1200);

  const genderData = [
    { name: "Boys", value: 2710 },
    { name: "Girls", value: 2470 },
  ];
  const feeData = [
    { name: "Paid", value: 4180 },
    { name: "Partial", value: 512 },
    { name: "Overdue", value: 288 },
    { name: "Scholarship", value: 200 },
  ];

  const activities = (dash.data?.activities ?? seedActivities).slice(0, 7);
  const events = dash.data?.events ?? [];

  return (
    <div>
      {/* Hero banner */}
      <Card className="relative mb-6 overflow-hidden border-0 bg-gradient-to-br from-primary-600 via-primary-700 to-analytics-600 p-6 sm:p-8">
        <div className="bg-dots absolute inset-0 opacity-20" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/70">SmartSchool ERP · Session 2025–26</p>
            <h1 className="mt-3 font-display text-[1.6rem] leading-tight font-extrabold text-white sm:text-[2.1rem]">
              {role === "student" || role === "parent" ? `Welcome, ${user.name.split(" ")[0]}` : `Good to see you, ${user.name.split(" ")[0]}`} — {SCHOOL_LABEL}
            </h1>
            <p className="mt-3 text-[0.9rem] text-white/80">
              {ROLE_MATRIX[role].description} {role !== "teacher" && role !== "student" && role !== "parent" ? `${sessionCount} attendance sessions logged today.` : ""}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {(role === "super_admin" || role === "admin") && (
                <Link to="/reports" className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-[0.8rem] font-bold text-primary-700 transition hover:bg-white">
                  <FileBarChart2 className="h-4 w-4" /> Executive report
                </Link>
              )}
              <Link to={role === "parent" ? "/parent" : role === "student" ? "/my" : "/students"} className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.8rem] font-bold text-white transition hover:bg-white/15">
                <Users className="h-4 w-4" /> {role === "parent" ? "Child progress" : role === "student" ? "My portal" : "Student records"}
              </Link>
              <span className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.8rem] font-bold text-white">
                <Activity className="h-4 w-4 text-success-400" /> {dash.data?.system[0].latency ?? 0} ms API
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="glass rounded-2xl p-4 text-center">
              <RadialProgress value={dash.data?.kpis.attendanceRate ?? 94} size={92} tone="#34D399" label="Attendance" />
            </div>
            <div className="hidden flex-col gap-3 sm:flex">
              <div className="glass rounded-2xl px-4 py-3">
                <p className="text-[0.66rem] font-bold uppercase tracking-wide text-white/60">Fee collected</p>
                <p className="font-numeric text-lg font-extrabold text-white">{money(dash.data?.kpis.feeCollectedThisMonth ?? 0)}</p>
              </div>
              <div className="glass rounded-2xl px-4 py-3">
                <p className="text-[0.66rem] font-bold uppercase tracking-wide text-white/60">Pass rate</p>
                <p className="font-numeric text-lg font-extrabold text-white">{dash.data?.kpis.passRate ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <KpiGrid role={role} />

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Attendance analytics"
            subtitle="Present · late · absent across the campus"
            icon={<ClipboardList className="h-4 w-4" />}
            action={
              <div className="flex gap-1.5">
                {(["30", "60", "90"] as const).map((r) => (
                  <Button key={r} variant={range === r ? "primary" : "outline"} size="sm" onClick={() => setRange(r)}>
                    {r}d
                  </Button>
                ))}
              </div>
            }
          />
          <div className="p-4">{attendance.isLoading ? <ChartSkeleton /> : <AttendanceAreaChart data={attendanceData} />}</div>
        </Card>

        <div className="space-y-6">
          <QuickActions role={role} />
          <Card className="p-5">
            <CardHeader title="Fee collection mix" subtitle="Current month invoicing" className="-mx-5 -mt-5 mb-4" />
            <FeePieChart data={feeData} height={230} />
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Revenue analytics" subtitle="Collected vs outstanding vs expenses" icon={<Wallet className="h-4 w-4" />} />
          <div className="p-4">{revenue.isLoading ? <ChartSkeleton /> : <RevenueBarChart data={(revenue.data ?? []).slice(-8)} height={280} />}</div>
        </Card>

        <Card>
          <CardHeader title="Student growth" subtitle="Enrolment, admissions and exits" icon={<TrendingUp className="h-4 w-4" />} />
          <div className="p-4">{growth.isLoading ? <ChartSkeleton /> : <GrowthAreaChart data={growth.data ?? []} height={280} />}</div>
        </Card>

        <Card>
          <CardHeader title="Subject performance" subtitle="This term vs last term" icon={<Award className="h-4 w-4" />} />
          <div className="p-4">{subjects.isLoading ? <ChartSkeleton /> : <SubjectRadarChart data={subjects.data ?? []} height={280} comparison />}</div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader title="Examination statistics" subtitle="Distinction · pass · fail" icon={<BookOpen className="h-4 w-4" />} />
          <div className="p-4">{examStats.isLoading ? <ChartSkeleton /> : <ExamBarChart data={(examStats.data ?? []).slice(0, 5).map((e) => ({ exam: e.exam, passed: e.passed, failed: e.failed, distinction: e.distinction, avg: e.avg }))} height={280} />}</div>
        </Card>

        <Card>
          <CardHeader title="Gender ratio" subtitle="Campus-wide enrolment" icon={<Users className="h-4 w-4" />} />
          <div className="p-4">
            <DonutChart data={genderData} height={280} centerLabel="Students" centerValue="5,180" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Class-wise average" subtitle="Top performing sections" icon={<GraduationCap className="h-4 w-4" />} />
          <div className="p-4">
            <HorizontalBarChart
              data={[
                { name: "Grade 10-A", value: 88 },
                { name: "Grade 9-B", value: 84 },
                { name: "Grade 12-A", value: 82 },
                { name: "Grade 8-A", value: 79 },
                { name: "Grade 11-B", value: 76 },
                { name: "Grade 7-A", value: 74 },
              ]}
              height={280}
              tone="#8B5CF6"
            />
          </div>
        </Card>
      </div>

      {!dash.isLoading && <div className="mt-6">{dash.data && <StudentGrowthLineWrapper />}</div>}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Recent activity" subtitle="Audit trail across modules" icon={<Activity className="h-4 w-4" />} action={<Link to="/audit"><Button variant="ghost" size="sm">View all</Button></Link>} />
          <div className="p-5">
            <Timeline
              items={activities.map((a) => ({
                title: `${a.actor} ${a.action} ${a.target}`,
                meta: a.at,
                tone: a.kind === "fee" ? "success" : a.kind === "exam" ? "analytics" : a.kind === "system" ? "warn" : "primary",
                icon: a.kind === "fee" ? <Wallet className="h-3 w-3" /> : a.kind === "exam" ? <Award className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />,
              }))}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Upcoming events" subtitle="Campus calendar" icon={<CalendarDays className="h-4 w-4" />} action={<Link to="/calendar"><Button variant="ghost" size="sm">Calendar</Button></Link>} />
            <ul className="divide-y divide-slate-100 dark:divide-white/8">
              {events.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-[0.85rem] font-semibold text-slate-800 dark:text-slate-100">{e.title}</p>
                    <p className="mt-0.5 text-[0.74rem] text-slate-500 dark:text-slate-400">{e.venue} · {e.organiser}</p>
                  </div>
                  <Badge tone="primary">{e.date}</Badge>
                </li>
              ))}
              {events.length === 0 && <li className="px-5 py-6 text-center text-[0.82rem] text-slate-400">No events scheduled</li>}
            </ul>
          </Card>
          <SystemStatusCard />
        </div>
      </div>

      <div className="mt-6">
        <AiBanner />
      </div>

      <div className="mt-6">
        <TeacherPerformanceTable />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader title="Academic insights" subtitle="Grade distribution and difficulty index" />
          <div className="p-4">
            <ExamBarChart
              data={[
                { exam: "English", passed: 412, failed: 22, distinction: 88, avg: 79 },
                { exam: "Maths", passed: 386, failed: 48, distinction: 62, avg: 72 },
                { exam: "Physics", passed: 356, failed: 54, distinction: 58, avg: 71 },
                { exam: "Chemistry", passed: 392, failed: 26, distinction: 74, avg: 76 },
                { exam: "Biology", passed: 404, failed: 18, distinction: 92, avg: 81 },
              ]}
              height={300}
            />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Fee collection trend" subtitle="Month-on-month receipts vs ageing" action={<Link to="/fees/revenue"><Button variant="ghost" size="sm">Revenue</Button></Link>} />
          <div className="p-4">
            <RevenueBarChart data={(revenue.data ?? []).slice(-6).map((r) => ({ ...r, collected: r.collected / 1000, outstanding: r.outstanding / 1000, target: r.target / 1000, expenses: r.expenses / 1000 }))} height={300} />
          </div>
          <div className="flex flex-wrap gap-3 border-t border-slate-100 px-5 py-4 dark:border-white/8">
            <Link to="/fees/generate">
              <Button variant="primary" size="sm" icon={<CreditCard className="h-3.5 w-3.5" />}>
                Generate challans
              </Button>
            </Link>
            <Link to="/fees/overdue">
              <Button variant="outline" size="sm" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
                Overdue follow-up
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================ Teacher */

type Tone = "primary" | "success" | "danger" | "warn" | "analytics" | "muted";

const addMinutes = (hhmm: string, mins: number) => {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + mins;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const statusToneLocal = (status: "Completed" | "Ongoing" | "Upcoming"): Tone => (status === "Completed" ? "success" : status === "Ongoing" ? "warn" : "primary");

const TONE_TILE: Record<Tone, string> = {
  primary: "bg-primary-500/12 text-primary-600 dark:text-primary-300",
  success: "bg-success-500/12 text-success-600 dark:text-success-400",
  danger: "bg-danger-500/12 text-danger-600 dark:text-danger-400",
  warn: "bg-secondary-400/16 text-secondary-600 dark:text-secondary-300",
  analytics: "bg-analytics-500/12 text-analytics-600 dark:text-analytics-400",
  muted: "bg-slate-400/12 text-slate-600 dark:text-slate-300",
};

const TONE_DOT: Record<Tone, string> = {
  primary: "bg-primary-500",
  success: "bg-success-500",
  danger: "bg-danger-500",
  warn: "bg-secondary-400",
  analytics: "bg-analytics-500",
  muted: "bg-slate-400",
};

function TeacherHome() {
  const user = useAuthStore((s) => s.user)!;
  usePageTitle("Teacher Dashboard");
  const me = teachers.find((t) => t.id === user.linkedId) ?? teachers[0];
  const firstName = user.name.replace(/^(Sir|Mrs\.?|Miss|Ms\.?|Mr\.?)\s+/i, "").split(" ")[0] || user.name;

  const myClasses = Array.from(new Set(me.classes));
  const periodRooms = ["Room 101", "Room 102", "Room 103", "Room 101", "Room 104", "Lab 1"];
  const schedule = timetableSlots.slice(0, 6).map((start, i) => {
    const cls = myClasses[i % myClasses.length] ?? "Grade 8-A";
    const subject = me.subjects[i % me.subjects.length] ?? "General";
    const status: "Completed" | "Ongoing" | "Upcoming" = i < 2 ? "Completed" : i === 2 ? "Ongoing" : "Upcoming";
    return {
      time: `${start} – ${addMinutes(start, 45)}`,
      className: cls.replace("Grade ", ""),
      subject,
      room: periodRooms[i % periodRooms.length],
      status,
    };
  });

  const metrics: { label: string; value: number; tone: Tone }[] = [
    { label: "Class management", value: Math.min(99, me.attendanceRate + 2), tone: "success" },
    { label: "Student engagement", value: Math.min(99, Math.round(me.rating * 19)), tone: "primary" },
    { label: "Assignments", value: Math.min(99, 68 + (me.experience % 22)), tone: "warn" },
    { label: "Punctuality", value: me.attendanceRate, tone: "analytics" },
  ];
  const overall = Math.round(metrics.reduce((a, m) => a + m.value, 0) / metrics.length);

  const activityFeed: { title: string; meta: string; tone: Tone; icon: React.ReactNode }[] = [
    { title: `Attendance marked for Class ${schedule[0]?.className ?? myClasses[0]?.replace("Grade ", "") ?? ""}`, meta: "10:15 AM · Today", tone: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
    { title: `Assignment submissions reviewed — ${me.subjects[0] ?? "your subject"}`, meta: "9:40 AM · Today", tone: "primary", icon: <FileBarChart2 className="h-3 w-3" /> },
    { title: "New message from the Admin Office", meta: "Yesterday", tone: "analytics", icon: <MessageSquare className="h-3 w-3" /> },
    { title: `Marks uploaded for ${me.subjects[1] ?? me.subjects[0] ?? "exam"}`, meta: "Yesterday", tone: "warn", icon: <Award className="h-3 w-3" /> },
    { title: "Leave request approved by admin", meta: "2 days ago", tone: "muted", icon: <CalendarDays className="h-3 w-3" /> },
  ];

  const quickActions: { label: string; to: string; icon: React.ReactNode; tone: Tone }[] = [
    { label: "Mark attendance", to: "/attendance/mark", icon: <ClipboardList className="h-5 w-5" />, tone: "primary" },
    { label: "Add marks", to: "/examinations/marks", icon: <Award className="h-5 w-5" />, tone: "warn" },
    { label: "Create assignment", to: "/assignments/new", icon: <FileBarChart2 className="h-5 w-5" />, tone: "success" },
    { label: "View students", to: "/students", icon: <Users className="h-5 w-5" />, tone: "analytics" },
    { label: "Messages", to: "/messages", icon: <MessageSquare className="h-5 w-5" />, tone: "primary" },
    { label: "View reports", to: "/reports", icon: <TrendingUp className="h-5 w-5" />, tone: "danger" },
  ];

  return (
    <div>
      {/* Hero */}
      <Card className="relative mb-6 overflow-hidden border-0 bg-gradient-to-br from-primary-600 via-primary-700 to-analytics-600 p-6 sm:p-8">
        <div className="bg-dots absolute inset-0 opacity-20" />
        <GraduationCap className="pointer-events-none absolute -top-6 -right-6 h-40 w-40 text-white/10" />
        <BookOpen className="pointer-events-none absolute right-24 bottom-2 hidden h-20 w-20 text-white/10 sm:block" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/70">Teacher Portal · Session 2025–26</p>
            <h1 className="mt-3 font-display text-[1.6rem] leading-tight font-extrabold text-white sm:text-[2.1rem]">Welcome back, {firstName}</h1>
            <p className="mt-3 max-w-lg text-[0.9rem] text-white/80">Great teachers create a brighter future for every student — here's everything on your plate today.</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link to="/classes" className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-[0.8rem] font-bold text-primary-700 transition hover:bg-white">
                <CalendarDays className="h-4 w-4" /> Full schedule
              </Link>
              <Link to="/attendance/mark" className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[0.8rem] font-bold text-white transition hover:bg-white/15">
                <ClipboardList className="h-4 w-4" /> Mark attendance
              </Link>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="glass rounded-2xl p-4 text-center">
              <RadialProgress value={overall} size={92} tone="#34D399" label="Performance" />
            </div>
            <div className="hidden flex-col gap-3 sm:flex">
              <div className="glass rounded-2xl px-4 py-3">
                <p className="text-[0.66rem] font-bold uppercase tracking-wide text-white/60">Classes today</p>
                <p className="font-numeric text-lg font-extrabold text-white">{schedule.length}</p>
              </div>
              <div className="glass rounded-2xl px-4 py-3">
                <p className="text-[0.66rem] font-bold uppercase tracking-wide text-white/60">Rating</p>
                <p className="font-numeric text-lg font-extrabold text-white">{me.rating} / 5</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My classes" value={myClasses.length} icon={<Users className="h-5 w-5" />} tone="primary" hint="assigned this term" />
        <StatCard label="Total students" value={me.students} icon={<GraduationCap className="h-5 w-5" />} tone="warn" hint="across my classes" />
        <StatCard label="Attendance today" value={me.attendanceRate} suffix="%" icon={<ClipboardList className="h-5 w-5" />} tone="success" delta={1.2} />
        <StatCard label="Subjects" value={me.subjects.length} icon={<BookOpen className="h-5 w-5" />} tone="analytics" hint={me.subjects.join(" · ")} />
      </div>

      {/* Schedule + Performance + Quick actions */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader title="My class schedule" subtitle="Today's periods, rooms and status" icon={<Clock className="h-4 w-4" />} action={<Link to="/classes"><Button variant="ghost" size="sm">View full schedule</Button></Link>} />
          <div className="overflow-x-auto">
            <table className="table-saas">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, i) => (
                  <tr key={i}>
                    <td className="font-numeric">{row.time}</td>
                    <td><Badge tone="analytics">{row.className}</Badge></td>
                    <td className="font-semibold text-slate-700 dark:text-slate-200">{row.subject}</td>
                    <td className="text-slate-500 dark:text-slate-400">{row.room}</td>
                    <td><Badge tone={statusToneLocal(row.status)} dot>{row.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="My performance" subtitle="This month" className="-mx-5 -mt-5 mb-4" icon={<Star className="h-4 w-4" />} />
          <div className="flex items-center justify-center">
            <RadialProgress value={overall} size={132} stroke={12} label="Overall" tone="#0EA5A4" />
          </div>
          <ul className="mt-5 space-y-3">
            {metrics.map((m) => (
              <li key={m.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[0.8rem] font-semibold text-slate-600 dark:text-slate-300">
                  <span className={cn("h-2 w-2 rounded-full", TONE_DOT[m.tone])} /> {m.label}
                </span>
                <span className="font-numeric text-[0.8rem] font-bold text-slate-800 dark:text-slate-100">{m.value}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <CardHeader title="Quick actions" subtitle="Jump straight into your daily tasks" className="-mx-5 -mt-5 mb-4" icon={<Sparkles className="h-4 w-4" />} />
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to} className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 p-3.5 text-center transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md dark:border-white/10 dark:hover:bg-white/5">
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", TONE_TILE[a.tone])}>{a.icon}</span>
                <span className="text-[0.74rem] leading-tight font-bold text-slate-700 dark:text-slate-200">{a.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Today's classes + activity + motivation */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title="Today's classes" subtitle="Your periods at a glance" icon={<CalendarDays className="h-4 w-4" />} />
          <ul className="divide-y divide-slate-100 dark:divide-white/8">
            {schedule.slice(0, 4).map((row, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3.5">
                <span className={cn("h-9 w-1.5 shrink-0 rounded-full", TONE_DOT[statusToneLocal(row.status)])} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">Class {row.className}</span>
                    <span className="font-numeric text-[0.72rem] text-slate-400">{row.time}</span>
                  </span>
                  <span className="mt-0.5 block text-[0.76rem] text-slate-500 dark:text-slate-400">{row.subject}</span>
                </span>
                <Badge tone={statusToneLocal(row.status)}>{row.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Recent activity" subtitle="What's happened today" icon={<Activity className="h-4 w-4" />} />
          <div className="p-5">
            <Timeline items={activityFeed} />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-secondary-400/15 via-primary-500/10 to-transparent p-5">
            <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-primary-500/15 blur-2xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                <Sparkles className="h-3.5 w-3.5" /> Daily motivation
              </span>
              <p className="mt-3 text-[0.92rem] font-semibold text-slate-800 dark:text-slate-100">A great teacher is a guide, not just a lecturer.</p>
              <p className="mt-1.5 text-[0.8rem] text-slate-500 dark:text-slate-400">Your guidance shapes tomorrow — keep going.</p>
              <Link to="/classes" className="mt-4 inline-flex items-center gap-1.5 text-[0.78rem] font-bold text-primary-600 dark:text-primary-300">
                Keep going <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
          <SystemStatusCard />
        </div>
      </div>
    </div>
  );
}

function StudentGrowthLineWrapper() {
  const { growth } = useDashboardData();
  return (
    <Card>
      <CardHeader title="Enrolment trajectory" subtitle="Roll strength over the last 12 months" icon={<TrendingUp className="h-4 w-4" />} />
      <div className="p-4">{growth.isLoading ? <ChartSkeleton height={240} /> : <StudentGrowthLine data={growth.data ?? []} height={240} />}</div>
    </Card>
  );
}

/* --------------------------------------------------- Analytics studio */

export function AnalyticsStudio() {
  const { attendance, revenue, growth, subjects, examStats } = useDashboardData();
  const [range, setRange] = useState({ from: "2026-01-01", to: "2026-03-01" });
  usePageTitle("Analytics Studio");

  const exportChart = () =>
    exportExcel(
      (attendance.data ?? []).slice(-30).map((d) => ({ ...d })),
      [
        { key: "date", label: "Date" },
        { key: "present", label: "Present" },
        { key: "absent", label: "Absent" },
        { key: "late", label: "Late" },
        { key: "rate", label: "Rate %" },
      ],
      "analytics-attendance",
    );

  return (
    <div>
      <PageHeader
        title="Analytics Studio"
        subtitle="Cross-module analytics with date-range filtering, drill-down and export. Data refreshes from the warehouse every 5 minutes."
        breadcrumb={[{ label: "Overview" }, { label: "Analytics Studio" }]}
        actions={
          <>
            <Button variant="outline" icon={<CalendarDays className="h-4 w-4" />} onClick={() => setRange({ from: range.from === "2026-01-01" ? "2025-09-01" : "2026-01-01", to: range.to })}>
              {range.from} → {range.to}
            </Button>
            <Button variant="primary" icon={<Download className="h-4 w-4" />} onClick={() => { exportChart(); toast.success("Dataset exported", "analytics-attendance.xls downloaded."); }}>
              Export dataset
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attendance (30d avg)" value={94.2} decimals={1} suffix="%" icon={<ClipboardList className="h-5 w-5" />} tone="success" delta={1.2} />
        <StatCard label="Fee realisation" value={87.6} decimals={1} suffix="%" icon={<CreditCard className="h-5 w-5" />} tone="warn" delta={3.4} />
        <StatCard label="Avg. exam score" value={78.6} decimals={1} suffix="%" icon={<Award className="h-5 w-5" />} tone="analytics" delta={2.8} />
        <StatCard label="Dropout risk cases" value={17} icon={<AlertTriangle className="h-5 w-5" />} tone="danger" delta={-12} hint="AI flagged this week" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Attendance trend" subtitle="90 days of campus presence" />
          <div className="p-4">{attendance.isLoading ? <ChartSkeleton /> : <AttendanceAreaChart data={attendance.data ?? []} height={300} />}</div>
        </Card>
        <Card>
          <CardHeader title="Revenue vs target" subtitle="Collected, outstanding and expenses" />
          <div className="p-4">{revenue.isLoading ? <ChartSkeleton /> : <RevenueBarChart data={revenue.data ?? []} height={300} />}</div>
        </Card>
        <Card>
          <CardHeader title="Enrolment growth" subtitle="Admissions vs exits" />
          <div className="p-4">{growth.isLoading ? <ChartSkeleton /> : <GrowthAreaChart data={growth.data ?? []} height={300} />}</div>
        </Card>
        <Card>
          <CardHeader title="Subject performance radar" subtitle="Current vs previous term index" />
          <div className="p-4">{subjects.isLoading ? <ChartSkeleton /> : <SubjectRadarChart data={subjects.data ?? []} height={300} comparison />}</div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Examination performance" subtitle="All exam cycles with distinction counts" />
          <div className="p-4">{examStats.isLoading ? <ChartSkeleton /> : <ExamBarChart data={(examStats.data ?? []).map((e) => ({ exam: e.exam, passed: e.passed, failed: e.failed, distinction: e.distinction, avg: e.avg }))} height={320} />}</div>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader title="Cohort drill-down" subtitle="Section-level metrics with export" />
          <div className="p-4">
            <EmptyState
              icon={<FileBarChart2 className="h-7 w-7" />}
              title="Build a custom cohort view"
              message="Select filters for grade, section, gender, transport and fee status to generate a drill-down dataset with export options."
              action={<Link to="/reports"><Button variant="primary">Open Reports Centre</Button></Link>}
              secondary={<Button variant="outline" onClick={exportChart}>Export attendance set</Button>}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
