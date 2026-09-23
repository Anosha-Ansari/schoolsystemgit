import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  BedDouble,
  Bus,
  CalendarDays,
  CheckCircle2,
  Library,
  Mail,
  MapPin,
  Phone,
  Printer,
  Route as RouteIcon,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { Avatar, Badge, Button, Card, CardHeader, DataTable, EmptyState, InfoRow, PageHeader, ProgressBar, RadialProgress, Select, StatCard, Tabs, Timeline, statusTone, type Column } from "@/components/ui";
import { api, exportExcel, exportPDF } from "@/lib/api";
import { qk, toast, useDebounced, usePageTitle } from "@/lib/store";
import { daysAgoLabel, type Book, type BookIssue, type HostelRoom, type PayRoll, type Route, type Teacher } from "@/lib/support";
import { HorizontalBarChart, Sparkline } from "@/components/charts";

/* --------------------------------------------------------- Directory */

export function TeachersList() {
  usePageTitle("Teachers & Staff");
  const [params, setParams] = useState({ search: "", page: 1, pageSize: 10, sortBy: "name", sortDir: "asc" as "asc" | "desc" });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const search = useDebounced(params.search);
  const query = useQuery({ queryKey: qk.teachers({ ...params, search, filters }), queryFn: () => api.teachers.list({ ...params, search, filters }) });
  const data = query.data;

  const columns: Column<Teacher>[] = [
    {
      key: "name",
      label: "Staff member",
      sortable: true,
      render: (t) => (
        <span className="flex items-center gap-3">
          <Avatar name={t.name} size={34} />
          <span>
            <span className="block font-semibold text-slate-800 dark:text-slate-100">{t.name}</span>
            <span className="block text-[0.72rem] text-slate-400">{t.employeeId} · {t.email}</span>
          </span>
        </span>
      ),
    },
    { key: "designation", label: "Designation", sortable: true },
    { key: "department", label: "Department", sortable: true, render: (t) => <Badge tone="analytics">{t.department}</Badge> },
    { key: "subjects", label: "Subjects", hideOnMobile: true, render: (t) => <span className="flex flex-wrap gap-1">{t.subjects.map((s) => <Badge key={s} tone="muted">{s}</Badge>)}</span> },
    { key: "experience", label: "Experience", sortable: true, render: (t) => `${t.experience} yrs` },
    { key: "attendanceRate", label: "Attendance", sortable: true, render: (t) => <span className="flex w-28 flex-col gap-1.5"><span className="font-numeric text-[0.78rem] font-bold">{t.attendanceRate}%</span><ProgressBar value={t.attendanceRate} tone={t.attendanceRate > 94 ? "success" : "warn"} /></span> },
    { key: "rating", label: "Rating", sortable: true, render: (t) => <span className="flex items-center gap-1.5 font-numeric font-bold text-secondary-600 dark:text-secondary-300"><Star className="h-3.5 w-3.5 fill-current" /> {t.rating}</span> },
    { key: "salary", label: "Gross salary", hideOnMobile: true, render: (t) => <span className="font-numeric">Rs {t.salary.toLocaleString("en-US")}</span> },
    { key: "status", label: "Status", render: (t) => <Badge tone={statusTone(t.status)} dot>{t.status.replace("_", " ")}</Badge> },
    { key: "actions", label: "", render: (t) => <Link to={`/teachers/${t.id}`} className="text-[0.76rem] font-bold text-primary-600 dark:text-primary-300">Profile →</Link> },
  ];

  return (
    <div>
      <PageHeader
        title="Teachers & Staff Directory"
        subtitle="300+ faculty and support staff with payroll, attendance, leave, appraisal and timetable data in one profile."
        breadcrumb={[{ label: "Academics" }, { label: "Teachers" }]}
        actions={
          <>
            <Link to="/payroll"><Button variant="outline" icon={<Wallet className="h-4 w-4" />}>Payroll</Button></Link>
            <Link to="/leaves"><Button variant="outline" icon={<CalendarDays className="h-4 w-4" />}>Leave requests</Button></Link>
            <Button variant="primary" icon={<Users className="h-4 w-4" />} onClick={() => toast.info("Add staff", "The staff onboarding wizard opens with the same 4-step flow as students.")}>Add staff</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total staff" value={300} icon={<Users className="h-5 w-5" />} tone="primary" delta={2.1} />
        <StatCard label="Avg. rating" value={4.3} decimals={1} icon={<Star className="h-5 w-5" />} tone="warn" delta={1.4} />
        <StatCard label="Payroll this month" value={38.4} decimals={1} prefix="Rs " suffix="M" icon={<Wallet className="h-5 w-5" />} tone="analytics" />
        <StatCard label="On leave today" value={4} icon={<CalendarDays className="h-5 w-5" />} tone="muted" hint="3 pending approvals" />
      </div>

      <DataTable
        columns={columns}
        rows={(data?.rows ?? []) as unknown as Record<string, unknown>[]}
        total={data?.total ?? 0}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 10}
        pages={data?.pages ?? 1}
        onPage={(page) => setParams({ ...params, page })}
        onPageSize={(pageSize) => setParams({ ...params, pageSize, page: 1 })}
        search={params.search}
        onSearch={(v) => setParams({ ...params, search: v, page: 1 })}
        searchPlaceholder="Search staff by name, employee ID, department…"
        sortBy={params.sortBy}
        sortDir={params.sortDir}
        onSort={(sortBy) => setParams({ ...params, sortBy, sortDir: params.sortBy === sortBy && params.sortDir === "asc" ? "desc" : "asc" })}
        filters={filters}
        onFiltersChange={(f) => setFilters(f)}
        filterOptions={[
          { key: "department", label: "Department", options: ["Science", "Mathematics", "Languages", "Computer Science", "Humanities", "Commerce"] },
          { key: "designation", label: "Designation", options: ["Senior Teacher", "Subject Teacher", "Lecturer", "Head of Department"] },
          { key: "status", label: "Status", options: ["active", "on_leave", "resigned"] },
        ]}
        selected={selected}
        onSelect={setSelected}
        loading={query.isLoading}
        exportName="staff-directory"
        bulkActions={<Button variant="outline" size="sm" onClick={() => toast.info("Payroll queued", `${selected.length} staff added to the payroll run.`)}>Add to payroll</Button>}
      />
    </div>
  );
}

