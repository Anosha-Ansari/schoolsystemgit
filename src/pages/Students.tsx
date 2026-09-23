import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  Mail,
  Pencil,
  Phone,
  Printer,
  Save,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Field,
  FileDrop,
  InfoRow,
  Input,
  Modal,
  MoreMenu,
  PageHeader,
  ProgressBar,
  RadialProgress,
  Select,
  StatCard,
  Stepper,
  Tabs,
  Textarea,
  statusTone,
  type Column,
} from "@/components/ui";
import { api, exportExcel, exportPDF, exportCSV, ROLE_MATRIX } from "@/lib/api";
import { qk, queryClient, toast, useDebounced, usePageTitle } from "@/lib/store";
import { CLASS_NAMES, GRADE_LEVELS, HOUSES, SUBJECTS, classRooms, timetableSlots, weekDays, type Student } from "@/lib/db";
import { AttendanceAreaChart, SubjectRadarChart } from "@/components/charts";
import { cn } from "@/utils/cn";

/* ------------------------------------------------------ Student list */

export function StudentsList() {
  usePageTitle("Student Management");
  const [params, setParams] = useState({ search: "", page: 1, pageSize: 10, sortBy: "name", sortDir: "asc" as "asc" | "desc" });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const search = useDebounced(params.search, 320);
  const navigate = useNavigate();

  const listQuery = useQuery({ queryKey: qk.students({ ...params, search, filters }), queryFn: () => api.students.list({ ...params, search, filters }) });
  const data = listQuery.data;

  const remove = useMutation({
    mutationFn: (id: string) => api.students.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student record archived", "The record was soft-deleted and moved to the archive store.");
    },
  });

  const columns: Column<Student>[] = [
    {
      key: "name",
      label: "Student",
      sortable: true,
      render: (r) => (
        <span className="flex items-center gap-3">
          <Avatar name={r.name} size={34} />
          <span>
            <span className="block font-semibold text-slate-800 dark:text-slate-100">{r.name}</span>
            <span className="block text-[0.72rem] text-slate-400">Roll {r.rollNo} · CNIC {r.cnic}</span>
          </span>
        </span>
      ),
    },
    { key: "className", label: "Class", sortable: true, render: (r) => <Badge tone="primary">{r.className}-{r.section}</Badge> },
    { key: "gender", label: "Gender", hideOnMobile: true, render: (r) => <Badge tone={r.gender === "Male" ? "muted" : "analytics"}>{r.gender}</Badge> },
    { key: "guardian", label: "Guardian", sortable: true, hideOnMobile: true, render: (r) => (<span><span className="block">{r.guardian}</span><span className="block text-[0.72rem] text-slate-400">{r.guardianPhone}</span></span>) },
    { key: "attendanceRate", label: "Attendance", sortable: true, render: (r) => <span className="flex w-28 flex-col gap-1.5"><span className="font-numeric text-[0.78rem] font-bold">{r.attendanceRate}%</span><ProgressBar value={r.attendanceRate} tone={r.attendanceRate > 90 ? "success" : r.attendanceRate > 80 ? "warn" : "danger"} /></span> },
    { key: "gpa", label: "GPA", sortable: true, render: (r) => <span className="font-numeric font-bold text-slate-900 dark:text-white">{r.gpa}</span> },
    { key: "feeStatus", label: "Fees", sortable: true, render: (r) => (<span className="flex flex-col gap-1"><Badge tone={statusTone(r.feeStatus)}>{r.feeStatus}</Badge>{r.outstanding > 0 && <span className="font-numeric text-[0.7rem] text-danger-500">Rs {r.outstanding.toLocaleString("en-US")}</span>}</span>) },
    { key: "status", label: "Status", hideOnMobile: true, render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <span onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <MoreMenu
            items={[
              { label: "View profile", icon: <Users className="h-3.5 w-3.5" />, onClick: () => navigate(`/students/${r.id}`) },
              { label: "Edit record", icon: <Pencil className="h-3.5 w-3.5" />, onClick: () => navigate(`/students/${r.id}/edit`) },
              { label: "Download PDF", icon: <Printer className="h-3.5 w-3.5" />, onClick: () => { navigate(`/students/${r.id}`); window.setTimeout(() => exportPDF(`student-${r.id}`), 400); } },
              { label: "Archive record", icon: <Trash2 className="h-3.5 w-3.5" />, danger: true, onClick: () => setDeleteId(r.id) },
            ]}
          />
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Student Management"
        subtitle="5,180 active students across 50 sections. Advanced search, filters, bulk operations and exports with an immutable audit trail."
        breadcrumb={[{ label: "Academics" }, { label: "Students" }]}
        actions={
          <>
            <Button variant="outline" icon={<Upload className="h-4 w-4" />} onClick={() => setImportOpen(true)}>
              Bulk import
            </Button>
            <Link to="/students/new">
              <Button variant="primary" icon={<UserPlus className="h-4 w-4" />}>
                Add student
              </Button>
            </Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active students" value={5180} icon={<Users className="h-5 w-5" />} tone="primary" delta={4.2} />
        <StatCard label="Average attendance" value={93.8} decimals={1} suffix="%" icon={<ClipboardList className="h-5 w-5" />} tone="success" delta={1.1} />
        <StatCard label="Fee outstanding" value={2.4} decimals={1} prefix="Rs " suffix="M" icon={<Wallet className="h-5 w-5" />} tone="warn" delta={-6.4} />
        <StatCard label="New admissions (month)" value={86} icon={<UserCheck className="h-5 w-5" />} tone="analytics" delta={12.5} />
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
        onSearch={(value) => setParams({ ...params, search: value, page: 1 })}
        searchPlaceholder="Search by name, roll number, guardian or CNIC…"
        sortBy={params.sortBy}
        sortDir={params.sortDir}
        onSort={(sortBy) => setParams({ ...params, sortBy, sortDir: params.sortBy === sortBy && params.sortDir === "asc" ? "desc" : "asc" })}
        filters={filters}
        onFiltersChange={(f) => { setFilters(f); setParams({ ...params, page: 1 }); }}
        filterOptions={[
          { key: "className", label: "Class", options: CLASS_NAMES },
          { key: "gender", label: "Gender", options: ["Male", "Female"] },
          { key: "feeStatus", label: "Fee status", options: ["Paid", "Partial", "Overdue"] },
          { key: "status", label: "Status", options: ["active", "inactive", "graduated"] },
        ]}
        selected={selected}
        onSelect={setSelected}
        onRowClick={(row) => navigate(`/students/${row.id}`)}
        loading={listQuery.isLoading}
        exportName="students"
        serverHint={`query: students.find(${JSON.stringify(filters)}).sort({${params.sortBy}:${params.sortDir}}) · ${data?.total ?? 0} docs`}
        bulkActions={
          <>
            <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => { exportExcel((data?.rows ?? []) as unknown as Record<string, unknown>[], [{ key: "name", label: "Name" }, { key: "rollNo", label: "Roll" }, { key: "className", label: "Class" }], "students-selection"); toast.success("Selection exported"); }}>
              Export selection
            </Button>
            <Button variant="outline" size="sm" icon={<Mail className="h-3.5 w-3.5" />} onClick={() => toast.info("SMS queued", `${selected.length} guardian notifications queued to the SMS worker.`)}>
              Notify guardians
            </Button>
          </>
        }
      />

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Bulk import students" subtitle="CSV or Excel with columns: name, grade, section, guardian, phone" size="lg" icon={<Upload className="h-5 w-5" />}>
        <FileDrop onFiles={(names) => toast.info("File staged", `${names.join(", ")} validated — 0 duplicates detected.`)} hint="Accepted: .csv, .xlsx · max 25 MB · server-side validation enabled" />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { k: "1,240", v: "Rows detected" },
            { k: "0", v: "Validation errors" },
            { k: "2", v: "Possible duplicates" },
          ].map((s) => (
            <div key={s.v} className="rounded-xl border border-slate-200 p-3.5 dark:border-white/10">
              <p className="font-numeric text-lg font-bold text-slate-900 dark:text-white">{s.k}</p>
              <p className="text-[0.74rem] text-slate-500 dark:text-slate-400">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={async () => {
              const res = await api.students.bulkImport(1240);
              toast.success(`${res.imported} students imported`, `${res.duplicates} duplicates skipped, roll numbers generated.`);
              setImportOpen(false);
            }}
          >
            Start import
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove.mutate(deleteId)}
        title="Archive student record?"
        message="The record will be soft-deleted (kept for audit), removed from active rosters and flagged in attendance and fee modules."
        confirmLabel="Archive record"
      />
    </div>
  );
}

