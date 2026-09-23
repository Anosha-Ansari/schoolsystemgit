import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileBarChart2,
  MapPin,
  Printer,
  QrCode,
  Save,
  ScanLine,
  Send,
  Sparkles,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { AttendanceAreaChart, AttendanceHeatmap, ExamBarChart, HorizontalBarChart, SubjectRadarChart } from "@/components/charts";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  ProgressBar,
  RadialProgress,
  Select,
  StatCard,
  Stepper,
  Tabs,
  Textarea,
  statusTone,
} from "@/components/ui";
import { api, exportCSV, exportExcel, exportPDF } from "@/lib/api";
import { qk, toast, useDebounced, usePageTitle, useShellStore } from "@/lib/store";
import { CLASS_NAMES, SUBJECTS, exams as seedExams, examPapers as seedPapers, type Assignment, type Exam, type Mark } from "@/lib/db";
import { cn } from "@/utils/cn";

/* -------------------------------------------------------- Attendance */

export function AttendanceHub({ initialTab = "manual" }: { initialTab?: string }) {
  const [tab, setTab] = useState(initialTab);
  const [className, setClassName] = useState("Grade 9-A");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState<Record<string, "Present" | "Absent" | "Late" | "Leave">>({});
  const [scanCode, setScanCode] = useState("");
  const [scanResult, setScanResult] = useState<{ valid: boolean; student?: { name: string; rollNo: string }; at?: string; gate?: string } | null>(null);
  const today = useQuery({ queryKey: qk.attendanceToday, queryFn: () => api.attendance.today() });
  const series = useQuery({ queryKey: qk.attendance(90), queryFn: () => api.metrics.attendance(90) });
  const heat = useQuery({ queryKey: ["heatmap"], queryFn: () => api.attendance.heatmap() });
  usePageTitle("Attendance");

  const roster = (today.data ?? []).filter((r) => r.className === className).slice(0, 32);
  const effective = (id: string, fallback: string) => statuses[id] ?? (fallback as "Present" | "Absent" | "Late" | "Leave");
  const counts = useMemo(() => {
    const base = { Present: 0, Absent: 0, Late: 0, Leave: 0 };
    roster.forEach((r) => { base[effective(r.studentId, r.status)] += 1; });
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster, statuses]);

  const save = async () => {
    const entries = roster.map((r) => ({ studentId: r.studentId, status: effective(r.studentId, r.status) }));
    const res = await api.attendance.mark(entries, date);
    toast.success("Attendance submitted", `${res.saved} records saved for ${className} · ${res.anomalies} absences notified to guardians by SMS.`);
  };

  const bulkSet = (status: "Present" | "Absent" | "Late" | "Leave") => {
    const next: Record<string, "Present" | "Absent" | "Late" | "Leave"> = {};
    roster.forEach((r) => (next[r.studentId] = status));
    setStatuses(next);
    toast.info(`Bulk marked ${status}`, `${roster.length} students updated in the grid.`);
  };

  return (
    <div>
      <PageHeader
        title="Attendance Management"
        subtitle="QR gate scanning, biometric-ready terminals, manual registers, bulk marking, heatmaps and analytics — reconciled into one ledger."
        breadcrumb={[{ label: "Academics" }, { label: "Attendance" }]}
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportCSV((today.data ?? []) as unknown as Record<string, unknown>[], [{ key: "rollNo", label: "Roll" }, { key: "name", label: "Student" }, { key: "status", label: "Status" }], "attendance-today"); toast.success("CSV exported"); }}>
              Export register
            </Button>
            <Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={save}>
              Submit attendance
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present today" value={counts.Present} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" hint={`${Math.round((counts.Present / Math.max(1, roster.length)) * 100)}% of roster`} />
        <StatCard label="Absent" value={counts.Absent} icon={<XCircle className="h-5 w-5" />} tone="danger" hint="Guardian SMS sent" />
        <StatCard label="Late arrivals" value={counts.Late} icon={<ClipboardList className="h-5 w-5" />} tone="warn" hint="After 08:15 AM" />
        <StatCard label="Approved leave" value={counts.Leave} icon={<BadgeCheck className="h-5 w-5" />} tone="muted" hint="Medical / family" />
      </div>

      <Tabs
        tabs={[
          { id: "manual", label: "Manual register", icon: <ClipboardList className="h-3.5 w-3.5" /> },
          { id: "qr", label: "QR / Biometric", icon: <QrCode className="h-3.5 w-3.5" /> },
          { id: "reports", label: "Reports" },
          { id: "heatmap", label: "Heatmap" },
          { id: "analytics", label: "Analytics" },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-6"
      />

      {tab === "manual" && (
        <Card className="overflow-hidden">
          <CardHeader
            title="Class register"
            subtitle={`${className} · ${date} · ${roster.length} students`}
            action={
              <div className="flex flex-wrap items-end gap-2.5">
                <Select value={className} onChange={(e) => { setClassName(e.target.value); setStatuses({}); }} className="w-40">
                  {CLASS_NAMES.map((c) => <option key={c}>{c}</option>)}
                </Select>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
              </div>
            }
          />
          <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3 dark:border-white/8">
            <span className="text-[0.74rem] font-semibold uppercase tracking-wide text-slate-400">Bulk:</span>
            {(["Present", "Absent", "Late", "Leave"] as const).map((s) => (
              <Button key={s} variant="outline" size="sm" onClick={() => bulkSet(s)}>{s}</Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => toast.info("QR mode", "Switch to the QR tab to scan students at the gate.")}>Use gate scans</Button>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {roster.map((r) => {
              const status = effective(r.studentId, r.status);
              return (
                <motion.div key={r.studentId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                  <Avatar name={r.name} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.84rem] font-semibold text-slate-800 dark:text-slate-100">{r.name}</span>
                    <span className="block text-[0.7rem] text-slate-400">Roll {r.rollNo} · {r.markedBy}</span>
                  </span>
                  <Select
                    value={status}
                    onChange={(e) => setStatuses((s) => ({ ...s, [r.studentId]: e.target.value as "Present" | "Absent" | "Late" | "Leave" }))}
                    className={cn(
                      "w-28 py-1.5 text-[0.74rem]",
                      status === "Present" && "border-success-500/50 text-success-600",
                      status === "Absent" && "border-danger-500/50 text-danger-500",
                      status === "Late" && "border-secondary-400/60 text-secondary-600",
                    )}
                  >
                    {["Present", "Absent", "Late", "Leave"].map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </motion.div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-white/8">
            <p className="text-[0.8rem] text-slate-500 dark:text-slate-400">Saving writes a single bulk upsert per class and triggers guardian notifications for absences.</p>
            <Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={save}>Submit {roster.length} records</Button>
          </div>
        </Card>
      )}

      {tab === "qr" && (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <CardHeader title="QR / Biometric scanner" subtitle="Turnstile 2 · Main Gate" className="mb-5" icon={<ScanLine className="h-4 w-4" />} />
            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50/50 px-6 py-10 dark:border-primary-500/30 dark:bg-primary-500/8">
              <span className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-primary-500 shadow-lift dark:bg-white/10">
                <span className="absolute inset-0 animate-ping-slow rounded-3xl bg-primary-500/25" />
                <QrCode className="h-12 w-12" />
              </span>
              <p className="mt-5 text-[0.86rem] font-semibold text-slate-700 dark:text-slate-200">Scan student ID card or search by roll number</p>
              <div className="mt-5 flex w-full flex-wrap items-end gap-2.5">
                <Field label="Card / roll number" className="min-w-[12rem] flex-1">
                  <Input value={scanCode} onChange={(e) => setScanCode(e.target.value)} placeholder="e.g. 90124" />
                </Field>
                <Button variant="primary" onClick={async () => { const res = await api.attendance.qrScan(scanCode || "90124"); setScanResult(res); toast.success("Entry logged", `${res.student?.name} marked present at ${res.at}.`); }}>
                  Verify entry
                </Button>
              </div>
              <p className="mt-4 text-[0.76rem] text-slate-500 dark:text-slate-400">Biometric terminals use the same endpoint — fingerprint template stored as a hash, never as an image.</p>
            </div>

            {scanResult?.student && (
              <div className="mt-6 flex items-center gap-4 rounded-2xl border border-success-500/30 bg-success-100/50 p-4 dark:bg-success-500/10">
                <Avatar name={scanResult.student.name} size={44} />
                <div>
                  <p className="text-[0.92rem] font-bold">{scanResult.student.name}</p>
                  <p className="text-[0.76rem] text-slate-600 dark:text-slate-300">Roll {scanResult.student.rollNo} · {scanResult.gate} · {scanResult.at}</p>
                </div>
                <Badge tone="success" className="ml-auto" dot>Present</Badge>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <CardHeader title="Live gate feed" subtitle="Most recent scans across all entrances" className="mb-5" />
            <ul className="space-y-3">
              {(today.data ?? []).slice(0, 12).map((r, i) => (
                <li key={r.studentId} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-white/10">
                  <span className="font-numeric text-[0.74rem] text-slate-400">{`07:${45 + i}:${(i * 7) % 60}`}</span>
                  <Avatar name={r.name} size={28} />
                  <span className="min-w-0 flex-1 truncate text-[0.82rem]">{r.name}</span>
                  <Badge tone={r.markedBy === "QR Scan" ? "primary" : "muted"}>{r.markedBy}</Badge>
                  <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === "reports" && (
        <Card className="overflow-hidden">
          <CardHeader
            title="Attendance reports"
            subtitle="Daily, weekly, monthly and custom range with class-wise breakdown"
            action={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={<FileBarChart2 className="h-3.5 w-3.5" />} onClick={() => toast.success("Report generated", "Monthly attendance register ready with 42 pages.")}>Generate</Button>
                <Button variant="ghost" size="sm" icon={<Printer className="h-3.5 w-3.5" />} onClick={() => exportPDF("attendance-report")}>Print</Button>
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="table-saas">
              <thead><tr><th>Date</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance %</th><th>Trend</th></tr></thead>
              <tbody>
                {(series.data ?? []).slice(-14).reverse().map((d) => (
                  <tr key={d.date}>
                    <td className="font-numeric">{d.date}</td>
                    <td className="font-numeric text-success-500">{d.present}</td>
                    <td className="font-numeric text-danger-500">{d.absent}</td>
                    <td className="font-numeric text-secondary-600 dark:text-secondary-300">{d.late}</td>
                    <td className="font-numeric font-bold">{d.rate}%</td>
                    <td className="w-40"><ProgressBar value={d.rate} tone={d.rate > 94 ? "success" : d.rate > 88 ? "primary" : "warn"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "heatmap" && (
        <Card className="p-6">
          <CardHeader title="Attendance heatmap" subtitle="84-day density — darker cells indicate higher campus presence" className="mb-6" />
          {heat.isLoading ? <div className="skeleton h-48 w-full" /> : <AttendanceHeatmap data={heat.data ?? []} />}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { k: "Best day", v: "Wednesday · 96.4%" },
              { k: "Weakest day", v: "Monday · 89.1%" },
              { k: "Longest streak", v: "17 days above 95%" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">{s.k}</p>
                <p className="mt-1 text-[0.92rem] font-bold">{s.v}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "analytics" && (
        <div className="grid gap-6">
          <Card>
            <CardHeader title="Attendance analytics" subtitle="90-day presence, lateness and absence trend" />
            <div className="p-4">{series.isLoading ? <div className="skeleton h-64 w-full" /> : <AttendanceAreaChart data={series.data ?? []} height={300} />}</div>
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Class-wise attendance" subtitle="Sections with the weakest presence" />
              <div className="p-4">
                <HorizontalBarChart
                  data={[
                    { name: "Grade 9-C", value: 82 },
                    { name: "Grade 8-B", value: 86 },
                    { name: "Grade 7-A", value: 89 },
                    { name: "Grade 10-A", value: 93 },
                    { name: "Grade 11-B", value: 95 },
                    { name: "Grade 6-A", value: 97 },
                  ]}
                  height={260}
                  tone="#FACC15"
                />
              </div>
            </Card>
            <Card className="p-6">
              <CardHeader title="AI attendance insight" subtitle="Anomaly detection from the ERP model" className="mb-5" icon={<Sparkles className="h-4 w-4" />} />
              <ul className="space-y-3.5 text-[0.84rem] text-slate-600 dark:text-slate-300">
                <li className="rounded-2xl border border-analytics-500/25 bg-analytics-100/50 p-4 dark:bg-analytics-500/10">
                  Monday first-period absenteeism is 12% above baseline. Correlated with routes R-4 and R-7 departure delays.
                </li>
                <li className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                  17 students have dropped below the 80% threshold for two consecutive weeks — mentor assignment recommended.
                </li>
                <li className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                  SMS reminders sent 30 minutes before the gate closes improved punctuality by 2.4% within a week.
                </li>
              </ul>
              <Button variant="primary" className="mt-5" onClick={() => toast.info("Reminder campaign queued", "Guardian SMS batch scheduled for 7:30 AM tomorrow.")} icon={<Send className="h-4 w-4" />}>
                Run guardian reminder campaign
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------- Examinations */

export function ExaminationsList() {
  const [examId, setExamId] = useState<string | null>(null);
  usePageTitle("Examinations");
  const list = seedExams;

  return (
    <div>
      <PageHeader
        title="Examination Management"
        subtitle="Create exams, allocate halls and invigilators, enter marks with auto-grading, compute positions and publish results."
        breadcrumb={[{ label: "Academics" }, { label: "Examinations" }]}
        actions={
          <>
            <Link to="/examinations/marks"><Button variant="outline" icon={<Upload className="h-4 w-4" />}>Marks entry</Button></Link>
            <Link to="/examinations/new"><Button variant="primary" icon={<BookOpen className="h-4 w-4" />}>Create exam</Button></Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active exams" value={list.filter((e) => e.status !== "Published").length} icon={<BookOpen className="h-5 w-5" />} tone="primary" />
        <StatCard label="Papers scheduled" value={seedPapers.length} icon={<CalendarDays className="h-5 w-5" />} tone="analytics" />
        <StatCard label="Invigilators" value={list[3]?.invigilators.length ?? 11} icon={<Users className="h-5 w-5" />} tone="success" />
        <StatCard label="Results published" value={list.filter((e) => e.resultsPublished).length} icon={<Award className="h-5 w-5" />} tone="warn" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {list.map((e) => (
          <Card key={e.id} hover className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[1rem] font-bold text-slate-900 dark:text-white">{e.name}</p>
                <p className="mt-1 text-[0.78rem] text-slate-500 dark:text-slate-400">{e.term} · {e.startDate} → {e.endDate}</p>
              </div>
              <Badge tone={statusTone(e.status)} dot>{e.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-[0.78rem]">
              <span className="rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10"><span className="block text-slate-400">Classes</span>{e.classes.length}</span>
              <span className="rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10"><span className="block text-slate-400">Subjects</span>{e.subjects}</span>
              <span className="rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10"><span className="block text-slate-400">Halls</span>{e.halls.length}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setExamId(e.id)}>Schedule & halls</Button>
              <Link to={`/examinations/marks?exam=${e.id}`}><Button variant="ghost" size="sm">Marks entry</Button></Link>
              <Link to="/results"><Button variant="ghost" size="sm">Results</Button></Link>
              {e.resultsPublished ? <Badge tone="success">Published</Badge> : <Button variant="primary" size="sm" onClick={() => toast.info("Publish check", "Verify marks entry completion before publishing.")}>Publish</Button>}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!examId} onClose={() => setExamId(null)} title="Exam schedule & hall allocation" subtitle={seedExams.find((e) => e.id === examId)?.name} size="xl" icon={<CalendarDays className="h-5 w-5" />}>
        <div className="overflow-x-auto">
          <table className="table-saas">
            <thead><tr><th>Date</th><th>Time</th><th>Class</th><th>Subject</th><th>Hall</th><th>Invigilator</th><th>Total marks</th><th>Status</th></tr></thead>
            <tbody>
              {seedPapers.filter((p) => p.examId === examId).map((p) => (
                <tr key={p.id}>
                  <td className="font-numeric">{p.date}</td>
                  <td>{p.time}</td>
                  <td><Badge tone="primary">{p.className}</Badge></td>
                  <td className="font-semibold">{p.subject}</td>
                  <td className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {p.hall}</td>
                  <td>{p.invigilator}</td>
                  <td className="font-numeric">{p.totalMarks}</td>
                  <td><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2.5">
          <Button variant="outline" onClick={() => exportPDF("exam-schedule")} icon={<Printer className="h-4 w-4" />}>Print schedule</Button>
          <Button variant="primary" onClick={() => { toast.success("Schedule locked", "Dated sheet and seat plan published to portals."); setExamId(null); }}>Lock schedule</Button>
        </div>
      </Modal>
    </div>
  );
}

export function ExamCreate() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", term: "Term 2", start: "", end: "", classes: [] as string[], subjects: 6, halls: ["Main Hall"], invigilators: 8, scheme: "60/25/15" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  usePageTitle("Create Exam");
  const steps = ["Exam details", "Classes & subjects", "Halls & invigilation", "Grading scheme"];

  const next = () => {
    const err: Record<string, string> = {};
    if (step === 0 && form.name.trim().length < 5) err.name = "Enter the exam name";
    if (step === 0 && (!form.start || !form.end)) err.start = "Start and end dates are required";
    if (step === 1 && form.classes.length === 0) err.classes = "Select at least one class";
    setErrors(err);
    if (Object.keys(err).length) return;
    if (step < steps.length - 1) setStep(step + 1);
    else toast.success("Exam created", `${form.name} drafted for ${form.classes.length} classes · seat plan and date sheet generated.`);
  };

  return (
    <div>
      <PageHeader
        title="Create examination"
        subtitle="Four-step wizard: details, classes, halls and grading scheme with automatic mark sheet generation."
        breadcrumb={[{ label: "Academics" }, { label: "Examinations", to: "/examinations" }, { label: "Create" }]}
        actions={<Link to="/examinations"><Button variant="ghost">Cancel</Button></Link>}
      />
      <Card className="p-6">
        <Stepper steps={steps.map((s, i) => ({ id: String(i), label: s }))} current={step} onJump={setStep} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {step === 0 && (
            <>
              <Field label="Exam name" required error={errors.name} className="sm:col-span-2">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pre-Board Examination 2026" />
              </Field>
              <Field label="Term">
                <Select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}>
                  {["Term 1", "Term 2", "Term 3"].map((t) => <option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Grading scheme">
                <Select value={form.scheme} onChange={(e) => setForm({ ...form, scheme: e.target.value })}>
                  {["60/25/15", "70/20/10", "50/30/20", "Exam only"].map((s) => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Start date" required error={errors.start}>
                <Input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              </Field>
              <Field label="End date" required>
                <Input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
              </Field>
            </>
          )}

          {step === 1 && (
            <div className="sm:col-span-2">
              <p className="label-saas">Select classes {errors.classes && <span className="text-danger-500">— {errors.classes}</span>}</p>
              <div className="flex flex-wrap gap-2">
                {CLASS_NAMES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, classes: f.classes.includes(c) ? f.classes.filter((x) => x !== c) : [...f.classes, c] }))}
                    className={cn("rounded-xl border px-3 py-2 text-[0.78rem] font-semibold transition", form.classes.includes(c) ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-white" : "border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400")}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Subjects per class">
                  <Input type="number" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: Number(e.target.value) })} />
                </Field>
                <Field label="Papers generated">
                  <div className="rounded-xl border border-slate-200 px-4 py-3 text-[0.82rem] text-slate-500 dark:border-white/10 dark:text-slate-400">
                    {form.classes.length * form.subjects} papers will be created across {form.classes.length} classes.
                  </div>
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <div className="sm:col-span-2">
                <p className="label-saas">Halls in use</p>
                <div className="flex flex-wrap gap-2">
                  {["Main Hall", "Hall B", "Hall C", "Hall D", "Auditorium", "Room 201"].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, halls: f.halls.includes(h) ? f.halls.filter((x) => x !== h) : [...f.halls, h] }))}
                      className={cn("rounded-xl border px-3 py-2 text-[0.78rem] font-semibold transition", form.halls.includes(h) ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-white" : "border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400")}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Invigilators required per paper">
                <Input type="number" value={form.invigilators} onChange={(e) => setForm({ ...form, invigilators: Number(e.target.value) })} />
              </Field>
              <Field label="Seating plan">
                <Select defaultValue="Alphabetical roll order">
                  {["Alphabetical roll order", "Randomised (anti-cheating)", "Roll number order"].map((s) => <option key={s}>{s}</option>)}
                </Select>
              </Field>
            </>
          )}

          {step === 3 && (
            <div className="sm:col-span-2">
              <div className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
                <h3 className="text-[0.92rem] font-bold">Grading configuration</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { k: "A+", v: "90% and above" },
                    { k: "A", v: "80 – 89%" },
                    { k: "B", v: "70 – 79%" },
                    { k: "C", v: "60 – 69%" },
                    { k: "D", v: "50 – 59%" },
                    { k: "F", v: "Below 40%" },
                  ].map((g) => (
                    <div key={g.k} className="rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-white/10">
                      <p className="font-numeric text-[0.92rem] font-bold text-slate-900 dark:text-white">{g.k}</p>
                      <p className="text-[0.74rem] text-slate-500 dark:text-slate-400">{g.v}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[0.8rem] text-slate-500 dark:text-slate-400">
                  Grades, positions and pass/fail flags are computed automatically at marks-entry time. Raw marks are retained for audit even after grade publication.
                </p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Result publishing">
                  <Select defaultValue="Publish after admin approval">
                    {["Publish after admin approval", "Publish automatically after verification", "Manual publish per section"].map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Remark template">
                  <Select defaultValue="Performance-based remarks">
                    {["Performance-based remarks", "Teacher-written remarks only", "No remarks"].map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button variant="primary" onClick={next}>{step === steps.length - 1 ? "Create exam" : "Continue"}</Button>
          <p className="text-[0.78rem] text-slate-400">Draft is autosaved every 20 seconds.</p>
        </div>
      </Card>
    </div>
  );
}

export function ExamMarksEntry() {
  const [examId, setExamId] = useState(seedExams[2].id);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  usePageTitle("Marks Entry");

  const rows: Mark[] = useMemo(() => {
    const existing = (window as unknown as { __mk?: Mark[] }).__mk;
    return (existing ?? []).filter((m) => m.examId === examId && m.subject === subject);
  }, [examId, subject]);

  const grade = (v: number) => (v >= 90 ? "A+" : v >= 80 ? "A" : v >= 70 ? "B" : v >= 60 ? "C" : v >= 50 ? "D" : v >= 40 ? "E" : "F");
  const classAvg = Object.values(marks).length ? Math.round(Object.values(marks).reduce((a, b) => a + b, 0) / Object.values(marks).length) : 0;

  return (
    <div>
      <PageHeader
        title="Marks Entry & Auto-Grading"
        subtitle="Enter raw marks — the ERP computes grades, positions, class averages and pass/fail automatically with validation."
        breadcrumb={[{ label: "Academics" }, { label: "Examinations", to: "/examinations" }, { label: "Marks entry" }]}
        actions={
          <>
            <Button variant="outline" icon={<Upload className="h-4 w-4" />} onClick={() => toast.info("Import marks", "Excel import validates roll numbers and marks range before commit.")}>Import from Excel</Button>
            <Button
              variant="primary"
              icon={<Save className="h-4 w-4" />}
              loading={saving}
              onClick={async () => {
                setSaving(true);
                const res = await api.exams.saveMarks(Object.entries(marks).map(([studentId, obtained]) => ({ studentId, subject, obtained })));
                setSaving(false);
                toast.success("Marks saved", `${res.saved} entries stored · grades computed · positions recalculated.`);
              }}
            >
              Save marks
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students in sheet" value={rows.length || 26} icon={<Users className="h-5 w-5" />} tone="primary" />
        <StatCard label="Entered marks" value={Object.keys(marks).length} icon={<ClipboardList className="h-5 w-5" />} tone="analytics" />
        <StatCard label="Running average" value={classAvg} suffix="%" icon={<Award className="h-5 w-5" />} tone={classAvg >= 70 ? "success" : "warn"} />
        <StatCard label="Validation errors" value={0} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" hint="All marks within range" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Mark sheet"
          subtitle="Marks are validated against total marks per paper and cannot exceed the maximum."
          action={
            <div className="flex flex-wrap gap-2.5">
              <Select value={examId} onChange={(e) => setExamId(e.target.value)} className="w-48">
                {seedExams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
              <Select value={subject} onChange={(e) => { setSubject(e.target.value); setMarks({}); }} className="w-44">
                {SUBJECTS.slice(0, 6).map((s) => <option key={s}>{s}</option>)}
              </Select>
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="table-saas">
            <thead><tr><th>Roll</th><th>Student</th><th>Class</th><th>Marks (max 100)</th><th>Grade</th><th>Status</th></tr></thead>
            <tbody>
              {(rows.length ? rows : generateDemoRows()).map((m) => {
                const value = marks[m.studentId] ?? m.obtained;
                const passed = value >= 40;
                return (
                  <tr key={m.studentId}>
                    <td className="font-numeric">{m.studentId.replace("S-", "")}</td>
                    <td className="font-semibold text-slate-800 dark:text-slate-100">{m.studentName}</td>
                    <td><Badge tone="primary">{m.className}</Badge></td>
                    <td className="w-40">
                      <Input
                        type="number"
                        value={String(value)}
                        min={0}
                        max={100}
                        onChange={(e) => setMarks((prev) => ({ ...prev, [m.studentId]: Math.max(0, Math.min(100, Number(e.target.value))) }))}
                        className="py-1.5"
                      />
                    </td>
                    <td><Badge tone={value >= 80 ? "success" : value >= 50 ? "primary" : "danger"}>{grade(value)}</Badge></td>
                    <td>{passed ? <span className="text-[0.78rem] font-semibold text-success-600">Pass</span> : <span className="text-[0.78rem] font-semibold text-danger-500">Fail — remedial required</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-white/8">
          <p className="text-[0.8rem] text-slate-500 dark:text-slate-400">Auto-grade rule set: A+ (90+), A (80+), B (70+), C (60+), D (50+), F (&lt;40). Pass mark 40.</p>
          <div className="flex gap-2.5">
            <Button variant="outline" size="sm" onClick={() => exportPDF("mark-sheet")} icon={<Printer className="h-3.5 w-3.5" />}>Print sheet</Button>
            <Link to={`/examinations/${examId}`}><Button variant="primary" size="sm">Exam dashboard</Button></Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function generateDemoRows(): Mark[] {
  const rows: Mark[] = [];
  for (let i = 0; i < 18; i++) {
    rows.push({
      id: `demo-${i}`,
      examId: seedExams[2].id,
      studentId: `S-${1000 + i}`,
      studentName: ["Ahmed Khan", "Fatima Raza", "Zain Malik", "Hoorain Baig", "Bilal Sheikh", "Ayesha Qureshi", "Hamza Iqbal", "Maryam Nadeem", "Saad Tariq", "Zoya Alam", "Rayyan Farooqi", "Emaan Zafar", "Talha Bhatti", "Laiba Junaid", "Ayaan Mirza", "Noor Kh..", "Shayan Alam", "Rida Ansari"][i],
      className: `Grade ${9 + (i % 2)}-${i % 2 === 0 ? "A" : "B"}`,
      subject: SUBJECTS[i % 6],
      total: 100,
      obtained: 44 + ((i * 7) % 52),
      grade: "",
      remarks: "",
    });
  }
  return rows;
}

export function ExamAnalytics({ examId }: { examId: string }) {
  const query = useQuery({ queryKey: qk.exam(examId), queryFn: () => api.exams.get(examId) });
  usePageTitle("Exam Analytics");
  const paperMarks = seedPapers.filter((p) => p.examId === examId);

  if (!query.data) return <Card className="p-6"><div className="skeleton h-64 w-full" /></Card>;
  const { exam, bySubject, positions } = query.data;

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <CardHeader
          title={`${exam.name} — analytics`}
          subtitle={`${exam.classes.length} classes · ${exam.subjects} subjects · ${exam.halls.length} halls`}
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => { exportExcel(bySubject, [{ key: "subject", label: "Subject" }, { key: "average", label: "Average" }, { key: "passRate", label: "Pass rate" }], `exam-${examId}-subjects`); toast.success("Excel exported"); }}>Excel</Button>
              <Button variant="ghost" size="sm" icon={<Printer className="h-3.5 w-3.5" />} onClick={() => exportPDF(`exam-${examId}`)}>PDF</Button>
            </div>
          }
        />
        <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">Class average</p>
            <p className="font-numeric text-2xl font-extrabold">{Math.round(bySubject.reduce((a, s) => a + s.average, 0) / Math.max(1, bySubject.length))}%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">Pass rate</p>
            <p className="font-numeric text-2xl font-extrabold text-success-600 dark:text-success-400">{Math.round(bySubject.reduce((a, s) => a + s.passRate, 0) / Math.max(1, bySubject.length))}%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">Papers</p>
            <p className="font-numeric text-2xl font-extrabold">{paperMarks.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">Published</p>
            <p className="font-numeric text-2xl font-extrabold">{exam.resultsPublished ? "Yes" : "No"}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Subject-wise performance" subtitle="Average marks and distinction counts" />
          <div className="p-4">
            <ExamBarChart
              data={bySubject.map((s) => ({ exam: s.subject, passed: Math.round((s.passRate / 100) * 26), failed: 26 - Math.round((s.passRate / 100) * 26), distinction: Math.round(s.average / 10), avg: s.average }))}
              height={300}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Subject radar" subtitle="Average index across papers" />
          <div className="p-4">
            <SubjectRadarChart data={bySubject.map((s) => ({ subject: s.subject, score: Math.round(s.average), lastTerm: Math.round(s.average - 4) }))} height={300} comparison />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Merit positions" subtitle="Top 12 students with total marks and grade" action={<Link to="/results/publish"><Button variant="primary" size="sm" icon={<Send className="h-3.5 w-3.5" />}>Publish results</Button></Link>} />
        <div className="overflow-x-auto">
          <table className="table-saas">
            <thead><tr><th>Position</th><th>Student</th><th>Class</th><th>Total</th><th>Average</th><th>Grade</th></tr></thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.studentId}>
                  <td><Badge tone={p.position <= 3 ? "success" : "muted"}>#{p.position}</Badge></td>
                  <td className="font-semibold">{p.name}</td>
                  <td>{p.className}</td>
                  <td className="font-numeric">{p.total}</td>
                  <td className="font-numeric">{p.avg}%</td>
                  <td><Badge tone={p.avg >= 85 ? "success" : p.avg >= 60 ? "primary" : "warn"}>{p.grade}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function ExamDetail() {
  const { examId } = useParams();
  return <ExamAnalyticsRoute examId={examId ?? seedExams[2].id} />;
}

function ExamAnalyticsRoute({ examId }: { examId: string }) {
  return (
    <div>
      <PageHeader
        title="Examination Dashboard"
        subtitle="Hall allocation, invigilation, marks entry completion and result publishing status."
        breadcrumb={[{ label: "Academics" }, { label: "Examinations", to: "/examinations" }, { label: "Dashboard" }]}
        actions={
          <>
            <Link to="/examinations/marks"><Button variant="outline" icon={<ClipboardList className="h-4 w-4" />}>Marks entry</Button></Link>
            <Link to="/results/publish"><Button variant="primary" icon={<Award className="h-4 w-4" />}>Publish results</Button></Link>
          </>
        }
      />
      <ExamAnalytics examId={examId} />
    </div>
  );
}

/* --------------------------------------------------------------- Results */

export function ResultsList() {
  const [examId, setExamId] = useState(seedExams[1].id);
  const [selected, setSelected] = useState<string>("S-1001");
  const report = useQuery({ queryKey: ["report", selected, examId], queryFn: () => api.results.reportCard(selected, examId) });
  const analysis = useQuery({ queryKey: ["subject-analysis", examId], queryFn: () => api.results.subjectAnalysis(examId) });
  usePageTitle("Results");

  return (
    <div>
      <PageHeader
        title="Result Management"
        subtitle="Report cards, subject analysis, historical results and one-click publishing with printable PDF transcripts."
        breadcrumb={[{ label: "Academics" }, { label: "Results" }]}
        actions={
          <>
            <Select value={examId} onChange={(e) => setExamId(e.target.value)} className="w-56">
              {seedExams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
            <Link to="/results/publish"><Button variant="primary" icon={<Send className="h-4 w-4" />}>Publish result</Button></Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card className="p-6">
          <CardHeader title="Report card" subtitle="Printable transcript with subjects, grades, position and remarks" className="mb-5" icon={<Award className="h-4 w-4" />} />
          <div className="mb-4">
            <Field label="Select student">
              <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
                {Array.from({ length: 20 }, (_, i) => `S-${1001 + i}`).map((id, i) => (
                  <option key={id} value={id}>{["Hamza Khan", "Ayesha Siddiqui", "Zain Abbas", "Fatima Noor", "Bilal Ahmed"][i % 5]} — {id}</option>
                ))}
              </Select>
            </Field>
          </div>

          {report.isLoading ? (
            <div className="skeleton h-80 w-full" />
          ) : report.data ? (
            <div className="print-area rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <Avatar name={report.data.student.name} size={48} />
                  <div>
                    <p className="text-[1rem] font-extrabold text-slate-900 dark:text-white">{report.data.student.name}</p>
                    <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">
                      {report.data.student.className}-{report.data.student.section} · Roll {report.data.student.rollNo}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[0.72rem] uppercase tracking-wide text-slate-400">{report.data.exam.name}</p>
                  <p className="font-numeric text-xl font-extrabold text-primary-600 dark:text-primary-300">{report.data.percentage}%</p>
                  <Badge tone={report.data.percentage >= 80 ? "success" : report.data.percentage >= 60 ? "primary" : "warn"}>Grade {report.data.grade}</Badge>
                </div>
              </div>

              <table className="table-saas mt-4">
                <thead><tr><th>Subject</th><th>Total</th><th>Obtained</th><th>Grade</th><th>Remarks</th></tr></thead>
                <tbody>
                  {report.data.rows.map((r) => (
                    <tr key={r.id}>
                      <td className="font-semibold">{r.subject}</td>
                      <td className="font-numeric">{r.total}</td>
                      <td className="font-numeric">{r.obtained}</td>
                      <td><Badge tone={r.grade === "A+" ? "success" : r.grade === "F" ? "danger" : "primary"}>{r.grade}</Badge></td>
                      <td className="text-slate-500 dark:text-slate-400">{r.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-white/10">
                  <p className="text-[0.68rem] uppercase tracking-wide text-slate-400">Total marks</p>
                  <p className="font-numeric text-lg font-bold">{report.data.total} / {report.data.max}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-white/10">
                  <p className="text-[0.68rem] uppercase tracking-wide text-slate-400">Section position</p>
                  <p className="font-numeric text-lg font-bold">#14 / 32</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3.5 dark:border-white/10">
                  <p className="text-[0.68rem] uppercase tracking-wide text-slate-400">Attendance</p>
                  <p className="font-numeric text-lg font-bold">{report.data.student.attendanceRate}%</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 p-4 text-[0.82rem] text-slate-600 dark:border-white/10 dark:text-slate-300">
                <p className="font-semibold text-slate-800 dark:text-slate-100">Class teacher remarks</p>
                <p className="mt-1.5">
                  Consistent effort across science subjects. Focus on presentation and revision discipline in Mathematics to move into
                  the distinction band next term.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button variant="primary" onClick={() => exportPDF(`report-card-${report.data?.student.rollNo}`)} icon={<Printer className="h-3.5 w-3.5" />}>Print / PDF</Button>
                <Button variant="outline" onClick={() => toast.success("Report card emailed", `Sent to ${report.data?.student.guardianEmail}`)} icon={<Send className="h-3.5 w-3.5" />}>Email to guardian</Button>
              </div>
            </div>
          ) : (
            <EmptyState icon={<Award className="h-7 w-7" />} title="No result data" message="Publish the examination to generate report cards." />
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader title="Subject analysis" subtitle="Class-level difficulty, distinction and failure rates" className="mb-5" />
            <div className="overflow-x-auto">
              <table className="table-saas">
                <thead><tr><th>Subject</th><th>Students</th><th>Average</th><th>Distinctions</th><th>Failed</th></tr></thead>
                <tbody>
                  {(analysis.data ?? []).map((s) => (
                    <tr key={s.subject}>
                      <td className="font-semibold">{s.subject}</td>
                      <td className="font-numeric">{s.students}</td>
                      <td className="font-numeric">{s.average}%</td>
                      <td><Badge tone="success">{s.distinction}</Badge></td>
                      <td><Badge tone={s.failed > 3 ? "danger" : "muted"}>{s.failed}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <CardHeader title="Historical performance" subtitle="Last four examination cycles" className="mb-5" />
            <div className="grid grid-cols-4 gap-3">
              {[
                { t: "First Term", v: 76, g: "B" },
                { t: "Mid Term", v: 79, g: "B" },
                { t: "Class Tests", v: 82, g: "A" },
                { t: "Pre-Board", v: 84, g: "A" },
              ].map((h) => (
                <div key={h.t} className="rounded-2xl border border-slate-200 p-4 text-center dark:border-white/10">
                  <p className="text-[0.68rem] uppercase tracking-wide text-slate-400">{h.t}</p>
                  <p className="mt-1 font-numeric text-xl font-extrabold">{h.v}%</p>
                  <Badge tone="primary">{h.g}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <SubjectRadarChart
                data={[
                  { subject: "Mathematics", score: 78, lastTerm: 72 },
                  { subject: "Physics", score: 84, lastTerm: 79 },
                  { subject: "Chemistry", score: 81, lastTerm: 77 },
                  { subject: "Biology", score: 88, lastTerm: 82 },
                  { subject: "English", score: 76, lastTerm: 74 },
                  { subject: "Urdu", score: 90, lastTerm: 86 },
                ]}
                height={300}
                comparison
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ResultsPublish() {
  const [examId, setExamId] = useState(seedExams[2].id);
  const [notify, setNotify] = useState({ guardians: true, students: true, pdf: true });
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState(false);
  usePageTitle("Publish Results");

  return (
    <div>
      <PageHeader
        title="Publish Results"
        subtitle="Verification checklist, hall mark reconciliation and multi-channel notification in one controlled release."
        breadcrumb={[{ label: "Academics" }, { label: "Results", to: "/results" }, { label: "Publish" }]}
        actions={<Link to="/results"><Button variant="ghost">Back to results</Button></Link>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <CardHeader title="Pre-publish verification" subtitle="All checks must pass before release" className="mb-5" />
          <ul className="space-y-3">
            {[
              { t: "All papers have completed marks entry", ok: true },
              { t: "Grades computed against configured scheme", ok: true },
              { t: "Positions recalculated across sections", ok: true },
              { t: "Attendance weight applied (15%)", ok: true },
              { t: "Two papers await invigilator sign-off", ok: false },
            ].map((c) => (
              <li key={c.t} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-[0.86rem]", c.ok ? "border-success-500/30 bg-success-100/40 dark:bg-success-500/8" : "border-secondary-400/40 bg-secondary-200/40 dark:bg-secondary-400/10")}>
                {c.ok ? <CheckCircle2 className="h-4 w-4 text-success-500" /> : <XCircle className="h-4 w-4 text-secondary-600" />}
                <span className={cn("flex-1", !c.ok && "font-semibold text-secondary-700 dark:text-secondary-300")}>{c.t}</span>
                {!c.ok && <Badge tone="warn">Action needed</Badge>}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Field label="Examination">
              <Select value={examId} onChange={(e) => setExamId(e.target.value)}>
                {seedExams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </Field>
          </div>

          <div className="mt-6 space-y-3">
            {[
              { key: "guardians" as const, label: "SMS + email guardians", hint: "Report card PDF attached to email" },
              { key: "students" as const, label: "Publish to student portal", hint: "Instant visibility in /my results" },
              { key: "pdf" as const, label: "Generate printable transcripts", hint: "Bulk PDF generation in the background" },
            ].map((n) => (
              <label key={n.key} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3.5 dark:border-white/10">
                <input type="checkbox" checked={notify[n.key]} onChange={(e) => setNotify({ ...notify, [n.key]: e.target.checked })} className="mt-0.5 h-4 w-4 rounded accent-primary-500" />
                <span>
                  <span className="block text-[0.86rem] font-semibold text-slate-800 dark:text-slate-100">{n.label}</span>
                  <span className="block text-[0.76rem] text-slate-500 dark:text-slate-400">{n.hint}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              loading={publishing}
              onClick={async () => {
                setPublishing(true);
                const res = await api.exams.publish(examId);
                setPublishing(false);
                setDone(true);
                toast.success("Results published", `${res.notify} guardians notified · portal updated instantly.`);
              }}
              icon={<Send className="h-4 w-4" />}
            >
              Publish results now
            </Button>
            <Button variant="outline" onClick={() => toast.info("Draft saved", "Result set saved as draft — publish when sign-off completes.")}>Save as draft</Button>
          </div>

          {done && (
            <div className="mt-6 rounded-2xl border border-success-500/30 bg-success-100/50 p-5 dark:bg-success-500/10">
              <p className="flex items-center gap-2 text-[0.9rem] font-bold text-success-700 dark:text-success-300">
                <CheckCircle2 className="h-4 w-4" /> Published successfully
              </p>
              <p className="mt-2 text-[0.82rem] text-slate-600 dark:text-slate-300">
                Report cards are live in the parent and student portals. The release is recorded in the audit log with your user ID and timestamp.
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <CardHeader title="Release summary" subtitle="Impact preview before publishing" className="mb-5" />
          <div className="space-y-4">
            <div className="flex items-center gap-5 rounded-2xl border border-slate-200 p-5 dark:border-white/10">
              <RadialProgress value={87} label="Complete" />
              <div className="text-[0.84rem] text-slate-600 dark:text-slate-300">
                <p>Marks entered: <span className="font-numeric font-bold">468 / 480</span></p>
                <p className="mt-1">Papers pending: <span className="font-semibold text-secondary-600">2</span></p>
                <p className="mt-1">Students affected: <span className="font-numeric font-bold">412</span></p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
              <p className="text-[0.72rem] uppercase tracking-wide text-slate-400">Distribution preview</p>
              <div className="mt-3 space-y-3">
                {[
                  { k: "A+ / A", v: 24, tone: "success" as const },
                  { k: "B / C", v: 52, tone: "primary" as const },
                  { k: "D / E", v: 18, tone: "warn" as const },
                  { k: "F (fail)", v: 6, tone: "danger" as const },
                ].map((d) => (
                  <div key={d.k}>
                    <div className="flex items-center justify-between text-[0.8rem]">
                      <span className="text-slate-600 dark:text-slate-300">{d.k}</span>
                      <span className="font-numeric font-bold">{d.v}%</span>
                    </div>
                    <ProgressBar value={d.v} tone={d.tone} className="mt-1.5" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-analytics-500/25 bg-analytics-100/40 p-5 dark:bg-analytics-500/10">
              <p className="flex items-center gap-2 text-[0.84rem] font-bold text-analytics-700 dark:text-analytics-300">
                <Sparkles className="h-4 w-4" /> AI suggestion
              </p>
              <p className="mt-2 text-[0.82rem] text-slate-600 dark:text-slate-300">
                Hold publication for Grade 9 until the two pending Physics papers are entered — publishing twice creates confusion in
                guardian notifications.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- Assignments */

export function AssignmentsList() {
  const [params, setParams] = useState({ search: "", page: 1, pageSize: 8, sortBy: "deadline", sortDir: "desc" as "asc" | "desc" });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const search = useDebounced(params.search);
  const query = useQuery({ queryKey: qk.assignments({ ...params, search, filters }), queryFn: () => api.assignments.list({ ...params, search, filters }) });
  const list = query.data?.rows ?? [];
  usePageTitle("Assignments");

  const columns = [
    { key: "title", label: "Assignment", render: (a: Assignment) => <span><span className="block font-semibold text-slate-800 dark:text-slate-100">{a.title}</span><span className="block text-[0.72rem] text-slate-400">{a.subject} · {a.className} · {a.teacher}</span></span> },
    { key: "type", label: "Type", render: (a: Assignment) => <Badge tone="analytics">{a.type}</Badge> },
    { key: "deadline", label: "Deadline", sortable: true },
    { key: "submissions", label: "Submissions", render: (a: Assignment) => <span className="flex w-32 flex-col gap-1.5"><span className="font-numeric text-[0.76rem] font-bold">{a.submissions}/{a.totalStudents}</span><ProgressBar value={(a.submissions / a.totalStudents) * 100} tone={a.submissions / a.totalStudents > 0.8 ? "success" : "warn"} /></span> },
    { key: "attachments", label: "Files", render: (a: Assignment) => <span className="flex items-center gap-1.5 text-[0.78rem] text-slate-500 dark:text-slate-400"><FileBarChart2 className="h-3.5 w-3.5" /> {a.attachments}</span> },
    { key: "status", label: "Status", render: (a: Assignment) => <Badge tone={statusTone(a.status)} dot>{a.status}</Badge> },
    { key: "actions", label: "", render: (a: Assignment) => <Link to={`/assignments/${a.id}`} className="text-[0.76rem] font-bold text-primary-600 dark:text-primary-300">Open →</Link> },
  ];

  return (
    <div>
      <PageHeader
        title="Assignment Management"
        subtitle="Create assignments with file and video attachments, track submissions and grade with feedback."
        breadcrumb={[{ label: "Academics" }, { label: "Assignments" }]}
        actions={<Link to="/assignments/new"><Button variant="primary" icon={<BookOpen className="h-4 w-4" />}>Create assignment</Button></Link>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open assignments" value={list.filter((a) => a.status === "Open").length} icon={<BookOpen className="h-5 w-5" />} tone="primary" />
        <StatCard label="Awaiting submission" value={list.reduce((a, x) => a + x.pending, 0)} icon={<ClipboardList className="h-5 w-5" />} tone="warn" hint="Across all sections" />
        <StatCard label="Grading pending" value={list.filter((a) => a.status === "Grading").length} icon={<Award className="h-5 w-5" />} tone="analytics" />
        <StatCard label="On-time rate" value={84} suffix="%" icon={<CheckCircle2 className="h-5 w-5" />} tone="success" delta={3.2} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Assignment tracker"
          subtitle="Search, filter and progress at a glance"
          action={
            <div className="flex flex-wrap items-end gap-2.5">
              <Input value={params.search} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} placeholder="Search assignments…" className="w-56" />
              <Select value={filters.type ?? "All"} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="w-36">
                {["All", "Homework", "Project", "Quiz", "Presentation"].map((t) => <option key={t}>{t}</option>)}
              </Select>
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="table-saas">
            <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  {columns.map((c) => <td key={c.key}>{c.render(a)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-white/8">
          <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">Showing {list.length} of {query.data?.total ?? 0} assignments</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={params.page <= 1} onClick={() => setParams({ ...params, page: params.page - 1 })}>Previous</Button>
            <Button variant="outline" size="sm" disabled={params.page >= (query.data?.pages ?? 1)} onClick={() => setParams({ ...params, page: params.page + 1 })}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function AssignmentCreate() {
  const [form, setForm] = useState({ title: "", subject: SUBJECTS[0], className: "Grade 9-A", type: "Homework", totalMarks: 20, deadline: "", description: "", allowLate: true, notify: true });
  const [files, setFiles] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  usePageTitle("Create Assignment");
  const shell = useShellStore();
  const setCommandOpen = shell.setCommandOpen;

  return (
    <div>
      <PageHeader
        title="Create assignment"
        subtitle="Attach documents and video links, set deadlines, enable late submission rules and notify the class instantly."
        breadcrumb={[{ label: "Academics" }, { label: "Assignments", to: "/assignments" }, { label: "Create" }]}
        actions={<Link to="/assignments"><Button variant="ghost">Cancel</Button></Link>}
      />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" required error={errors.title} className="sm:col-span-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Physics Lab Report — Optics" />
            </Field>
            <Field label="Subject">
              <Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Class">
              <Select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}>
                {CLASS_NAMES.slice(4).map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {["Homework", "Project", "Quiz", "Presentation"].map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Total marks">
              <Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} />
            </Field>
            <Field label="Deadline" required error={errors.deadline} className="sm:col-span-2">
              <Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </Field>
            <Field label="Instructions" className="sm:col-span-2">
              <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the task, marking criteria and resources…" />
            </Field>
            <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
              {[
                { key: "source", label: "Upload reference files", hint: "PDF, DOCX, PPT up to 25 MB" },
                { key: "video", label: "Attach video link", hint: "YouTube / Vimeo / Cloudinary" },
                { key: "submission", label: "Submission format", hint: "File upload + text answer" },
              ].map((u) => (
                <button
                  key={u.key}
                  type="button"
                  onClick={() => setFiles((f) => [...f, u.key === "video" ? "lecture-link.txt" : u.key === "source" ? "chapter-notes.pdf" : "answer-template.docx"])}
                  className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-left transition hover:border-primary-400 dark:border-white/12"
                >
                  <span className="flex items-center gap-2 text-[0.82rem] font-semibold text-slate-700 dark:text-slate-200">
                    <Upload className="h-3.5 w-3.5 text-primary-500" /> {u.label}
                  </span>
                  <span className="mt-1 block text-[0.72rem] text-slate-400">{u.hint}</span>
                </button>
              ))}
            </div>
            {files.length > 0 && (
              <ul className="sm:col-span-2 space-y-2">
                {files.map((f) => (
                  <li key={f} className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-[0.8rem] dark:border-white/10">
                    <span className="flex items-center gap-2"><FileBarChart2 className="h-3.5 w-3.5 text-primary-500" /> {f}</span>
                    <Badge tone="success">Ready</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={() => {
                const err: Record<string, string> = {};
                if (form.title.trim().length < 5) err.title = "Give the assignment a clear title";
                if (!form.deadline) err.deadline = "Set a deadline";
                setErrors(err);
                if (Object.keys(err).length) return;
                toast.success("Assignment published", `${form.className} notified via portal and SMS · ${form.totalMarks} marks.`);
              }}
            >
              Publish assignment
            </Button>
            <Button variant="outline" onClick={() => toast.info("Saved as draft", "Visible only to you until published.")}>Save draft</Button>
            <Button variant="ghost" onClick={() => shell.setCommandOpen(true)}>Open global search</Button>
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader title="Publishing checklist" subtitle="What happens when you publish" className="mb-5" />
          <ul className="space-y-3 text-[0.84rem] text-slate-600 dark:text-slate-300">
            {[
              "Assignment appears in the student and parent portals immediately",
              "Push notification + SMS to students of the selected section",
              "Calendar entry created with automatic reminder 24 hours before deadline",
              "Late submissions flagged and penalised per your policy",
              "Submissions stored on Cloudinary with virus scanning",
            ].map((t) => (
              <li key={t} className="flex gap-2.5 rounded-xl border border-slate-200 px-3.5 py-3 dark:border-white/10">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-500" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <label className="flex items-center justify-between gap-3 text-[0.84rem]">
              <span className="text-slate-600 dark:text-slate-300">Allow late submission (10% penalty per day)</span>
              <input type="checkbox" checked={form.allowLate} onChange={(e) => setForm({ ...form, allowLate: e.target.checked })} className="h-4 w-4 rounded accent-primary-500" />
            </label>
            <label className="mt-3 flex items-center justify-between gap-3 text-[0.84rem]">
              <span className="text-slate-600 dark:text-slate-300">Notify guardians as well as students</span>
              <input type="checkbox" checked={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.checked })} className="h-4 w-4 rounded accent-primary-500" />
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function AssignmentDetail() {
  const { assignmentId } = useParams();
  const subs = useQuery({ queryKey: qk.submissions(assignmentId ?? ""), queryFn: () => api.assignments.submissions(assignmentId ?? ""), enabled: !!assignmentId });
  const assignment = useMemo(() => seedExams && (window as unknown as { __as?: Assignment[] }).__as?.find((a) => a.id === assignmentId), [assignmentId]);
  const [tab, setTab] = useState<"submissions" | "analytics">("submissions");
  usePageTitle("Assignment Detail");
  const rows = subs.data ?? [];
  const graded = rows.filter((r) => r.marks !== null);

  return (
    <div>
      <PageHeader
        title={assignment?.title ?? `Assignment ${assignmentId}`}
        subtitle={`${assignment?.className ?? "Grade 9-A"} · ${assignment?.subject ?? "Physics"} · ${assignment?.totalMarks ?? 20} marks · deadline ${assignment?.deadline ?? "soon"}`}
        breadcrumb={[{ label: "Academics" }, { label: "Assignments", to: "/assignments" }, { label: "Submissions" }]}
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportCSV(rows as unknown as Record<string, unknown>[], [{ key: "name", label: "Student" }, { key: "status", label: "Status" }, { key: "marks", label: "Marks" }], "submissions"); toast.success("CSV exported"); }}>Export</Button>
            <Button variant="primary" icon={<Award className="h-4 w-4" />} onClick={() => toast.success("Grades released", `${graded.length} students can see their marks and feedback.`)}>Release grades</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Submissions" value={rows.filter((r) => r.status === "Submitted").length} icon={<ClipboardList className="h-5 w-5" />} tone="success" />
        <StatCard label="Pending" value={rows.filter((r) => r.status === "Pending").length} icon={<Users className="h-5 w-5" />} tone="warn" />
        <StatCard label="Graded" value={graded.length} icon={<Award className="h-5 w-5" />} tone="primary" />
        <StatCard label="Average score" value={graded.length ? Math.round(graded.reduce((a, r) => a + (r.marks ?? 0), 0) / graded.length) : 0} suffix={`/${assignment?.totalMarks ?? 20}`} icon={<FileBarChart2 className="h-5 w-5" />} tone="analytics" />
      </div>

      <Tabs tabs={[{ id: "submissions", label: "Submissions" }, { id: "analytics", label: "Analytics" }]} value={tab} onChange={setTab} className="mb-6" />

      {tab === "submissions" ? (
        <Card className="overflow-hidden">
          <CardHeader title="Submission tracking" subtitle="Status, timestamps, attachments and per-student feedback" />
          <div className="overflow-x-auto">
            <table className="table-saas">
              <thead><tr><th>Student</th><th>Roll</th><th>Status</th><th>Submitted</th><th>Attachment</th><th>Marks</th><th>Feedback</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.studentId}>
                    <td className="flex items-center gap-3">
                      <Avatar name={r.name} size={30} />
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{r.name}</span>
                    </td>
                    <td className="font-numeric">{r.rollNo}</td>
                    <td><Badge tone={statusTone(r.status)} dot>{r.status}</Badge></td>
                    <td className="text-slate-500 dark:text-slate-400">{r.submittedAt}</td>
                    <td className="text-slate-500 dark:text-slate-400">{r.status === "Submitted" ? r.attachment : "—"}</td>
                    <td>
                      {r.marks !== null ? (
                        <Badge tone={r.marks >= (assignment?.totalMarks ?? 20) * 0.8 ? "success" : r.marks >= (assignment?.totalMarks ?? 20) * 0.5 ? "primary" : "danger"}>
                          {r.marks}/{assignment?.totalMarks ?? 20}
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => toast.success("Grade saved", `Marks and feedback recorded for ${r.name}.`)}>Grade</Button>
                      )}
                    </td>
                    <td className="max-w-[16rem] text-slate-500 dark:text-slate-400">{r.feedback ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Submission timeline" subtitle="How quickly the class submitted" />
            <div className="p-4">
              <HorizontalBarChart
                data={[
                  { name: "Day 1", value: 6 },
                  { name: "Day 2", value: 9 },
                  { name: "Day 3", value: 11 },
                  { name: "On deadline", value: 8 },
                  { name: "Late", value: 4 },
                ]}
                height={260}
                tone="#8B5CF6"
              />
            </div>
          </Card>
          <Card className="p-6">
            <CardHeader title="Score distribution" subtitle="Band-wise performance on this assignment" className="mb-5" />
            <div className="space-y-4">
              {[
                { k: "Distinction (80%+)", v: 22 },
                { k: "Good (60–79%)", v: 41 },
                { k: "Average (40–59%)", v: 27 },
                { k: "Below pass", v: 10 },
              ].map((b) => (
                <div key={b.k}>
                  <div className="flex items-center justify-between text-[0.82rem]">
                    <span className="text-slate-600 dark:text-slate-300">{b.k}</span>
                    <span className="font-numeric font-bold">{b.v}%</span>
                  </div>
                  <ProgressBar value={b.v} tone={b.v > 35 ? "success" : b.v > 22 ? "primary" : "danger"} className="mt-1.5" />
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-analytics-500/25 bg-analytics-100/40 p-4 text-[0.82rem] text-slate-600 dark:bg-analytics-500/10 dark:text-slate-300">
              <Sparkles className="mb-1.5 h-4 w-4 text-analytics-500" />
              11 students scored below 50% — the ERP suggests attaching the remedial worksheet and scheduling a revision slot on Thursday.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export type { Exam };