export function TeacherDetail() {
  const { teacherId } = useParams();
  const [tab, setTab] = useState<"overview" | "payroll" | "attendance" | "timetable" | "leave" | "performance">("overview");
  const record = useQuery({ queryKey: qk.teacher(teacherId ?? ""), queryFn: () => api.teachers.get(teacherId!), enabled: !!teacherId });
  const t = record.data?.teacher;
  usePageTitle(t ? t.name : "Staff profile");

  if (!t) return <EmptyState title="Staff record unavailable" message="Loading profile or the record has been archived." />;

  return (
    <div>
      <PageHeader
        title={t.name}
        subtitle={`${t.designation} · ${t.department} · ${t.experience} years of service`}
        breadcrumb={[{ label: "Academics" }, { label: "Teachers", to: "/teachers" }, { label: "Profile" }]}
        badge={<Badge tone={statusTone(t.status)} dot>{t.status.replace("_", " ")}</Badge>}
        actions={
          <>
            <Button variant="outline" icon={<Printer className="h-4 w-4" />} onClick={() => exportPDF(`staff-${t.employeeId}`)}>Print profile</Button>
            <Button variant="outline" icon={<Mail className="h-4 w-4" />} onClick={() => toast.info("Message drafted", `A message thread with ${t.name} was created.`)}>Message</Button>
            <Link to="/payroll"><Button variant="primary" icon={<Wallet className="h-4 w-4" />}>Payroll</Button></Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar name={t.name} size={72} />
            <div>
              <p className="text-[1.05rem] font-bold">{t.name}</p>
              <p className="text-[0.8rem] text-slate-500 dark:text-slate-400">{t.qualification}</p>
              <div className="mt-2 flex gap-1.5">
                <Badge tone="primary">{t.designation}</Badge>
                <Badge tone="success">{t.rating} ★ appraisal</Badge>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <InfoRow label="Employee ID" value={t.employeeId} icon={<BadgeCheck className="h-3.5 w-3.5" />} />
            <InfoRow label="Email" value={<a href={`mailto:${t.email}`} className="text-primary-600 dark:text-primary-300">{t.email}</a>} icon={<Mail className="h-3.5 w-3.5" />} />
            <InfoRow label="Phone" value={<a href={`tel:${t.phone}`} className="text-primary-600 dark:text-primary-300">{t.phone}</a>} icon={<Phone className="h-3.5 w-3.5" />} />
            <InfoRow label="CNIC" value={t.cnic} />
            <InfoRow label="Joined" value={t.joiningDate} icon={<CalendarDays className="h-3.5 w-3.5" />} />
            <InfoRow label="Gross salary" value={`Rs ${t.salary.toLocaleString("en-US")}`} icon={<Wallet className="h-3.5 w-3.5" />} />
            <InfoRow label="Students taught" value={<span className="font-numeric">{t.students}</span>} icon={<Users className="h-3.5 w-3.5" />} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 p-4 text-center dark:border-white/10">
              <RadialProgress value={t.attendanceRate} size={78} label="Attendance" tone="#10B981" />
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
              <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">Teaching load</p>
              <p className="mt-1 font-numeric text-xl font-extrabold">{Math.round(t.students / 32)} classes</p>
              <div className="mt-2"><Sparkline data={[62, 70, 68, 76, 74, 82, 88]} height={34} /></div>
            </div>
          </div>
        </Card>

        <div>
          <Tabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "payroll", label: "Salary", badge: record.data?.payroll.length },
              { id: "attendance", label: "Attendance" },
              { id: "timetable", label: "Timetable" },
              { id: "leave", label: "Leave", badge: record.data?.leaves.length },
              { id: "performance", label: "Performance" },
            ]}
            value={tab}
            onChange={setTab}
            className="mb-5"
          />

          {tab === "overview" && (
            <div className="grid gap-4">
              <Card className="p-5">
                <CardHeader title="Classes assigned" subtitle="Sections currently taught" className="mb-4" />
                <div className="flex flex-wrap gap-2">
                  {(record.data?.classes ?? []).map((c) => (
                    <Badge key={c.id} tone="primary">{c.name} · {c.students} students</Badge>
                  ))}
                  {(record.data?.classes ?? []).length === 0 && <p className="text-[0.82rem] text-slate-400">No class-teacher assignment; subject-only allocation.</p>}
                </div>
              </Card>
              <Card className="p-5">
                <CardHeader title="Activity timeline" subtitle="From the staff audit trail" className="mb-4" />
                <Timeline
                  items={[
                    { title: "Mid-term marks submitted", meta: "3 days ago", body: `${Math.round(t.students / 4)} papers entered with auto-grade validation.` },
                    { title: "Class observation completed", meta: "2 weeks ago", body: "Rated 4.6/5 by the academic coordinator on lesson structure." },
                    { title: "Professional development", meta: "1 month ago", body: "Completed 'Assessment design for concept mastery' workshop." },
                    { title: "Performance bonus credited", meta: last(2), body: "Merit increment of 7% applied to payroll cycle.", tone: "success" as const },
                  ]}
                />
              </Card>
            </div>
          )}

          {tab === "payroll" && (
            <Card className="overflow-hidden">
              <CardHeader title="Salary history" subtitle="Basic, allowances, deductions and net pay" action={<Button variant="outline" size="sm" onClick={() => toast.success("Payslip generated", "PDF payslip emailed to the staff member.")}>Generate payslip</Button>} />
              <table className="table-saas">
                <thead><tr><th>Month</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net pay</th><th>Status</th></tr></thead>
                <tbody>
                  {(record.data?.payroll ?? []).map((p) => (
                    <tr key={p.id}>
                      <td>{p.month}</td>
                      <td className="font-numeric">{p.basic.toLocaleString("en-US")}</td>
                      <td className="font-numeric text-success-500">+{p.allowances.toLocaleString("en-US")}</td>
                      <td className="font-numeric text-danger-500">-{p.deductions.toLocaleString("en-US")}</td>
                      <td className="font-numeric font-bold">{p.net.toLocaleString("en-US")}</td>
                      <td><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {tab === "attendance" && (
            <Card className="p-5">
              <CardHeader title="Attendance register" subtitle="Biometric + QR gate + manual reconciliation" className="mb-4" />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">Punctuality</p>
                  <p className="font-numeric text-xl font-extrabold">{t.attendanceRate}%</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">Late arrivals (30d)</p>
                  <p className="font-numeric text-xl font-extrabold">3</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                  <p className="text-[0.7rem] uppercase tracking-wide text-slate-400">Leaves availed</p>
                  <p className="font-numeric text-xl font-extrabold">{record.data?.leaves.length ?? 0}</p>
                </div>
              </div>
              <div className="mt-5">
                <Sparkline data={[92, 96, 94, 98, 95, 97, 96, 99]} height={60} color="#8B5CF6" />
              </div>
            </Card>
          )}

          {tab === "timetable" && (
            <Card className="p-5">
              <CardHeader title="Teaching timetable" subtitle="Period allocation across the week" className="mb-4" />
              <div className="grid gap-3 sm:grid-cols-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d, i) => (
                  <div key={d} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                    <p className="text-[0.8rem] font-bold">{d}</p>
                    <ul className="mt-2 space-y-1 text-[0.78rem] text-slate-500 dark:text-slate-400">
                      {[0, 1, 2].map((k) => (
                        <li key={k}>{`0${8 + k}:00`} · {t.subjects[k % t.subjects.length]} · Grade {(i + k) % 12 + 1}-A</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === "leave" && (
            <Card className="overflow-hidden">
              <CardHeader title="Leave history" subtitle="Applications, approvals and balance" />
              {(record.data?.leaves ?? []).length ? (
                <table className="table-saas">
                  <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead>
                  <tbody>
                    {(record.data?.leaves ?? []).map((l) => (
                      <tr key={l.id}>
                        <td>{l.type}</td>
                        <td>{l.from}</td>
                        <td>{l.to}</td>
                        <td className="font-numeric">{l.days}</td>
                        <td className="max-w-[18rem] truncate text-slate-500 dark:text-slate-400">{l.reason}</td>
                        <td><Badge tone={statusTone(l.status)}>{l.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState icon={<CalendarDays className="h-7 w-7" />} title="No leave applied" message="Leave applications and balances will appear here once submitted." />
              )}
            </Card>
          )}

          {tab === "performance" && (
            <div className="grid gap-4">
              <Card className="p-5">
                <CardHeader title="Appraisal scorecard" subtitle="Weighted across observation, results and feedback" className="mb-4" />
                <div className="space-y-4">
                  {[
                    { k: "Classroom observation", v: Math.round(t.rating * 18), tone: "primary" as const },
                    { k: "Student results index", v: 84, tone: "success" as const },
                    { k: "Parent feedback", v: 91, tone: "analytics" as const },
                    { k: "Assignment turnaround", v: 78, tone: "warn" as const },
                  ].map((m) => (
                    <div key={m.k}>
                      <div className="mb-1.5 flex items-center justify-between text-[0.82rem]">
                        <span className="text-slate-600 dark:text-slate-300">{m.k}</span>
                        <span className="font-numeric font-bold">{m.v}%</span>
                      </div>
                      <ProgressBar value={m.v} tone={m.tone} />
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-5">
                <CardHeader title="Students influenced" subtitle="Aggregate result delta in taught sections" className="mb-4" />
                <HorizontalBarChart data={t.classes.slice(0, 5).map((c, i) => ({ name: `${c.name}`, value: Math.min(99, 68 + i * 5 + (t.rating > 4 ? 6 : 0)) }))} height={220} tone="#10B981" />
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const last = (n: number) => `${n} months ago`;

/* ---------------------------------------------------------- Payroll */

export function PayrollPage() {
  const { data = [], isLoading } = useQuery({ queryKey: qk.payroll, queryFn: () => api.teachers.payroll() });
  const [selected, setSelected] = useState<string[]>([]);
  const [month, setMonth] = useState(data[0]?.month ?? "");
  usePageTitle("Payroll");

  const totals = data.reduce(
    (acc, p) => ({ basic: acc.basic + p.basic, allowances: acc.allowances + p.allowances, deductions: acc.deductions + p.deductions, net: acc.net + p.net }),
    { basic: 0, allowances: 0, deductions: 0, net: 0 },
  );

  const columns: Column<PayRoll>[] = [
    { key: "name", label: "Staff member", sortable: true, render: (p) => <span className="flex items-center gap-3"><Avatar name={p.name} size={30} /><span><span className="block font-semibold">{p.name}</span><span className="block text-[0.72rem] text-slate-400">{p.designation}</span></span></span> },
    { key: "basic", label: "Basic", sortable: true, render: (p) => <span className="font-numeric">{p.basic.toLocaleString("en-US")}</span> },
    { key: "allowances", label: "Allowances", render: (p) => <span className="font-numeric text-success-500">+{p.allowances.toLocaleString("en-US")}</span> },
    { key: "deductions", label: "Deductions", render: (p) => <span className="font-numeric text-danger-500">-{p.deductions.toLocaleString("en-US")}</span> },
    { key: "net", label: "Net pay", sortable: true, render: (p) => <span className="font-numeric font-bold">Rs {p.net.toLocaleString("en-US")}</span> },
    { key: "status", label: "Status", render: (p) => <Badge tone={statusTone(p.status)} dot>{p.status}</Badge> },
    { key: "actions", label: "", render: (p) => <Button variant="ghost" size="sm" onClick={() => toast.success("Payslip", `Payslip for ${p.name} generated and emailed.`)}>Payslip</Button> },
  ];

  return (
    <div>
      <PageHeader
        title="Payroll Management"
        subtitle={`${data.length} staff on payroll · processing run for ${month || "current month"} with allowances, deductions and bank transfer file.`}
        breadcrumb={[{ label: "Finance" }, { label: "Payroll" }]}
        actions={
          <>
            <Select value={month} onChange={(e) => setMonth(e.target.value)} className="w-40">{data.slice(0, 3).map((p) => <option key={p.id} value={p.month}>{p.month}</option>)}</Select>
            <Button variant="outline" icon={<Wallet className="h-4 w-4" />} onClick={() => { exportExcel(data as unknown as Record<string, unknown>[], [{ key: "name", label: "Staff" }, { key: "net", label: "Net pay" }, { key: "status", label: "Status" }], "payroll"); toast.success("Bank file exported"); }}>Bank transfer file</Button>
            <Button variant="primary" onClick={() => toast.success("Payroll run started", `${selected.length || data.length} salaries queued for disbursement.`)}>Run payroll</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total basic" value={Math.round(totals.basic / 1_000_000)} decimals={1} prefix="Rs " suffix="M" icon={<Wallet className="h-5 w-5" />} tone="primary" />
        <StatCard label="Allowances" value={Math.round(totals.allowances / 1_000_000)} decimals={1} prefix="Rs " suffix="M" icon={<Award className="h-5 w-5" />} tone="success" />
        <StatCard label="Deductions" value={Math.round(totals.deductions / 1_000_000)} decimals={1} prefix="Rs " suffix="M" icon={<Wallet className="h-5 w-5" />} tone="danger" />
        <StatCard label="Net disbursement" value={Math.round(totals.net / 1_000_000)} decimals={1} prefix="Rs " suffix="M" icon={<CheckCircle2 className="h-5 w-5" />} tone="analytics" />
      </div>

      <DataTable
        columns={columns}
        rows={(data ?? []) as PayRoll[]}
        total={data.length}
        page={1}
        pageSize={data.length || 10}
        pages={1}
        onPage={() => {}}
        search=""
        onSearch={() => {}}
        selected={selected}
        onSelect={setSelected}
        loading={isLoading}
        exportName="payroll-register"
        bulkActions={<Button variant="outline" size="sm" onClick={() => toast.success("Marked paid", `${selected.length} staff marked as paid.`)}>Mark paid</Button>}
      />
    </div>
  );
}

export function LeavesPage() {
  const { data = [], isLoading } = useQuery({ queryKey: qk.leaves, queryFn: () => api.teachers.leaves() });
  const [filter, setFilter] = useState("All");
  usePageTitle("Leave Requests");
  const rows = filter === "All" ? data : data.filter((l) => l.status === filter);

  return (
    <div>
      <PageHeader
        title="Leave Requests"
        subtitle="Approve or reject staff leave with automatic substitute-teacher suggestions and payroll impact."
        breadcrumb={[{ label: "Academics" }, { label: "Leave Requests" }]}
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
            {["All", "Pending", "Approved", "Rejected"].map((f) => <option key={f}>{f}</option>)}
          </Select>
        }
      />
      {isLoading ? (
        <Card className="p-6"><div className="skeleton h-40 w-full" /></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((l) => (
            <Card key={l.id} hover className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar name={l.staff} size={40} />
                  <div>
                    <p className="text-[0.9rem] font-bold">{l.staff}</p>
                    <p className="text-[0.72rem] uppercase tracking-wide text-slate-400">{l.type} leave · {l.days} day{l.days > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <Badge tone={statusTone(l.status)} dot>{l.status}</Badge>
              </div>
              <p className="mt-4 text-[0.84rem] text-slate-600 dark:text-slate-300">{l.reason}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[0.76rem]">
                <span className="rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10"><span className="block text-slate-400">From</span>{l.from}</span>
                <span className="rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10"><span className="block text-slate-400">To</span>{l.to}</span>
                <span className="rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10"><span className="block text-slate-400">Applied</span>{l.appliedOn}</span>
              </div>
              {l.status === "Pending" && (
                <div className="mt-4 flex gap-2.5">
                  <Button variant="primary" size="sm" onClick={() => toast.success("Leave approved", `${l.staff} notified · substitute suggested for affected periods.`)}>Approve</Button>
                  <Button variant="outline" size="sm" onClick={() => toast.warning("Leave rejected", "The staff member has been notified with your remark.")}>Reject</Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.info("Substitutes", "3 eligible substitute teachers identified for these periods.")}>Find substitute</Button>
                </div>
              )}
            </Card>
          ))}
          {rows.length === 0 && <EmptyState className="lg:col-span-2" icon={<CalendarDays className="h-7 w-7" />} title="No leave requests" message="Requests matching this filter will appear here." />}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------- Library */

export function LibraryPage() {
  usePageTitle("Library");
  const [params, setParams] = useState({ search: "", page: 1, pageSize: 10, sortBy: "title", sortDir: "asc" as "asc" | "desc" });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const search = useDebounced(params.search);
  const query = useQuery({ queryKey: qk.books({ ...params, search, filters }), queryFn: () => api.library.books({ ...params, search, filters }) });
  const data = query.data;
  const issuesQuery = useQuery({ queryKey: qk.issues({}), queryFn: () => api.library.issues({ pageSize: 50 }) });

  const columns: Column<Book>[] = [
    { key: "title", label: "Title", sortable: true, render: (b) => <span><span className="block font-semibold text-slate-800 dark:text-slate-100">{b.title}</span><span className="block text-[0.72rem] text-slate-400">{b.author} · {b.isbn}</span></span> },
    { key: "category", label: "Category", sortable: true, render: (b) => <Badge tone="analytics">{b.category}</Badge> },
    { key: "shelf", label: "Shelf", hideOnMobile: true },
    { key: "year", label: "Year", sortable: true },
    { key: "copies", label: "Copies", sortable: true, render: (b) => <span className="font-numeric">{b.available} / {b.copies}</span> },
    { key: "rating", label: "Rating", render: (b) => <span className="flex items-center gap-1.5 font-numeric font-bold text-secondary-600 dark:text-secondary-300"><Star className="h-3.5 w-3.5 fill-current" /> {b.rating}</span> },
    { key: "actions", label: "", render: (b) => <Button variant="outline" size="sm" disabled={b.available === 0} onClick={async () => { const res = await api.library.issueBook(b.id, "Hamza Khan (S-1001)"); toast.success("Book issued", `Due date ${res.dueDate}. Reminder SMS scheduled.`); }}>{b.available === 0 ? "Unavailable" : "Issue"}</Button> },
  ];

  const overdue = (issuesQuery.data?.rows ?? []).filter((i) => i.status === "Overdue");

  return (
    <div>
      <PageHeader
        title="Library Management"
        subtitle="42,000+ catalogue records with circulation, fines, reservations and reading analytics."
        breadcrumb={[{ label: "Operations" }, { label: "Library" }]}
        actions={
          <>
            <Link to="/library/issues"><Button variant="outline" icon={<Library className="h-4 w-4" />}>Circulation</Button></Link>
            <Button variant="primary" onClick={() => toast.info("Add title", "Catalogue form opens with ISBN auto-fetch.")}>Add book</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Catalogue titles" value={42000} icon={<Library className="h-5 w-5" />} tone="primary" />
        <StatCard label="Books issued" value={60} icon={<Users className="h-5 w-5" />} tone="analytics" hint="This month" />
        <StatCard label="Overdue items" value={overdue.length} icon={<CalendarDays className="h-5 w-5" />} tone="warn" hint="Reminder sent" />
        <StatCard label="Fines collected" value={4150} prefix="Rs " icon={<Wallet className="h-5 w-5" />} tone="success" delta={8.2} />
      </div>

      <DataTable
        columns={columns}
        rows={(data?.rows ?? []) as unknown as Record<string, unknown>[]}
        total={data?.total ?? 0}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 10}
        pages={data?.pages ?? 1}
        onPage={(page) => setParams({ ...params, page })}
        onPageSize={(pageSize) => setParams({ ...params, pageSize, page: 1 })}
        search={params.search}
        onSearch={(v) => setParams({ ...params, search: v, page: 1 })}
        searchPlaceholder="Search catalogue by title, author, ISBN or shelf…"
        sortBy={params.sortBy}
        sortDir={params.sortDir}
        onSort={(sortBy) => setParams({ ...params, sortBy, sortDir: params.sortBy === sortBy && params.sortDir === "asc" ? "desc" : "asc" })}
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={[{ key: "category", label: "Category", options: ["Science", "Mathematics", "Literature", "Technology", "History", "Commerce"] }]}
        loading={query.isLoading}
        exportName="library-catalogue"
      />
    </div>
  );
}

export function LibraryIssuesPage() {
  const query = useQuery({ queryKey: qk.issues({ all: true }), queryFn: () => api.library.issues({ pageSize: 64 }) });
  usePageTitle("Circulation & Fines");
  const rows = query.data?.rows ?? [];

  const columns: Column<BookIssue>[] = [
    { key: "bookTitle", label: "Book", render: (i) => <span className="font-semibold">{i.bookTitle}</span> },
    { key: "member", label: "Member", render: (i) => <span className="flex items-center gap-2.5"><Avatar name={i.member} size={28} /><span><span className="block">{i.member}</span><span className="block text-[0.7rem] uppercase tracking-wide text-slate-400">{i.memberRole}</span></span></span> },
    { key: "issuedOn", label: "Issued", sortable: true },
    { key: "dueDate", label: "Due", sortable: true },
    { key: "returnedOn", label: "Returned", render: (i) => i.returnedOn ?? "—" },
    { key: "fine", label: "Fine", sortable: true, render: (i) => <span className={i.fine ? "font-numeric font-bold text-danger-500" : "font-numeric text-slate-400"}>Rs {i.fine}</span> },
    { key: "status", label: "Status", render: (i) => <Badge tone={statusTone(i.status)} dot>{i.status}</Badge> },
    { key: "actions", label: "", render: (i) => i.status !== "Returned" ? <Button variant="outline" size="sm" onClick={async () => { const res = await api.library.returnBook(i.id); toast.success("Book returned", res.fine ? `Fine of Rs ${res.fine} collected.` : "No fine applicable."); }}>Return</Button> : <span className="text-[0.74rem] text-slate-400">Closed</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Circulation & Fines"
        subtitle="Issue, return, renew and fine tracking with automated reminders at 3 days before due date."
        breadcrumb={[{ label: "Operations" }, { label: "Library", to: "/library" }, { label: "Circulation" }]}
        actions={<Button variant="primary" onClick={() => toast.success("Return processed", "Book logged back into catalogue stock.")}>Scan & return</Button>}
      />
      <DataTable
        columns={columns}
        rows={rows as unknown as Record<string, unknown>[]}
        total={rows.length}
        page={1}
        pageSize={rows.length || 10}
        pages={1}
        onPage={() => {}}
        search=""
        onSearch={() => {}}
        loading={query.isLoading}
        exportName="library-circulation"
      />
    </div>
  );
}

/* -------------------------------------------------------- Transport */

export function TransportPage() {
  const query = useQuery({ queryKey: ["routes"], queryFn: () => api.transport.routes() });
  const [selected, setSelected] = useState<string | null>(null);
  usePageTitle("Transport");

  const columns: Column<Route>[] = [
    { key: "name", label: "Route", render: (r) => <span><span className="block font-semibold">{r.name}</span><span className="block text-[0.72rem] text-slate-400">{r.vehicle} · {r.plate}</span></span> },
    { key: "driver", label: "Driver", render: (r) => <span><span className="block">{r.driver}</span><span className="block text-[0.72rem] text-slate-400">{r.phone}</span></span> },
    { key: "onboard", label: "Occupancy", render: (r) => <span className="flex w-32 flex-col gap-1.5"><span className="font-numeric text-[0.76rem] font-bold">{r.onboard}/{r.capacity}</span><ProgressBar value={(r.onboard / r.capacity) * 100} tone={r.onboard / r.capacity > 0.9 ? "danger" : "primary"} /></span> },
    { key: "shift", label: "Shift", render: (r) => <Badge tone="muted">{r.shift}</Badge> },
    { key: "fee", label: "Monthly fee", render: (r) => <span className="font-numeric">Rs {r.fee.toLocaleString("en-US")}</span> },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
    { key: "actions", label: "", render: (r) => <Button variant="ghost" size="sm" onClick={() => setSelected(r.id)}>Stops & GPS</Button> },
  ];

  const route = (query.data ?? []).find((r) => r.id === selected);

  return (
    <div>
      <PageHeader
        title="Transport Management"
        subtitle="14 routes with vehicle, driver, stop sequencing, occupancy and GPS-ready telemetry structure."
        breadcrumb={[{ label: "Operations" }, { label: "Transport" }]}
        actions={
          <>
            <Button variant="outline" icon={<RouteIcon className="h-4 w-4" />} onClick={() => toast.info("Route planner", "Drag-and-drop stop sequencer opens in the production build.")}>Plan route</Button>
            <Button variant="primary" icon={<Bus className="h-4 w-4" />} onClick={() => toast.success("GPS ping", "All 14 vehicles reported location · average speed 34 km/h.")}>Live tracking</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active routes" value={(query.data ?? []).filter((r) => r.status === "Active").length} icon={<Bus className="h-5 w-5" />} tone="primary" />
        <StatCard label="Students transported" value={860} icon={<Users className="h-5 w-5" />} tone="analytics" delta={5.4} />
        <StatCard label="Fleet utilisation" value={78} suffix="%" icon={<RouteIcon className="h-5 w-5" />} tone="success" delta={2.2} />
        <StatCard label="Transport revenue" value={5.2} decimals={1} prefix="Rs " suffix="M" icon={<Wallet className="h-5 w-5" />} tone="warn" />
      </div>

      <DataTable
        columns={columns}
        rows={(query.data ?? []) as unknown as Record<string, unknown>[]}
        total={(query.data ?? []).length}
        page={1}
        pageSize={14}
        pages={1}
        onPage={() => {}}
        search=""
        onSearch={() => {}}
        loading={query.isLoading}
        onRowClick={(row) => setSelected(String((row as unknown as Route).id))}
        exportName="transport-routes"
      />

      {route && (
        <Card className="mt-6 p-6">
          <CardHeader title={`${route.name} — stop sequence`} subtitle={`${route.vehicle} · Driver ${route.driver} · ${route.stops.length} stops`} className="mb-5" action={<Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button>} />
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/4">
              <ul className="space-y-4">
                {route.stops.map((stop, i) => (
                  <li key={stop} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 font-numeric text-[0.68rem] font-bold text-white">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-[0.86rem] font-semibold text-slate-800 dark:text-slate-100">{stop}</span>
                        <span className="font-numeric text-[0.76rem] text-slate-500 dark:text-slate-400">{`0${7 + i}:${i % 2 ? "25" : "10"} AM`}</span>
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-[0.72rem] text-slate-500 dark:text-slate-400"><MapPin className="h-3 w-3" /> {8 + i * 6} students · GPS checkpoint {i % 2 === 0 ? "geofence verified" : "pending"}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <Card className="p-5">
                <p className="text-[0.72rem] uppercase tracking-wide text-slate-400">Occupancy</p>
                <p className="mt-1 font-numeric text-2xl font-extrabold">{route.onboard} / {route.capacity}</p>
                <div className="mt-3"><ProgressBar value={(route.onboard / route.capacity) * 100} tone={route.onboard / route.capacity > 0.9 ? "danger" : "primary"} showLabel /></div>
                <p className="mt-3 text-[0.78rem] text-slate-500 dark:text-slate-400">Monthly fee Rs {route.fee.toLocaleString("en-US")} · shift {route.shift}</p>
              </Card>
              <Card className="p-5">
                <p className="text-[0.72rem] uppercase tracking-wide text-slate-400">Safety & compliance</p>
                <ul className="mt-3 space-y-2 text-[0.8rem] text-slate-600 dark:text-slate-300">
                  {["Fitness certificate valid till 2026", "Driver licence & medical verified", "First aid kit and fire extinguisher onboard", "GPS + speed governor installed"].map((s) => (
                    <li key={s} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-500" /> {s}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- Hostel */

export function HostelPage() {
  usePageTitle("Hostel");
  const [params, setParams] = useState({ search: "", page: 1, pageSize: 10, sortBy: "room", sortDir: "asc" as "asc" | "desc" });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const search = useDebounced(params.search);
  const query = useQuery({ queryKey: qk.hostel({ ...params, search, filters }), queryFn: () => api.hostel.rooms({ ...params, search, filters }) });
  const data = query.data;

  const columns: Column<HostelRoom>[] = [
    { key: "room", label: "Room", sortable: true, render: (r) => <span><span className="block font-semibold">Room {r.room}</span><span className="block text-[0.72rem] text-slate-400">{r.block} · Floor {r.floor}</span></span> },
    { key: "type", label: "Type", render: (r) => <Badge tone="muted">{r.type} sharing</Badge> },
    { key: "occupied", label: "Beds", sortable: true, render: (r) => <span className="flex w-32 flex-col gap-1.5"><span className="font-numeric text-[0.76rem] font-bold">{r.occupied}/{r.beds} occupied</span><ProgressBar value={(r.occupied / r.beds) * 100} tone={r.occupied === r.beds ? "danger" : "success"} /></span> },
    { key: "fee", label: "Monthly fee", sortable: true, render: (r) => <span className="font-numeric">Rs {r.fee.toLocaleString("en-US")}</span> },
    { key: "warden", label: "Warden", hideOnMobile: true },
    { key: "status", label: "Status", render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
    { key: "actions", label: "", render: (r) => <Button variant="outline" size="sm" disabled={r.status !== "Available"} onClick={async () => { await api.hostel.allocate(r.id, "S-1042"); toast.success("Bed allocated", `${r.block} Room ${r.room} assigned with mess plan.`); }}>Allocate</Button> },
  ];

  return (
    <div>
      <PageHeader
        title="Hostel Management"
        subtitle="4 blocks, 96 rooms and 288 beds with allocation, mess plans, warden rosters and inspection logs."
        breadcrumb={[{ label: "Operations" }, { label: "Hostel" }]}
        actions={<Button variant="primary" icon={<BedDouble className="h-4 w-4" />} onClick={() => toast.info("Allocation wizard", "Allocation flow opens with block and bed selection.")}>Allocate bed</Button>}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total beds" value={(query.data?.total ?? 48) * 4} icon={<BedDouble className="h-5 w-5" />} tone="primary" />
        <StatCard label="Occupancy" value={72} suffix="%" icon={<Users className="h-5 w-5" />} tone="success" delta={4.1} />
        <StatCard label="Hostel revenue" value={6.8} decimals={1} prefix="Rs " suffix="M" icon={<Wallet className="h-5 w-5" />} tone="analytics" />
        <StatCard label="Maintenance requests" value={5} icon={<Award className="h-5 w-5" />} tone="warn" hint="2 in progress" />
      </div>
      <DataTable
        columns={columns}
        rows={(data?.rows ?? []) as unknown as Record<string, unknown>[]}
        total={data?.total ?? 0}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 10}
        pages={data?.pages ?? 1}
        onPage={(page) => setParams({ ...params, page })}
        onPageSize={(pageSize) => setParams({ ...params, pageSize, page: 1 })}
        search={params.search}
        onSearch={(v) => setParams({ ...params, search: v, page: 1 })}
        searchPlaceholder="Search by room, block, warden or type…"
        sortBy={params.sortBy}
        sortDir={params.sortDir}
        onSort={(sortBy) => setParams({ ...params, sortBy, sortDir: params.sortBy === sortBy && params.sortDir === "asc" ? "desc" : "asc" })}
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={[
          { key: "block", label: "Block", options: ["Block A (Boys)", "Block B (Boys)", "Block C (Girls)", "Block D (Girls)"] },
          { key: "type", label: "Type", options: ["Single", "Double", "Triple", "Quad"] },
          { key: "status", label: "Status", options: ["Available", "Full", "Maintenance"] },
        ]}
        loading={query.isLoading}
        exportName="hostel-rooms"
      />
    </div>
  );
}

export { ArrowLeft };