/* -------------------------------------------------- Add / Edit forms */

export function StudentForm({ mode }: { mode: "create" | "edit" }) {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const existing = useQuery({ queryKey: qk.student(studentId ?? ""), queryFn: () => api.students.get(studentId!), enabled: mode === "edit" && !!studentId });
  const [form, setForm] = useState({
    name: "", gender: "Male" as "Male" | "Female", dob: "", className: "Grade 6", section: "A", guardian: "", guardianPhone: "", guardianEmail: "",
    address: "", bloodGroup: "O+", house: "Blue" as (typeof HOUSES)[number], transport: "", hostel: "", previous: "", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<string[]>([]);
  usePageTitle(mode === "create" ? "Add Student" : "Edit Student");

  const steps = ["Personal", "Academic", "Guardian", "Documents"];

  const submit = useMutation({
    mutationFn: async () => (mode === "create" ? api.students.create(form as Partial<Student>) : api.students.update(studentId!, form as Partial<Student>)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(mode === "create" ? "Student enrolled" : "Student record updated", mode === "create" ? "Roll number and portal credentials generated automatically." : "Changes recorded in the audit log.");
      navigate("/students");
    },
  });

  const next = () => {
    const err: Record<string, string> = {};
    if (step === 0 && form.name.trim().length < 3) err.name = "Enter the student's full name";
    if (step === 0 && !form.dob) err.dob = "Date of birth is required";
    if (step === 2) {
      if (form.guardian.trim().length < 3) err.guardian = "Guardian name is required";
      if (!/^[+0-9\s()-]{9,}$/.test(form.guardianPhone)) err.guardianPhone = "Enter a valid phone number";
      if (form.guardianEmail && !/^\S+@\S+\.\S+$/.test(form.guardianEmail)) err.guardianEmail = "Enter a valid email";
    }
    setErrors(err);
    if (Object.keys(err).length) return;
    if (step < steps.length - 1) setStep(step + 1);
    else submit.mutate();
  };

  return (
    <div>
      <PageHeader
        title={mode === "create" ? "Add new student" : `Edit ${existing.data?.student.name ?? "student"}`}
        subtitle="Four-step guided form with inline validation. Roll number, portal login and fee profile are generated on save."
        breadcrumb={[{ label: "Academics" }, { label: "Students", to: "/students" }, { label: mode === "create" ? "Add" : "Edit" }]}
        actions={<Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate("/students")}>Back to list</Button>}
      />

      <Card className="p-6">
        <Stepper steps={steps.map((s, i) => ({ id: String(i), label: s }))} current={step} onJump={setStep} />

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {step === 0 && (
            <>
              <Field label="Full name" required error={errors.name} className="sm:col-span-2">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student's name as per B-Form" />
              </Field>
              <Field label="Gender">
                <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as "Male" | "Female" })}>
                  <option>Male</option>
                  <option>Female</option>
                </Select>
              </Field>
              <Field label="Date of birth" required error={errors.dob}>
                <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              </Field>
              <Field label="Blood group">
                <Select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => <option key={b}>{b}</option>)}
                </Select>
              </Field>
              <Field label="House">
                <Select value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value as (typeof HOUSES)[number] })}>
                  {HOUSES.map((h) => <option key={h}>{h}</option>)}
                </Select>
              </Field>
              <Field label="Home address" className="sm:col-span-2">
                <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House, street, area, city" />
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Grade">
                <Select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}>
                  {GRADE_LEVELS.map((g) => <option key={g}>{g}</option>)}
                </Select>
              </Field>
              <Field label="Section">
                <Select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                  {["A", "B"].map((s) => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Previous school">
                <Input value={form.previous} onChange={(e) => setForm({ ...form, previous: e.target.value })} placeholder="Last school attended" />
              </Field>
              <Field label="Transport route">
                <Select value={form.transport} onChange={(e) => setForm({ ...form, transport: e.target.value })}>
                  <option value="">Not required</option>
                  {["Route R-1 — Gulshan", "Route R-4 — Clifton", "Route R-7 — North Nazimabad"].map((r) => <option key={r}>{r}</option>)}
                </Select>
              </Field>
              <Field label="Hostel allocation">
                <Select value={form.hostel} onChange={(e) => setForm({ ...form, hostel: e.target.value })}>
                  <option value="">Day scholar</option>
                  {["Al-Farabi Boys Block A", "Ibn-e-Sina Boys Block B", "Fatima Jinnah Girls Block C"].map((h) => <option key={h}>{h}</option>)}
                </Select>
              </Field>
              <Field label="Section capacity">
                <div className="rounded-xl border border-slate-200 px-4 py-3 text-[0.82rem] text-slate-500 dark:border-white/10 dark:text-slate-400">
                  {form.className}-{form.section} currently has {classRooms.find((c) => c.name === `${form.className}-${form.section}`)?.students ?? 0} of 45 seats.
                </div>
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Guardian name" required error={errors.guardian}>
                <Input value={form.guardian} onChange={(e) => setForm({ ...form, guardian: e.target.value })} placeholder="Father / mother / guardian" />
              </Field>
              <Field label="Guardian mobile" required error={errors.guardianPhone}>
                <Input value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} placeholder="+92 300 1234567" inputMode="tel" />
              </Field>
              <Field label="Guardian email" error={errors.guardianEmail} hint="Portal invitation is sent here." className="sm:col-span-2">
                <Input type="email" value={form.guardianEmail} onChange={(e) => setForm({ ...form, guardianEmail: e.target.value })} placeholder="guardian@email.com" />
              </Field>
              <Field label="Internal notes" className="sm:col-span-2" hint="Visible to administrators and class teacher only.">
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Medical conditions, learning support needs, sibling references…" />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <div className="sm:col-span-2">
                <FileDrop onFiles={(names) => setFiles(names)} hint="B-Form, birth certificate, previous transcript, guardian CNIC, photographs" />
              </div>
              {files.length > 0 && (
                <ul className="sm:col-span-2 divide-y divide-slate-100 dark:divide-white/8">
                  {files.map((f) => (
                    <li key={f} className="flex items-center justify-between py-3">
                      <span className="flex items-center gap-3 text-[0.84rem] text-slate-700 dark:text-slate-200">
                        <FileText className="h-4 w-4 text-primary-500" /> {f}
                      </span>
                      <Badge tone="success">Staged</Badge>
                    </li>
                  ))}
                </ul>
              )}
              <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/4">
                <h3 className="text-[0.9rem] font-bold">On save, the system will:</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {["Generate roll number and admission ID", "Create portal login for guardian", "Build the fee profile and first challan", "Add student to class roster and attendance ledger", "Assign house and section timetable slot"].map((t) => (
                    <li key={t} className="flex gap-2 text-[0.82rem] text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-500" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button variant="primary" loading={submit.isPending} onClick={next} icon={step === steps.length - 1 ? <Save className="h-4 w-4" /> : undefined}>
            {step === steps.length - 1 ? (mode === "create" ? "Enrol student" : "Save changes") : "Continue"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/students")}>Cancel</Button>
          {existing.data && <Badge tone="muted">Editing {existing.data.student.id}</Badge>}
        </div>
      </Card>
    </div>
  );
}

/* --------------------------------------------------- Student profile */

export function StudentDetail() {
  const { studentId } = useParams();
  const [tab, setTab] = useState<"overview" | "attendance" | "results" | "assignments" | "timetable" | "fees" | "documents" | "analytics">("overview");
  const record = useQuery({ queryKey: qk.student(studentId ?? ""), queryFn: () => api.students.get(studentId!), enabled: !!studentId });
  const s = record.data?.student;
  usePageTitle(s ? s.name : "Student record");

  if (record.isLoading)
    return (
      <div className="space-y-4">
        <div className="skeleton h-28 w-full" />
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-64 w-full" />)}
        </div>
      </div>
    );

  if (!s) return <EmptyState title="Student not found" message="The record may have been archived or the link is out of date." action={<Link to="/students"><Button variant="primary">Back to students</Button></Link>} />;

  const attendanceLog = record.data?.attendance ?? [];
  const chartData = attendanceLog.map((a, i) => ({ date: a.date.slice(5), present: a.status === "Present" ? 1 : 0, absent: a.status === "Absent" ? 1 : 0, late: a.status === "Late" ? 1 : 0, rate: a.status === "Present" ? 100 : a.status === "Late" ? 85 : 40, index: i }));

  return (
    <div id="print-root">
      <PageHeader
        title={s.name}
        subtitle={`${s.className}-${s.section} · Roll ${s.rollNo} · Admitted ${s.admissionDate} · ${s.house} House`}
        breadcrumb={[{ label: "Academics" }, { label: "Students", to: "/students" }, { label: "Profile" }]}
        badge={<Badge tone={statusTone(s.status)} dot>{s.status}</Badge>}
        actions={
          <>
            <Button variant="outline" icon={<Printer className="h-4 w-4" />} onClick={() => exportPDF(`student-${s.rollNo}`)}>
              Print / PDF
            </Button>
            <Button variant="outline" icon={<Mail className="h-4 w-4" />} onClick={() => toast.info("Guardian notified", `SMS and email queued to ${s.guardian}.`)}>
              Notify guardian
            </Button>
            <Link to={`/students/${s.id}/edit`}>
              <Button variant="primary" icon={<Pencil className="h-4 w-4" />}>Edit</Button>
            </Link>
          </>
        }
      />

      <div className="print-area grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar name={s.name} size={72} />
            <div>
              <p className="text-[1.05rem] font-bold text-slate-900 dark:text-white">{s.name}</p>
              <p className="text-[0.8rem] text-slate-500 dark:text-slate-400">{s.className}-{s.section} · {s.gender} · {s.bloodGroup}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="primary">{s.house} House</Badge>
                {s.transport && <Badge tone="muted">Transport</Badge>}
                {s.hostel && <Badge tone="analytics">Hostel</Badge>}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 p-3 text-center dark:border-white/10">
              <p className="font-numeric text-lg font-bold text-slate-900 dark:text-white">{s.gpa}</p>
              <p className="text-[0.66rem] uppercase tracking-wide text-slate-400">GPA</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3 text-center dark:border-white/10">
              <p className="font-numeric text-lg font-bold text-slate-900 dark:text-white">{s.attendanceRate}%</p>
              <p className="text-[0.66rem] uppercase tracking-wide text-slate-400">Attendance</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3 text-center dark:border-white/10">
              <p className="font-numeric text-lg font-bold text-slate-900 dark:text-white">{s.riskScore}</p>
              <p className="text-[0.66rem] uppercase tracking-wide text-slate-400">Risk</p>
            </div>
          </div>

          <div className="mt-6">
            <InfoRow label="Guardian" value={s.guardian} icon={<Users className="h-3.5 w-3.5" />} />
            <InfoRow label="Guardian phone" value={<a href={`tel:${s.guardianPhone}`} className="text-primary-600 dark:text-primary-300">{s.guardianPhone}</a>} icon={<Phone className="h-3.5 w-3.5" />} />
            <InfoRow label="Guardian email" value={s.guardianEmail} icon={<Mail className="h-3.5 w-3.5" />} />
            <InfoRow label="Date of birth" value={s.dob} icon={<CalendarDays className="h-3.5 w-3.5" />} />
            <InfoRow label="Address" value={<span className="block max-w-[16rem] text-right text-[0.78rem]">{s.address}</span>} />
            <InfoRow label="Transport" value={s.transport ?? "Not availing"} />
            <InfoRow label="Hostel" value={s.hostel ?? "Day scholar"} />
            <InfoRow label="Outstanding fees" value={<span className={s.outstanding ? "text-danger-500" : "text-success-600"}>Rs {s.outstanding.toLocaleString("en-US")}</span>} icon={<Wallet className="h-3.5 w-3.5" />} />
          </div>

          <div className="mt-6">
            <p className="label-saas">Achievements</p>
            <ul className="space-y-2">
              {s.achievements.map((a) => (
                <li key={a} className="flex gap-2 text-[0.8rem] text-slate-600 dark:text-slate-300">
                  <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary-500" /> {a}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <div>
          <Tabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "attendance", label: "Attendance" },
              { id: "results", label: "Results" },
              { id: "assignments", label: "Assignments", badge: record.data?.assignments.length },
              { id: "timetable", label: "Timetable" },
              { id: "fees", label: "Fee history" },
              { id: "documents", label: "Documents", badge: s.documents.length },
              { id: "analytics", label: "Analytics" },
            ]}
            value={tab}
            onChange={setTab}
            className="mb-5"
          />

          {tab === "overview" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <CardHeader title="Academic standing" subtitle="Rank and trend in section" className="mb-4" />
                <div className="flex items-center gap-5">
                  <RadialProgress value={Math.round(s.gpa * 25)} label="Index" />
                  <div className="space-y-2 text-[0.82rem] text-slate-600 dark:text-slate-300">
                    <p>Section position <span className="font-numeric font-bold text-slate-900 dark:text-white">14 / 32</span></p>
                    <p>Grade progress <span className="font-semibold text-success-600">+0.4 GPA</span> vs last term</p>
                    <p>Subjects below 60%: <span className="font-semibold text-danger-500">{(s.gpa < 3 ? 2 : 0)}</span></p>
                  </div>
                </div>
              </Card>
              <Card className="p-5">
                <CardHeader title="Attendance summary" subtitle="Last 30 school days" className="mb-4" />
                <div className="space-y-3">
                  {["Present", "Late", "Absent"].map((label, i) => {
                    const value = attendanceLog.filter((a) => a.status === label).length;
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between text-[0.8rem]">
                          <span className="text-slate-600 dark:text-slate-300">{label}</span>
                          <span className="font-numeric font-bold text-slate-900 dark:text-white">{value} days</span>
                        </div>
                        <ProgressBar value={(value / Math.max(1, attendanceLog.length)) * 100} tone={i === 0 ? "success" : i === 1 ? "warn" : "danger"} className="mt-1.5" />
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card className="p-5 sm:col-span-2">
                <CardHeader title="AI risk signals" subtitle="Computed nightly from attendance, results and fee behaviour" className="mb-4" icon={<TrendingUp className="h-4 w-4" />} />
                <div className="flex flex-wrap items-center gap-4">
                  <RadialProgress value={s.riskScore} label="Risk" tone={s.riskScore > 60 ? "#EF4444" : "#10B981"} />
                  <ul className="flex-1 space-y-2 text-[0.82rem] text-slate-600 dark:text-slate-300">
                    {s.riskScore > 60 ? (
                      <>
                        <li>• Attendance dropped below 80% for two consecutive weeks.</li>
                        <li>• Two subjects below the 55% threshold in the last assessment.</li>
                        <li className="font-semibold text-primary-600 dark:text-primary-300">Recommended: mentor assignment + weekly remedial slot.</li>
                      </>
                    ) : (
                      <>
                        <li>• Attendance and assessment trend is stable.</li>
                        <li>• No financial or behavioural flags detected.</li>
                        <li className="font-semibold text-success-600">Recommended: continue enrichment pathway.</li>
                      </>
                    )}
                  </ul>
                </div>
              </Card>
            </div>
          )}

          {tab === "attendance" && (
            <Card>
              <CardHeader title="Attendance record" subtitle="Daily status with monthly roll-up" />
              <div className="p-4">
                <AttendanceAreaChart data={chartData} height={260} />
              </div>
                <div className="max-h-72 overflow-y-auto border-t border-slate-100 dark:border-white/8">
                  <table className="table-saas">
                    <thead><tr><th>Date</th><th>Status</th><th>Marked by</th></tr></thead>
                    <tbody>
                      {attendanceLog.slice().reverse().map((a, i) => (
                        <tr key={a.date}>
                          <td>{a.date}</td>
                          <td><Badge tone={statusTone(a.status)}>{a.status}</Badge></td>
                          <td className="text-slate-400">{i % 4 === 0 ? "QR gate scan" : "Class register"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </Card>
          )}

          {tab === "results" && (
            <Card className="overflow-hidden">
              <CardHeader
                title="Examination results"
                subtitle="Subject-wise marks with grade and position"
                action={<Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => { exportCSV((record.data?.marks ?? []) as unknown as Record<string, unknown>[], [{ key: "subject", label: "Subject" }, { key: "obtained", label: "Marks" }, { key: "grade", label: "Grade" }], `results-${s.rollNo}`); toast.success("CSV exported"); }}>Export</Button>}
              />
              {record.data?.marks.length ? (
                <div className="overflow-x-auto">
                  <table className="table-saas">
                    <thead><tr><th>Exam</th><th>Subject</th><th>Marks</th><th>Grade</th><th>Remarks</th></tr></thead>
                    <tbody>
                      {record.data.marks.map((m) => (
                        <tr key={m.id}>
                          <td>{m.examId}</td>
                          <td className="font-semibold text-slate-800 dark:text-slate-100">{m.subject}</td>
                          <td className="font-numeric">{m.obtained} / {m.total}</td>
                          <td><Badge tone={m.grade === "A+" ? "success" : m.grade === "F" ? "danger" : "primary"}>{m.grade}</Badge></td>
                          <td className="text-slate-500 dark:text-slate-400">{m.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon={<BookOpen className="h-7 w-7" />} title="No published results yet" message="Marks will appear here as soon as subject teachers submit and the results are published." />
              )}
            </Card>
          )}

          {tab === "assignments" && (
            <Card className="overflow-hidden">
              <CardHeader title="Assignments" subtitle="Submission status and grading" action={<Link to="/assignments"><Button variant="ghost" size="sm">All assignments</Button></Link>} />
              <ul className="divide-y divide-slate-100 dark:divide-white/8">
                {(record.data?.assignments ?? []).map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="text-[0.88rem] font-semibold text-slate-800 dark:text-slate-100">{a.title}</p>
                      <p className="mt-0.5 text-[0.76rem] text-slate-500 dark:text-slate-400">{a.subject} · due {a.deadline} · {a.totalMarks} marks</p>
                    </div>
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </li>
                ))}
                {(record.data?.assignments ?? []).length === 0 && <li className="px-5 py-10"><EmptyState title="No assignments issued" message="Assignments appear here when your subject teachers publish them." className="border-0 bg-transparent" /></li>}
              </ul>
            </Card>
          )}

          {tab === "timetable" && (
            <Card className="overflow-hidden">
              <CardHeader title="Weekly timetable" subtitle="8 periods per day · Mon–Sat" />
              <div className="overflow-x-auto">
                <table className="table-saas">
                  <thead>
                    <tr><th>Period</th>{weekDays.map((d) => <th key={d}>{d}</th>)}</tr>
                  </thead>
                  <tbody>
                    {(record.data?.timetable ?? []).map((row) => (
                      <tr key={row.slot}>
                        <td className="font-numeric font-semibold text-slate-800 dark:text-slate-100">{row.slot}</td>
                        {weekDays.map((d) => (
                          <td key={d} className="text-[0.8rem]">{row[d as keyof typeof row] ?? "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "fees" && (
            <Card className="overflow-hidden">
              <CardHeader title="Fee history" subtitle="Challans, payments and outstanding" action={<Link to="/fees"><Button variant="ghost" size="sm">Fee module</Button></Link>} />
              <div className="overflow-x-auto">
                <table className="table-saas">
                  <thead><tr><th>Challan</th><th>Month</th><th>Amount</th><th>Paid</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {(record.data?.invoices ?? []).map((inv) => (
                      <tr key={inv.id}>
                        <td className="font-numeric">{inv.challanNo}</td>
                        <td>{inv.month}</td>
                        <td className="font-numeric">Rs {inv.amount.toLocaleString("en-US")}</td>
                        <td className="font-numeric">Rs {inv.paid.toLocaleString("en-US")}</td>
                        <td><Badge tone={statusTone(inv.status)}>{inv.status}</Badge></td>
                        <td><Link to={`/fees/${inv.id}`} className="text-[0.76rem] font-semibold text-primary-600 dark:text-primary-300">View</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "documents" && (
            <Card className="p-5">
              <CardHeader title="Documents" subtitle="Verified uploads stored on Cloudinary" className="mb-4" action={<Button variant="outline" size="sm" icon={<Upload className="h-3.5 w-3.5" />} onClick={() => toast.info("Upload dialog", "Cloudinary signed upload opens in a drawer in the production build.")}>Upload</Button>} />
              <ul className="divide-y divide-slate-100 dark:divide-white/8">
                {s.documents.map((d) => (
                  <li key={d.name} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/8 dark:text-slate-300">
                        <FileText className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-[0.84rem] font-semibold text-slate-800 dark:text-slate-100">{d.name}</span>
                        <span className="block text-[0.72rem] text-slate-400">{d.type} · {d.size} · uploaded {d.uploaded}</span>
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge tone={d.verified ? "success" : "warn"}>{d.verified ? "Verified" : "Pending"}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => toast.success("Download started", `${d.name} is on its way.`)}>Download</Button>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {tab === "analytics" && (
            <div className="grid gap-4">
              <Card>
                <CardHeader title="Performance radar" subtitle="Subject-wise index for this student" />
                <div className="p-4">
                  <SubjectRadarChart
                    data={SUBJECTS.slice(0, 6).map((sub, i) => ({ subject: sub, score: Math.min(100, Math.round(s.gpa * 20 + ((i * 7) % 18))), lastTerm: Math.min(96, Math.round(s.gpa * 19 + ((i * 5) % 14))) }))}
                    height={300}
                    comparison
                  />
                </div>
              </Card>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Assignments submitted" value={Math.round(s.gpa * 6)} icon={<ClipboardList className="h-5 w-5" />} tone="primary" />
                <StatCard label="Attendance trend" value={s.attendanceRate} suffix="%" decimals={1} icon={<UserCheck className="h-5 w-5" />} tone="success" delta={1.6} />
                <StatCard label="Fee compliance" value={s.outstanding ? 60 : 100} suffix="%" icon={<Wallet className="h-5 w-5" />} tone={s.outstanding ? "warn" : "success"} />
              </div>
              <Card className="p-5">
                <CardHeader title="Progress timeline" subtitle="Milestones recorded for this student" className="mb-4" />
                <ul className="space-y-3 text-[0.82rem] text-slate-600 dark:text-slate-300">
                  <li className="flex justify-between border-b border-slate-100 pb-2 dark:border-white/8"><span>Admitted to {s.className}-{s.section}</span><span className="text-slate-400">{s.admissionDate}</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-2 dark:border-white/8"><span>First term result published</span><span className="text-slate-400">Term 1</span></li>
                  <li className="flex justify-between border-b border-slate-100 pb-2 dark:border-white/8"><span>House assignment — {s.house}</span><span className="text-slate-400">On admission</span></li>
                  <li className="flex justify-between"><span>Documents verified</span><span className="text-slate-400">{s.documents.filter((d) => d.verified).length}/{s.documents.length}</span></li>
                </ul>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ Classes & Calendar */

export function ClassesPage() {
  const [search, setSearch] = useState("");
  const [params] = useSearchParams();
  const section = params.get("section") ?? "";
  const rows = useMemo(
    () => classRooms.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.classTeacher.toLowerCase().includes(search.toLowerCase())).filter((c) => !section || c.name === section),
    [search, section],
  );
  const [slotView, setSlotView] = useState(false);
  usePageTitle("Classes & Timetable");

  return (
    <div>
      <PageHeader
        title="Classes & Timetable"
        subtitle="50 sections with class teachers, strength, subject allocation and period-wise timetable."
        breadcrumb={[{ label: "Academics" }, { label: "Classes & Timetable" }]}
        actions={
          <>
            <Button variant={slotView ? "outline" : "primary"} onClick={() => setSlotView(false)} icon={<Users className="h-4 w-4" />}>Sections</Button>
            <Button variant={slotView ? "primary" : "outline"} onClick={() => setSlotView(true)} icon={<CalendarDays className="h-4 w-4" />}>Master timetable</Button>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportExcel(classRooms as unknown as Record<string, unknown>[], [{ key: "name", label: "Section" }, { key: "classTeacher", label: "Class Teacher" }, { key: "students", label: "Students" }], "class-sections"); toast.success("Excel exported"); }}>Export</Button>
          </>
        }
      />

      {!slotView ? (
        <>
          <div className="mb-5 max-w-md">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search section or class teacher…" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                <Card hover className="h-full p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-[1.05rem] font-extrabold text-slate-900 dark:text-white">{c.name}</p>
                      <p className="mt-1 text-[0.76rem] text-slate-500 dark:text-slate-400">{c.room} · {c.classTeacher}</p>
                    </div>
                    <Badge tone={c.students / c.capacity > 0.92 ? "danger" : "primary"}>{c.students}/{c.capacity}</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[0.74rem] text-slate-500 dark:text-slate-400">
                      <span>Average score</span>
                      <span className="font-numeric font-bold text-slate-900 dark:text-white">{c.avgScore}%</span>
                    </div>
                    <ProgressBar value={c.avgScore} tone={c.avgScore > 80 ? "success" : c.avgScore > 65 ? "primary" : "warn"} />
                    <div className="mt-3 mb-1.5 flex items-center justify-between text-[0.74rem] text-slate-500 dark:text-slate-400">
                      <span>Attendance</span>
                      <span className="font-numeric font-bold text-slate-900 dark:text-white">{c.attendance}%</span>
                    </div>
                    <ProgressBar value={c.attendance} tone="success" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.subjects.slice(0, 3).map((sub) => <Badge key={sub} tone="muted">{sub}</Badge>)}
                    {c.subjects.length > 3 && <Badge tone="muted">+{c.subjects.length - 3}</Badge>}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link to={`/students?section=${encodeURIComponent(c.name)}`}><Button variant="outline" size="sm">Roster</Button></Link>
                    <Link to="/attendance/mark"><Button variant="ghost" size="sm">Attendance</Button></Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader title="Master timetable" subtitle="Grade 9-A · 8 periods · subject and teacher allocation" action={<Button variant="outline" size="sm" onClick={() => exportPDF("master-timetable")}>Print</Button>} />
          <div className="overflow-x-auto">
            <table className="table-saas">
              <thead><tr><th>Period</th>{weekDays.map((d) => <th key={d}>{d}</th>)}</tr></thead>
              <tbody>
                {timetableSlots.map((slot, si) => (
                  <tr key={slot}>
                    <td className="font-numeric font-semibold text-slate-800 dark:text-slate-100">{slot}</td>
                    {weekDays.map((_, di) => {
                      const subject = SUBJECTS[(si * 3 + di) % SUBJECTS.length];
                      const teacher = `${subject.slice(0, 3).toUpperCase()}-${(si + di) % 9 + 1}`;
                      return (
                        <td key={di} className={cn("text-[0.78rem]", si === 4 && "bg-secondary-200/30 dark:bg-secondary-400/10")}>
                          {si === 4 ? <span className="font-semibold text-secondary-600 dark:text-secondary-300">Break</span> : <><span className="block font-medium text-slate-700 dark:text-slate-200">{subject}</span><span className="block text-[0.68rem] text-slate-400">{teacher}</span></>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export function CalendarPage() {
  usePageTitle("Calendar");
  const [view, setView] = useState<"month" | "week" | "agenda">("month");
  const today = new Date();
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), i - 4);
    return { date: d, iso: d.toISOString().slice(0, 10), inMonth: d.getMonth() === today.getMonth() };
  });
  const events = [
    { day: 4, title: "PTM (Term 2)", tone: "primary" as const },
    { day: 9, title: "Sports Day", tone: "success" as const },
    { day: 12, title: "Fee deadline", tone: "warn" as const },
    { day: 21, title: "Science Fair", tone: "analytics" as const },
    { day: 26, title: "Pre-Board exams begin", tone: "danger" as const },
  ];

  return (
    <div>
      <PageHeader
        title="Academic Calendar"
        subtitle="Month, week and agenda views for examinations, meetings, events and fee deadlines."
        breadcrumb={[{ label: "Operations" }, { label: "Calendar" }]}
        actions={
          <div className="flex gap-1.5">
            {(["month", "week", "agenda"] as const).map((v) => (
              <Button key={v} variant={view === v ? "primary" : "outline"} size="sm" onClick={() => setView(v)} className="capitalize">{v}</Button>
            ))}
          </div>
        }
      />

      {view === "month" && (
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-[1.05rem] font-extrabold">{today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            <div className="flex gap-2"><Button variant="outline" size="sm">Today</Button><Button variant="ghost" size="sm">+ New event</Button></div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-[0.68rem] font-bold uppercase tracking-wide text-slate-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {days.map((d) => {
              const dayEvents = events.filter((e) => e.day === d.date.getDate() && d.inMonth);
              const isToday = d.iso === new Date().toISOString().slice(0, 10);
              return (
                <div key={d.iso} className={cn("min-h-24 rounded-xl border p-2 transition", d.inMonth ? "border-slate-200 bg-white dark:border-white/10 dark:bg-white/3" : "border-transparent bg-slate-50/60 dark:bg-white/2", isToday && "border-primary-400 ring-2 ring-primary-500/20")}>
                  <span className={cn("font-numeric text-[0.76rem] font-bold", d.inMonth ? "text-slate-700 dark:text-slate-200" : "text-slate-300")}>{d.date.getDate()}</span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map((e) => (
                      <span key={e.title} className={cn("block truncate rounded-md px-1.5 py-0.5 text-[0.62rem] font-semibold", e.tone === "primary" ? "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200" : e.tone === "success" ? "bg-success-100 text-success-600 dark:bg-success-500/12 dark:text-success-400" : e.tone === "warn" ? "bg-secondary-200/70 text-secondary-600 dark:bg-secondary-400/12 dark:text-secondary-300" : e.tone === "danger" ? "bg-danger-100 text-danger-600 dark:bg-danger-500/12 dark:text-danger-400" : "bg-analytics-100 text-analytics-600 dark:bg-analytics-500/12 dark:text-analytics-300")}>
                        {e.title}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {view === "week" && (
        <Card className="overflow-x-auto p-4">
          <table className="table-saas">
            <thead><tr><th>Time</th>{weekDays.slice(0, 5).map((d) => <th key={d}>{d}</th>)}</tr></thead>
            <tbody>
              {["08:00", "09:00", "10:00", "11:00", "12:00", "01:00"].map((t, ti) => (
                <tr key={t}>
                  <td className="font-numeric text-slate-500">{t}</td>
                  {weekDays.slice(0, 5).map((_, di) => (
                    <td key={di}>
                      {(ti + di) % 4 === 0 ? <Badge tone="primary">{(ti + di) % 2 === 0 ? "Grade 9-A Mathematics" : "Grade 10-B Physics"}</Badge> : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {view === "agenda" && (
        <div className="space-y-4">
          {[...events, { day: 28, title: "Result publishing window", tone: "primary" as const }].map((e) => (
            <Card key={e.title} hover className="flex items-center gap-4 p-4">
              <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary-50 text-primary-700 dark:bg-primary-500/12 dark:text-primary-200">
                <span className="font-numeric text-[1.05rem] font-extrabold leading-none">{e.day}</span>
                <span className="text-[0.6rem] uppercase">{today.toLocaleDateString("en-US", { month: "short" })}</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.92rem] font-bold text-slate-800 dark:text-slate-100">{e.title}</p>
                <p className="text-[0.78rem] text-slate-500 dark:text-slate-400">Campus-wide · notification sent to all roles</p>
              </div>
              <Badge tone={e.tone}>{ROLE_MATRIX.admin.label} view</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
