import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Archive,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Cloud,
  CreditCard,
  Database,
  Download,
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  Palette,
  Receipt,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { AttendanceAreaChart, Sparkline, SubjectRadarChart } from "@/components/charts";
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Field, Input, PageHeader, ProgressBar, RadialProgress, Select, StatCard, Switch, Tabs, Textarea, statusTone } from "@/components/ui";
import { api, ROLE_MATRIX, exportCSV, exportPDF } from "@/lib/api";
import { qk, toast, useAuthStore, usePageTitle, useUIStore } from "@/lib/store";
import { SYSTEM_METRICS, ROLE_MATRIX_ROWS } from "@/lib/portal";
import { SUBJECTS, timetableSlots, weekDays, students, systemStatus, payroll, teachers, type Role } from "@/lib/db";

/* -------------------------------------------------------- Parent portal */

export function ParentPortal() {
  const [tab, setTab] = useState<"overview" | "attendance" | "results" | "fees" | "messages">("overview");
  const child = students[0];
  const report = useQuery({ queryKey: ["parent-report"], queryFn: () => api.results.reportCard(child.id, "EX-02") });
  const attendance = useQuery({ queryKey: qk.attendance(30), queryFn: () => api.metrics.attendance(30) });
  usePageTitle("Parent Portal");

  return (
    <div>
      <PageHeader
        title="Parent Portal"
        subtitle={`Monitoring ${child.name} · ${child.className}-${child.section} · linked guardian account`}
        breadcrumb={[{ label: "Communication" }, { label: "Parent Portal" }]}
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => exportPDF("parent-statement")}>Fee statement</Button>
            <Link to="/messages"><Button variant="primary" icon={<Mail className="h-4 w-4" />}>Message teacher</Button></Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attendance (30d)" value={child.attendanceRate} decimals={1} suffix="%" icon={<ClipboardList className="h-5 w-5" />} tone={child.attendanceRate > 90 ? "success" : "warn"} delta={1.4} />
        <StatCard label="Latest percentage" value={report.data?.percentage ?? 0} decimals={1} suffix="%" icon={<Award className="h-5 w-5" />} tone="analytics" />
        <StatCard label="Outstanding fees" value={child.outstanding} prefix="Rs " icon={<Wallet className="h-5 w-5" />} tone={child.outstanding ? "danger" : "success"} />
        <StatCard label="Assignments pending" value={3} icon={<BookOpen className="h-5 w-5" />} tone="warn" hint="2 due this week" />
      </div>

      <Tabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "attendance", label: "Attendance" },
          { id: "results", label: "Results & report card" },
          { id: "fees", label: "Fees" },
          { id: "messages", label: "Teacher messages", badge: 2 },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-6"
      />

      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Avatar name={child.name} size={64} />
              <div>
                <p className="text-[1.05rem] font-bold">{child.name}</p>
                <p className="text-[0.8rem] text-slate-500 dark:text-slate-400">{child.className}-{child.section} · Roll {child.rollNo} · {child.house} House</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone={statusTone(child.feeStatus)}>{child.feeStatus} fees</Badge>
                  <Badge tone="primary">GPA {child.gpa}</Badge>
                  <Badge tone={child.riskScore > 60 ? "danger" : "success"}>Risk {child.riskScore}</Badge>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4 text-center dark:border-white/10">
                <RadialProgress value={Math.round(child.gpa * 25)} size={80} label="Index" />
                <p className="mt-2 text-[0.74rem] text-slate-500 dark:text-slate-400">Academic index</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">Progress trend</p>
                <div className="mt-2"><Sparkline data={[64, 68, 71, 70, 76, 79, 84]} height={50} /></div>
                <p className="mt-2 text-[0.76rem] text-success-600 dark:text-success-400">+0.4 GPA vs last term</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">Next PTM</p>
                <p className="mt-1 text-[0.92rem] font-bold">Sat · 10:30 AM</p>
                <p className="mt-1 text-[0.74rem] text-slate-500 dark:text-slate-400">Room 12 · Sir Kamran</p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader title="Recent notices" subtitle="Addressed to parents" action={<Link to="/notices"><Button variant="ghost" size="sm">All</Button></Link>} />
              <ul className="divide-y divide-slate-100 dark:divide-white/8">
                {[
                  { t: "Fee submission deadline extended", d: "12 Feb", tone: "warn" as const },
                  { t: "PTM slot confirmation", d: "09 Feb", tone: "primary" as const },
                  { t: "Winter uniform enforcement", d: "05 Feb", tone: "muted" as const },
                ].map((n) => (
                  <li key={n.t} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <span className="text-[0.85rem] font-medium text-slate-700 dark:text-slate-200">{n.t}</span>
                    <Badge tone={n.tone}>{n.d}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <CardHeader title="Quick actions" subtitle="Most used parent tasks" className="mb-4" />
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  { l: "Download report card", to: "#", onClick: () => exportPDF("report-card") },
                  { l: "Pay fees online", to: "/fees", link: true },
                  { l: "View attendance", to: "/attendance", link: true },
                  { l: "Message class teacher", to: "/messages", link: true },
                ].map((a) => (
                  <Link key={a.l} to={a.link ? a.to : "#"} onClick={(e) => { if (!a.link) { e.preventDefault(); a.onClick?.(); } }} className="rounded-xl border border-slate-200 px-3.5 py-3 text-[0.82rem] font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-600 dark:border-white/10 dark:text-slate-300">
                    {a.l}
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "attendance" && (
        <Card>
          <CardHeader title="Attendance tracking" subtitle="Daily status and campus-wide comparison" />
          <div className="p-4">{attendance.isLoading ? <div className="skeleton h-64 w-full" /> : <AttendanceAreaChart data={attendance.data ?? []} height={300} />}</div>
          <div className="grid gap-4 border-t border-slate-100 p-5 sm:grid-cols-4 dark:border-white/8">
            {[
              { k: "Present days", v: Math.round((child.attendanceRate / 100) * 30) },
              { k: "Absent days", v: 30 - Math.round((child.attendanceRate / 100) * 30) },
              { k: "Late arrivals", v: 2 },
              { k: "Approved leave", v: 1 },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">{s.k}</p>
                <p className="mt-1 font-numeric text-xl font-extrabold">{s.v}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "results" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden">
            <CardHeader title="Report card — Mid Term" subtitle="Marks, grades and teacher remarks" action={<Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => exportPDF(`report-${child.rollNo}`)}>PDF</Button>} />
            <table className="table-saas">
              <thead><tr><th>Subject</th><th>Marks</th><th>Grade</th><th>Remarks</th></tr></thead>
              <tbody>
                {(report.data?.rows ?? []).map((r) => (
                  <tr key={r.id}>
                    <td className="font-semibold">{r.subject}</td>
                    <td className="font-numeric">{r.obtained}/{r.total}</td>
                    <td><Badge tone={r.grade === "A+" ? "success" : r.grade === "F" ? "danger" : "primary"}>{r.grade}</Badge></td>
                    <td className="text-slate-500 dark:text-slate-400">{r.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-white/8">
              <p className="text-[0.84rem] text-slate-600 dark:text-slate-300">
                Total <span className="font-numeric font-bold">{report.data?.total}/{report.data?.max}</span> · Percentage{" "}
                <span className="font-numeric font-bold text-primary-600 dark:text-primary-300">{report.data?.percentage}%</span>
              </p>
              <Link to="/messages"><Button variant="primary" size="sm">Discuss with teacher</Button></Link>
            </div>
          </Card>
          <Card className="p-6">
            <CardHeader title="Subject performance" subtitle="Comparative index across terms" className="mb-4" />
            <SubjectRadarChart
              data={SUBJECTS.slice(0, 6).map((s, i) => ({ subject: s, score: Math.min(98, 62 + i * 5 + Math.round(child.gpa * 4)), lastTerm: Math.min(94, 58 + i * 5 + Math.round(child.gpa * 3)) }))}
              height={300}
              comparison
            />
          </Card>
        </div>
      )}

      {tab === "fees" && (
        <Card className="overflow-hidden">
          <CardHeader
            title="Fee history & online payment"
            subtitle="Challans with receipts, discounts and pending amounts"
            action={<Link to="/fees"><Button variant="primary" size="sm" icon={<CreditCard className="h-3.5 w-3.5" />}>Pay online</Button></Link>}
          />
          <table className="table-saas">
            <thead><tr><th>Challan</th><th>Month</th><th>Amount</th><th>Paid</th><th>Due date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {useMemoInvoices().slice(0, 8).map((i) => (
                <tr key={i.id}>
                  <td className="font-numeric">{i.challanNo}</td>
                  <td>{i.month}</td>
                  <td className="font-numeric">Rs {i.amount.toLocaleString("en-US")}</td>
                  <td className="font-numeric text-success-500">Rs {i.paid.toLocaleString("en-US")}</td>
                  <td>{i.dueDate}</td>
                  <td><Badge tone={statusTone(i.status)}>{i.status}</Badge></td>
                  <td><Button variant="ghost" size="sm" icon={<Receipt className="h-3.5 w-3.5" />} onClick={() => exportPDF(`receipt-${i.challanNo}`)}>Receipt</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "messages" && (
        <Card className="p-6">
          <CardHeader title="Teacher communication" subtitle="Direct threads with subject teachers" className="mb-5" />
          <ul className="space-y-3">
            {teachers.slice(0, 4).map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                <Avatar name={t.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9rem] font-bold">{t.name}</p>
                  <p className="text-[0.76rem] text-slate-500 dark:text-slate-400">{t.designation} · {t.subjects.join(", ")}</p>
                </div>
                <Link to="/messages"><Button variant="outline" size="sm">Open thread</Button></Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function useMemoInvoices() {
  const child = students[0];
  return require_invoice_stub(child.id);
}

function require_invoice_stub(studentId: string) {
  return invoices_for(studentId);
}

function invoices_for(studentId: string) {
  return studentsInvoices.filter((i) => i.studentId === studentId);
}

const studentsInvoices = ((): ReturnType<typeof buildInvoices> => buildInvoices())();
function buildInvoices() {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `INV-P-${i}`,
    challanNo: `CH-2026${String(i + 1).padStart(2, "0")}-0001`,
    studentId: students[0].id,
    month: new Date(2026, i, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    amount: 12600,
    paid: i > 8 ? 0 : 12600,
    dueDate: `2026-${String(i + 1).padStart(2, "0")}-12`,
    status: i > 8 ? "Overdue" : "Paid",
  }));
}

/* ------------------------------------------------------- Student portal */

export function StudentPortal() {
  const [tab, setTab] = useState<"results" | "attendance" | "assignments" | "timetable" | "library" | "fees">("results");
  const me = students[0];
  const report = useQuery({ queryKey: ["my-report"], queryFn: () => api.results.reportCard(me.id, "EX-02") });
  const attendance = useQuery({ queryKey: qk.attendance(30), queryFn: () => api.metrics.attendance(30) });
  usePageTitle("Student Portal");

  return (
    <div>
      <PageHeader
        title="My Portal"
        subtitle={`${me.name} · ${me.className}-${me.section} · Roll ${me.rollNo} · ${me.house} House`}
        breadcrumb={[{ label: "Communication" }, { label: "Student Portal" }]}
        actions={
          <>
            <Link to="/assignments"><Button variant="outline" icon={<BookOpen className="h-4 w-4" />}>Assignments</Button></Link>
            <Button variant="primary" icon={<Download className="h-4 w-4" />} onClick={() => exportPDF("my-report-card")}>Report card</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My attendance" value={me.attendanceRate} decimals={1} suffix="%" icon={<ClipboardList className="h-5 w-5" />} tone="success" />
        <StatCard label="Latest result" value={report.data?.percentage ?? 0} decimals={1} suffix="%" icon={<Award className="h-5 w-5" />} tone="analytics" />
        <StatCard label="Assignments due" value={3} icon={<BookOpen className="h-5 w-5" />} tone="warn" />
        <StatCard label="Library books" value={2} icon={<GraduationCap className="h-5 w-5" />} tone="primary" hint="1 due in 4 days" />
      </div>

      <Tabs
        tabs={[
          { id: "results", label: "Results" },
          { id: "attendance", label: "Attendance" },
          { id: "assignments", label: "Assignments" },
          { id: "timetable", label: "Timetable" },
          { id: "library", label: "Library" },
          { id: "fees", label: "Fees" },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-6"
      />

      {tab === "results" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader title="My marks" subtitle="Mid Term Examination" />
            <table className="table-saas">
              <thead><tr><th>Subject</th><th>Marks</th><th>Grade</th></tr></thead>
              <tbody>
                {(report.data?.rows ?? []).map((r) => (
                  <tr key={r.id}>
                    <td className="font-semibold">{r.subject}</td>
                    <td className="font-numeric">{r.obtained}/{r.total}</td>
                    <td><Badge tone={r.grade === "A+" ? "success" : r.grade === "F" ? "danger" : "primary"}>{r.grade}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="p-6">
            <CardHeader title="My performance radar" subtitle="This term vs last term" className="mb-4" />
            <SubjectRadarChart
              data={SUBJECTS.slice(0, 6).map((s, i) => ({ subject: s, score: Math.min(98, 60 + i * 6 + Math.round(me.gpa * 4)), lastTerm: Math.min(94, 56 + i * 6 + Math.round(me.gpa * 3)) }))}
              height={320}
              comparison
            />
          </Card>
        </div>
      )}

      {tab === "attendance" && (
        <Card>
          <CardHeader title="My attendance" subtitle="Last 30 school days" />
          <div className="p-4">{attendance.isLoading ? <div className="skeleton h-64 w-full" /> : <AttendanceAreaChart data={attendance.data ?? []} height={280} />}</div>
        </Card>
      )}

      {tab === "assignments" && (
        <Card className="overflow-hidden">
          <CardHeader title="My assignments" subtitle="Submission status and grades" action={<Link to="/assignments"><Button variant="outline" size="sm">All assignments</Button></Link>} />
          <ul className="divide-y divide-slate-100 dark:divide-white/8">
            {[
              { t: "Physics Lab Report — Optics", s: "Physics", due: "in 2 days", status: "Pending", marks: null },
              { t: "Algebra Worksheet 4", s: "Mathematics", due: "in 5 days", status: "Pending", marks: null },
              { t: "Essay: My City Karachi", s: "English", due: "submitted", status: "Submitted", marks: 18 },
              { t: "Chemistry Titration Practical", s: "Chemistry", due: "graded", status: "Graded", marks: 22 },
            ].map((a) => (
              <li key={a.t} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-[0.88rem] font-semibold text-slate-800 dark:text-slate-100">{a.t}</p>
                  <p className="text-[0.74rem] text-slate-500 dark:text-slate-400">{a.s} · {a.due}</p>
                </div>
                <div className="flex items-center gap-3">
                  {a.marks !== null && <span className="font-numeric text-[0.84rem] font-bold">{a.marks}/25</span>}
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  {a.status === "Pending" && <Button variant="primary" size="sm">Submit</Button>}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "timetable" && (
        <Card className="overflow-hidden">
          <CardHeader title="My timetable" subtitle="Grade section schedule with teacher allocation" action={<Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => exportPDF("my-timetable")}>Download</Button>} />
          <div className="overflow-x-auto">
            <table className="table-saas">
              <thead><tr><th>Period</th>{weekDays.map((d) => <th key={d}>{d}</th>)}</tr></thead>
              <tbody>
                {timetableSlots.map((slot, si) => (
                  <tr key={slot}>
                    <td className="font-numeric font-semibold">{slot}</td>
                    {weekDays.map((_, di) => (
                      <td key={di} className="text-[0.78rem]">{si === 4 ? "Break" : SUBJECTS[(si * 3 + di) % SUBJECTS.length]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "library" && (
        <Card className="p-6">
          <CardHeader title="My library books" subtitle="Issued titles, due dates and fines" className="mb-4" />
          <ul className="space-y-3">
            {[
              { t: "Physics for Scientists", due: "in 4 days", fine: 0 },
              { t: "Advanced Mathematics Vol. 2", due: "overdue by 3 days", fine: 60 },
            ].map((b) => (
              <li key={b.t} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                <span className="text-[0.86rem] font-semibold text-slate-800 dark:text-slate-100">{b.t}</span>
                <span className="flex items-center gap-3">
                  <Badge tone={b.fine ? "danger" : "primary"}>{b.due}</Badge>
                  <span className="font-numeric text-[0.82rem]">{b.fine ? `Fine Rs ${b.fine}` : "No fine"}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "fees" && (
        <Card className="overflow-hidden">
          <CardHeader title="My fee record" subtitle="Challans and payment status" />
          <table className="table-saas">
            <thead><tr><th>Month</th><th>Amount</th><th>Paid</th><th>Status</th></tr></thead>
            <tbody>
              {studentsInvoices.slice(0, 8).map((i) => (
                <tr key={i.id}>
                  <td>{i.month}</td>
                  <td className="font-numeric">Rs {i.amount.toLocaleString("en-US")}</td>
                  <td className="font-numeric text-success-500">Rs {i.paid.toLocaleString("en-US")}</td>
                  <td><Badge tone={statusTone(i.status)}>{i.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Settings */

export function SettingsPage() {
  const [tab, setTab] = useState<"school" | "academic" | "security" | "notifications" | "email" | "backup" | "theme">("school");
  const settings = useQuery({ queryKey: qk.settings, queryFn: () => api.settings.get() });
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const [notif, setNotif] = useState({ email: true, sms: true, push: true, fee: true, exam: true });
  const [security, setSecurity] = useState({ twoFactor: true, ipAllow: false, audit: true });
  usePageTitle("Settings");

  return (
    <div>
      <PageHeader
        title="System Settings"
        subtitle="School profile, academic rules, roles, security, notifications, email relay, backups and appearance — all tenant-scoped."
        breadcrumb={[{ label: "System" }, { label: "Settings" }]}
        actions={<Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={() => toast.success("Settings saved", "Configuration applied to the tenant instantly with an audit entry.")}>Save changes</Button>}
      />

      <Tabs
        tabs={[
          { id: "school", label: "School" },
          { id: "academic", label: "Academic" },
          { id: "security", label: "Security" },
          { id: "notifications", label: "Notifications" },
          { id: "email", label: "Email" },
          { id: "backup", label: "Backup" },
          { id: "theme", label: "Appearance" },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-6"
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {tab === "school" && settings.data && (
            <Card className="p-6">
              <CardHeader title="School profile" subtitle="Legal identity used on challans, report cards and notifications" className="mb-5" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="School name"><Input defaultValue={settings.data.school.name} /></Field>
                <Field label="Campus code"><Input defaultValue={settings.data.school.code} /></Field>
                <Field label="Contact email"><Input defaultValue={settings.data.school.email} /></Field>
                <Field label="Phone"><Input defaultValue={settings.data.school.phone} /></Field>
                <Field label="Principal"><Input defaultValue={settings.data.school.principal} /></Field>
                <Field label="Academic session"><Input defaultValue={settings.data.school.session} /></Field>
                <Field label="Address" className="sm:col-span-2"><Textarea defaultValue={settings.data.school.address} /></Field>
                <Field label="Board affiliation" className="sm:col-span-2"><Input defaultValue={settings.data.school.affiliation} /></Field>
              </div>
            </Card>
          )}

          {tab === "academic" && settings.data && (
            <Card className="p-6">
              <CardHeader title="Academic configuration" subtitle="Term system, grading weights and working days" className="mb-5" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Term system"><Select defaultValue={settings.data.academic.termSystem}>{["Trimester", "Semester", "Annual"].map((t) => <option key={t}>{t}</option>)}</Select></Field>
                <Field label="Passing marks"><Input type="number" defaultValue={settings.data.academic.passingMarks} /></Field>
                <Field label="Grade scale"><Select defaultValue={settings.data.academic.gradeScale}>{["A+ to F (10 point)", "A to F (letter)", "Percentage only"].map((t) => <option key={t}>{t}</option>)}</Select></Field>
                <Field label="Max marks per subject"><Input type="number" defaultValue={settings.data.academic.maxMarksPerSubject} /></Field>
                <Field label="Exam weight"><Input type="number" defaultValue={settings.data.academic.weightExam} /></Field>
                <Field label="Assignment weight"><Input type="number" defaultValue={settings.data.academic.weightAssignment} /></Field>
                <Field label="Attendance weight"><Input type="number" defaultValue={settings.data.academic.weightAttendance} /></Field>
                <Field label="Working days"><Input defaultValue={settings.data.academic.workingDays} /></Field>
                <Field label="Periods per day"><Input type="number" defaultValue={settings.data.academic.periodsPerDay} /></Field>
              </div>
            </Card>
          )}

          {tab === "security" && settings.data && (
            <Card className="p-6">
              <CardHeader title="Security & compliance" subtitle="Authentication, session and audit policy" className="mb-5" />
              <div className="space-y-4">
                <Switch checked={security.twoFactor} onChange={(v) => setSecurity({ ...security, twoFactor: v })} label="Enforce two-factor authentication" description="Required for admin, accountant and super admin roles." />
                <Switch checked={security.ipAllow} onChange={(v) => setSecurity({ ...security, ipAllow: v })} label="IP allowlist for finance module" description="Restrict fee and payroll access to campus network ranges." />
                <Switch checked={security.audit} onChange={(v) => setSecurity({ ...security, audit: v })} label="Immutable audit logging" description="Append-only log retained for 24 months." />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Session timeout (minutes)"><Input type="number" defaultValue={settings.data.security.sessionTimeout} /></Field>
                  <Field label="Failed login lockout attempts"><Input type="number" defaultValue={settings.data.security.loginAttempts} /></Field>
                  <Field label="Password policy"><Input defaultValue={settings.data.security.passwordPolicy} /></Field>
                  <Field label="Audit retention (months)"><Input type="number" defaultValue={settings.data.security.auditRetention} /></Field>
                </div>
              </div>
            </Card>
          )}

          {tab === "notifications" && (
            <Card className="p-6">
              <CardHeader title="Notification preferences" subtitle="Channels and escalation rules" className="mb-5" />
              <div className="space-y-4">
                <Switch checked={notif.email} onChange={(v) => setNotif({ ...notif, email: v })} label="Email alerts" description="Transactional email via the configured SMTP relay." />
                <Switch checked={notif.sms} onChange={(v) => setNotif({ ...notif, sms: v })} label="SMS alerts" description="Guardian phone numbers from the student profile." />
                <Switch checked={notif.push} onChange={(v) => setNotif({ ...notif, push: v })} label="Push notifications" description="Web push + mobile app via Firebase." />
                <Switch checked={notif.fee} onChange={(v) => setNotif({ ...notif, fee: v })} label="Fee reminders ladder" description="Day 1, 7, 15 and 30 automated reminders." />
                <Switch checked={notif.exam} onChange={(v) => setNotif({ ...notif, exam: v })} label="Exam & result alerts" description="Date sheet and result publication notifications." />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Daily digest time"><Input type="time" defaultValue="07:30" /></Field>
                  <Field label="Escalation"><Input defaultValue="Principal after 3 missed fee cycles" /></Field>
                </div>
              </div>
            </Card>
          )}

          {tab === "email" && settings.data && (
            <Card className="p-6">
              <CardHeader title="Email relay" subtitle="Outbound transactional configuration" className="mb-5" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Provider"><Input defaultValue={settings.data.email.provider} /></Field>
                <Field label="From name"><Input defaultValue={settings.data.email.fromName} /></Field>
                <Field label="From address"><Input defaultValue={settings.data.email.fromEmail} /></Field>
                <Field label="Reply-to"><Input defaultValue={settings.data.email.replyTo} /></Field>
                <Field label="Daily send limit"><Input type="number" defaultValue={settings.data.email.dailyLimit} /></Field>
                <Field label="Bounce rate"><Input defaultValue={`${settings.data.email.bounceRate}%`} disabled /></Field>
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button variant="outline" onClick={() => toast.success("Test email sent", "Delivery confirmed to the admin inbox in 1.2s.")} icon={<Mail className="h-4 w-4" />}>Send test email</Button>
                <Button variant="ghost" onClick={() => toast.info("DNS check", "SPF, DKIM and DMARC records verified for smartschool.pk.")} icon={<ShieldCheck className="h-4 w-4" />}>Verify DNS</Button>
              </div>
            </Card>
          )}

          {tab === "backup" && settings.data && (
            <Card className="p-6">
              <CardHeader title="Backup & retention" subtitle="Automated snapshots with point-in-time recovery" className="mb-5" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Frequency"><Input defaultValue={settings.data.backup.frequency} /></Field>
                <Field label="Retention"><Input defaultValue={settings.data.backup.retention} /></Field>
                <Field label="Destination" className="sm:col-span-2"><Input defaultValue={settings.data.backup.destination} /></Field>
                <Field label="Last successful backup"><Input defaultValue={`${settings.data.backup.lastBackup} · ${settings.data.backup.size}`} disabled /></Field>
                <Field label="Encryption"><Input defaultValue={settings.data.backup.encryption} disabled /></Field>
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button variant="primary" onClick={() => toast.success("Backup started", "Snapshot in progress — estimated completion 3 minutes.")} icon={<Database className="h-4 w-4" />}>Run backup now</Button>
                <Button variant="outline" onClick={() => toast.info("Restore point", "Available restore points listed for the last 90 days.")} icon={<Archive className="h-4 w-4" />}>Restore points</Button>
              </div>
              <div className="mt-5 rounded-2xl border border-secondary-400/40 bg-secondary-200/40 p-4 text-[0.82rem] dark:bg-secondary-400/10">
                Backup service is currently degraded (latency 640 ms). Worker retried 3 times automatically; next attempt in 6 hours.
              </div>
            </Card>
          )}

          {tab === "theme" && (
            <Card className="p-6">
              <CardHeader title="Appearance" subtitle="Theme, density and brand accent" className="mb-5" />
              <div className="space-y-4">
                <Switch checked={theme === "dark"} onChange={() => toggleTheme()} label="Dark mode" description="Reduces eye strain in low-light environments." />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Interface density">
                    <Select defaultValue="Comfortable">{["Comfortable", "Compact", "Spacious"].map((d) => <option key={d}>{d}</option>)}</Select>
                  </Field>
                  <Field label="Primary accent">
                    <Select defaultValue="SmartSchool Blue (#0F5FFF)">{["SmartSchool Blue (#0F5FFF)", "Royal (#2563EB)", "Violet (#8B5CF6)", "Emerald (#10B981)"].map((d) => <option key={d}>{d}</option>)}</Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {["#0F5FFF", "#2563EB", "#FACC15", "#FDBA74", "#10B981", "#EF4444", "#8B5CF6", "#0F172A"].map((c) => (
                    <button key={c} onClick={() => toast.success("Accent selected", `${c} applied to the tenant theme.`)} className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 dark:border-white/10">
                      <span className="h-5 w-5 rounded-full" style={{ background: c }} />
                      <span className="font-numeric text-[0.72rem] text-slate-500 dark:text-slate-400">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader title="Tenant health" subtitle="Configuration completeness" className="mb-5" />
            <div className="space-y-4">
              {[
                { k: "School profile", v: 100 },
                { k: "Academic rules", v: 92 },
                { k: "Roles & permissions", v: 100 },
                { k: "Notification channels", v: 86 },
                { k: "Backups verified", v: 74 },
              ].map((s) => (
                <div key={s.k}>
                  <div className="flex items-center justify-between text-[0.82rem]">
                    <span className="text-slate-600 dark:text-slate-300">{s.k}</span>
                    <span className="font-numeric font-bold">{s.v}%</span>
                  </div>
                  <ProgressBar value={s.v} tone={s.v > 90 ? "success" : "warn"} className="mt-1.5" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <CardHeader title="Danger zone" subtitle="Irreversible operations" className="mb-4" />
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={() => toast.info("Export requested", "Full tenant data export will be emailed as an encrypted archive.")} icon={<Download className="h-4 w-4" />}>Export all tenant data</Button>
              <Button variant="danger" className="w-full" onClick={() => toast.warning("Confirmation required", "Type the school code to confirm session rollover.")} icon={<Archive className="h-4 w-4" />}>Archive academic session</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- Roles & permissions */

export function RolesPage() {
  const [role, setRole] = useState<Role>("admin");
  usePageTitle("Roles & Permissions");
  const matrix = ROLE_MATRIX_ROWS;

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Seven role types with granular permission scopes. Changes apply immediately and are written to the audit log."
        breadcrumb={[{ label: "System" }, { label: "Roles & Permissions" }]}
        actions={<Button variant="primary" icon={<Save className="h-4 w-4" />} onClick={() => toast.success("Permissions saved", `${ROLE_MATRIX[role].label} scope updated across 148 permission checks.`)}>Save role matrix</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Roles defined" value={7} icon={<ShieldCheck className="h-5 w-5" />} tone="primary" />
        <StatCard label="Permission checks" value={148} icon={<KeyRound className="h-5 w-5" />} tone="analytics" />
        <StatCard label="Users provisioned" value={5218} icon={<Users className="h-5 w-5" />} tone="success" />
        <StatCard label="Pending access requests" value={3} icon={<Lock className="h-5 w-5" />} tone="warn" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
        <Card className="p-5">
          <CardHeader title="Roles" subtitle="Select a role to edit scope" className="mb-4" />
          <ul className="space-y-2">
            {(Object.keys(ROLE_MATRIX) as Role[]).map((r) => (
              <li key={r}>
                <button onClick={() => setRole(r)} className={`w-full rounded-xl border px-4 py-3 text-left transition ${role === r ? "border-primary-400 bg-primary-50 dark:bg-primary-500/12" : "border-slate-200 hover:border-primary-300 dark:border-white/10"}`}>
                  <span className="flex items-center justify-between">
                    <span className="text-[0.86rem] font-bold text-slate-800 dark:text-slate-100">{ROLE_MATRIX[r].label}</span>
                    <span className="font-numeric text-[0.72rem] text-slate-400">
                      {ROLE_MATRIX[r].permissions === "*" ? "all" : ROLE_MATRIX[r].permissions.length}
                    </span>
                  </span>
                  <span className="mt-1 block text-[0.72rem] leading-snug text-slate-500 dark:text-slate-400">{ROLE_MATRIX[r].description}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader
            title={`${ROLE_MATRIX[role].label} — permission matrix`}
            subtitle={ROLE_MATRIX[role].permissions === "*" ? "Full platform access including tenancy and audit." : `${ROLE_MATRIX[role].permissions.length} scopes granted`}
            action={<Badge tone={role === "super_admin" ? "danger" : "primary"}>{role === "super_admin" ? "Unrestricted" : "Scoped"}</Badge>}
          />
          <div className="overflow-x-auto">
            <table className="table-saas">
              <thead><tr><th>Module</th><th>Read</th><th>Write</th><th>Delete</th><th>Publish / Approve</th></tr></thead>
              <tbody>
                {matrix.map((m) => (
                  <tr key={m.module}>
                    <td className="font-semibold">{m.module}</td>
                    {(["read", "write", "delete", "publish"] as const).map((scope) => {
                      const granted = ROLE_MATRIX[role].permissions === "*" || (ROLE_MATRIX[role].permissions as string[]).includes(`${m.module.toLowerCase()}:${scope}`);
                      return (
                        <td key={scope}>
                          <input
                            type="checkbox"
                            defaultChecked={granted}
                            onChange={() => toast.info("Permission toggled", `${m.module} ${scope} updated — save to apply.`)}
                            className="h-4 w-4 rounded accent-primary-500"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- System health */

export function SystemHealthPage() {
  usePageTitle("System Health");
  return (
    <div>
      <PageHeader
        title="System Health & Observability"
        subtitle="API, database, realtime, media, backup and notification worker status with latency, uptime and traffic analytics."
        breadcrumb={[{ label: "System" }, { label: "System Health" }]}
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportCSV(systemStatus as unknown as Record<string, unknown>[], [{ key: "name", label: "Service" }, { key: "status", label: "Status" }, { key: "latency", label: "Latency" }], "system-health"); toast.success("Health report exported"); }}>Export report</Button>
            <Button variant="primary" icon={<Activity className="h-4 w-4" />} onClick={() => toast.success("Health check complete", "All probes re-executed — 5 healthy, 1 degraded.")}>Run health check</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SYSTEM_METRICS.map((m) => (
          <StatCard key={m.label} label={m.label} value={m.value} decimals={m.decimals} suffix={m.suffix} icon={m.icon === "activity" ? <Activity className="h-5 w-5" /> : m.icon === "users" ? <Users className="h-5 w-5" /> : m.icon === "database" ? <Database className="h-5 w-5" /> : <Server className="h-5 w-5" />} tone={m.tone} delta={m.delta} hint={m.hint} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Service status" subtitle="Live probes across the platform" />
          <table className="table-saas">
            <thead><tr><th>Service</th><th>Status</th><th>Latency</th><th>Uptime</th><th>Budget</th></tr></thead>
            <tbody>
              {systemStatus.map((s) => (
                <tr key={s.name}>
                  <td className="flex items-center gap-2.5 font-semibold">
                    <Cloud className="h-4 w-4 text-slate-400" /> {s.name}
                  </td>
                  <td><Badge tone={s.status === "Operational" ? "success" : "warn"} dot>{s.status}</Badge></td>
                  <td className="font-numeric">{s.latency} ms</td>
                  <td className="font-numeric">{s.uptime}%</td>
                  <td className="w-32"><ProgressBar value={s.uptime} tone={s.status === "Operational" ? "success" : "warn"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader title="Traffic & errors" subtitle="Last 24 hours" className="mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: "Requests", v: "184,320" },
                { k: "Error rate", v: "0.08%" },
                { k: "P95 latency", v: "142 ms" },
                { k: "Active sockets", v: "412" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-[0.68rem] uppercase tracking-wide text-slate-400">{s.k}</p>
                  <p className="mt-1 font-numeric text-lg font-extrabold">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4"><Sparkline data={[42, 55, 48, 68, 62, 81, 74, 88, 92, 86, 95, 90]} height={64} color="#8B5CF6" /></div>
          </Card>
          <Card className="p-6">
            <CardHeader title="Infrastructure" subtitle="Runtime configuration" className="mb-4" />
            <ul className="space-y-3 text-[0.84rem] text-slate-600 dark:text-slate-300">
              {[
                "Next.js 15 app router · React 19 · TypeScript strict mode",
                "Node.js 22 + Express API with rate limiting and Zod validation",
                "MongoDB Atlas M30 replica set · 12.6 GB data · daily snapshots",
                "Socket.io cluster with Redis adapter for horizontal scale",
                "Cloudinary signed uploads with virus scanning pipeline",
                "Vercel edge + Cloudflare CDN · ap-south-1 primary region",
              ].map((t) => (
                <li key={t} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-500" /> {t}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Misc */

export function NotFoundPage() {
  usePageTitle("Page not found");
  return (
    <Card className="mx-auto max-w-xl p-10 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-100 text-danger-500 dark:bg-danger-500/12">
        <Sparkles className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold">404 — screen not found</h1>
      <p className="mt-3 text-[0.88rem] text-slate-500 dark:text-slate-400">
        The route you requested does not exist in this build. Use the sidebar or global search to navigate to a valid module.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/dashboard"><Button variant="primary">Back to dashboard</Button></Link>
        <Link to="/students"><Button variant="outline">Student records</Button></Link>
      </div>
    </Card>
  );
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)!;
  usePageTitle("My Profile");
  return (
    <div>
      <PageHeader title="My Profile" subtitle="Account details, role scope, security and session activity." breadcrumb={[{ label: "Account" }, { label: "Profile" }]} />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size={72} />
            <div>
              <p className="text-[1.05rem] font-bold">{user.name}</p>
              <p className="text-[0.8rem] text-slate-500 dark:text-slate-400">{user.email}</p>
              <div className="mt-2 flex gap-1.5">
                <Badge tone="primary">{ROLE_MATRIX[user.role].label}</Badge>
                <Badge tone={user.emailVerified ? "success" : "warn"}>{user.emailVerified ? "Verified" : "Unverified"}</Badge>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-[0.84rem]">
            <p className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 dark:border-white/8"><span className="text-slate-500 dark:text-slate-400">Phone</span><span className="font-semibold">{user.phone}</span></p>
            <p className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 dark:border-white/8"><span className="text-slate-500 dark:text-slate-400">Last login</span><span className="font-semibold">{user.lastLogin}</span></p>
            <p className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 dark:border-white/8"><span className="text-slate-500 dark:text-slate-400">Language</span><span className="font-semibold uppercase">{user.language}</span></p>
            <p className="flex items-center justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Permissions</span><span className="font-semibold">{ROLE_MATRIX[user.role].permissions === "*" ? "All" : `${ROLE_MATRIX[user.role].permissions.length} scopes`}</span></p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader title="Role scope" subtitle="What this account can access" className="mb-4" />
            <p className="text-[0.86rem] text-slate-600 dark:text-slate-300">{ROLE_MATRIX[user.role].description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Dashboard", "Analytics studio", "Messages", "Notice board", "Reports"].map((m) => (
                <span key={m} className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-[0.8rem] dark:border-white/10">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success-500" /> {m}
                </span>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <CardHeader title="Recent sessions" subtitle="Device and location history" className="mb-4" />
            <ul className="space-y-3">
              {[
                { d: "Chrome · macOS · Karachi, PK", t: "Active now", tone: "success" as const },
                { d: "Safari · iPhone 15 · Karachi, PK", t: "3 hours ago", tone: "muted" as const },
                { d: "Edge · Windows 11 · Lahore, PK", t: "2 days ago", tone: "muted" as const },
              ].map((s) => (
                <li key={s.d} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10">
                  <span className="flex items-center gap-2.5 text-[0.82rem] text-slate-600 dark:text-slate-300"><Server className="h-3.5 w-3.5 text-slate-400" /> {s.d}</span>
                  <Badge tone={s.tone}>{s.t}</Badge>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button variant="outline" icon={<Lock className="h-4 w-4" />} onClick={() => toast.success("Sessions revoked", "All other devices have been signed out.")}>Sign out other devices</Button>
              <Button variant="ghost" icon={<KeyRound className="h-4 w-4" />} onClick={() => toast.info("Password reset", "A reset link has been emailed to your address.")}>Change password</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { UserCog, Palette, Bell, CreditCard, TrendingUp, Wallet, GraduationCap };
