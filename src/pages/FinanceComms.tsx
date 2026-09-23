import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  FileBarChart2,
  FileText,
  Filter,
  Mail,
  Pin,
  Plus,
  Printer,
  Receipt,
  Send,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { DonutChart, FeePieChart, GrowthAreaChart, HorizontalBarChart, RevenueBarChart, Sparkline } from "@/components/charts";
import { Avatar, Badge, Button, Card, CardHeader, DataTable, EmptyState, Field, Input, Modal, PageHeader, ProgressBar, Select, StatCard, Tabs, Textarea, statusTone, type Column } from "@/components/ui";
import { api, exportCSV, exportExcel, exportPDF } from "@/lib/api";
import { qk, toast, useDebounced, usePageTitle, useChatStore } from "@/lib/store";
import { invoices, notices as seedNotices, activities, schoolEvents, type FeeInvoice, type Notice, type Thread } from "@/lib/db";
import { cn } from "@/utils/cn";

const money = (n: number) => `Rs ${(n / 1_000_000).toFixed(2)}M`;

/* -------------------------------------------------------------- Fees */

export function FeesList() {
  usePageTitle("Fee Management");
  const [params, setParams] = useState({ search: "", page: 1, pageSize: 10, sortBy: "dueDate", sortDir: "desc" as "asc" | "desc" });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [payId, setPayId] = useState<string | null>(null);
  const [method, setMethod] = useState("Online");
  const search = useDebounced(params.search);
  const query = useQuery({ queryKey: qk.invoices({ ...params, search, filters }), queryFn: () => api.fees.invoices({ ...params, search, filters }) });
  const data = query.data;
  const ageing = useQuery({ queryKey: ["ageing"], queryFn: () => api.fees.ageing() });

  const columns: Column<FeeInvoice>[] = [
    { key: "challanNo", label: "Challan", sortable: true, render: (i) => <span><span className="block font-numeric font-semibold text-slate-800 dark:text-slate-100">{i.challanNo}</span><span className="block text-[0.72rem] text-slate-400">{i.month}</span></span> },
    { key: "studentName", label: "Student", sortable: true, render: (i) => <span className="flex items-center gap-3"><Avatar name={i.studentName} size={30} /><span><span className="block font-semibold">{i.studentName}</span><span className="block text-[0.72rem] text-slate-400">{i.className}</span></span></span> },
    { key: "amount", label: "Amount", sortable: true, render: (i) => <span className="font-numeric">Rs {i.amount.toLocaleString("en-US")}</span> },
    { key: "paid", label: "Paid", sortable: true, render: (i) => <span className="font-numeric text-success-500">Rs {i.paid.toLocaleString("en-US")}</span> },
    { key: "fine", label: "Fine", hideOnMobile: true, render: (i) => <span className={cn("font-numeric", i.fine ? "text-danger-500" : "text-slate-400")}>Rs {i.fine}</span> },
    { key: "dueDate", label: "Due date", sortable: true },
    { key: "method", label: "Method", hideOnMobile: true, render: (i) => <Badge tone="muted">{i.method}</Badge> },
    { key: "status", label: "Status", render: (i) => <Badge tone={statusTone(i.status)} dot>{i.status}</Badge> },
    {
      key: "actions",
      label: "",
      render: (i) => (
        <span className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); exportPDF(`challan-${i.challanNo}`); }} icon={<Printer className="h-3.5 w-3.5" />}>Challan</Button>
          {i.status !== "Paid" && <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); setPayId(i.id); }}>Collect</Button>}
        </span>
      ),
    },
  ];

  const invoice = invoices.find((i) => i.id === payId);

  return (
    <div>
      <PageHeader
        title="Fee Management"
        subtitle="Batch challan generation, online collection, receipts, ageing buckets and revenue analytics — reconciled daily."
        breadcrumb={[{ label: "Finance" }, { label: "Fees" }]}
        actions={
          <>
            <Link to="/fees/overdue"><Button variant="outline" icon={<AlertTriangle className="h-4 w-4" />}>Overdue ({invoices.filter((i) => i.status === "Overdue").length})</Button></Link>
            <Link to="/fees/revenue"><Button variant="outline" icon={<TrendingUp className="h-4 w-4" />}>Revenue</Button></Link>
            <Link to="/fees/generate"><Button variant="primary" icon={<Plus className="h-4 w-4" />}>Generate challans</Button></Link>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected this month" value={Math.round(invoices.filter((i) => i.status === "Paid").reduce((a, i) => a + i.paid, 0) / 1_000_000)} decimals={2} prefix="Rs " suffix="M" icon={<CreditCard className="h-5 w-5" />} tone="success" delta={6.8} />
        <StatCard label="Outstanding" value={Math.round(invoices.reduce((a, i) => a + (i.amount - i.paid), 0) / 1_000_000)} decimals={2} prefix="Rs " suffix="M" icon={<Wallet className="h-5 w-5" />} tone="danger" delta={-4.1} />
        <StatCard label="Collection rate" value={87.6} decimals={1} suffix="%" icon={<TrendingUp className="h-5 w-5" />} tone="primary" spark={[62, 68, 71, 76, 79, 84, 88]} />
        <StatCard label="Scholarships applied" value={200} icon={<BadgeCheck className="h-5 w-5" />} tone="analytics" hint="Merit + need based" />
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
        searchPlaceholder="Search by challan number, student, class or month…"
        sortBy={params.sortBy}
        sortDir={params.sortDir}
        onSort={(sortBy) => setParams({ ...params, sortBy, sortDir: params.sortBy === sortBy && params.sortDir === "asc" ? "desc" : "asc" })}
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={[
          { key: "status", label: "Status", options: ["Paid", "Partial", "Overdue"] },
          { key: "className", label: "Class", options: Array.from(new Set(invoices.map((i) => i.className))).slice(0, 12) },
          { key: "method", label: "Method", options: ["Cash", "Card", "Online", "Bank Transfer", "—"] },
        ]}
        selected={selected}
        onSelect={setSelected}
        loading={query.isLoading}
        exportName="fee-invoices"
        bulkActions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.info("Reminders queued", `SMS + email reminders scheduled for ${selected.length} guardians.`)} icon={<Send className="h-3.5 w-3.5" />}>Send reminders</Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Bulk receipt", "Consolidated receipt PDF generated.")} icon={<Receipt className="h-3.5 w-3.5" />}>Print receipts</Button>
          </>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Fee ageing analysis" subtitle="Outstanding amount by days overdue" icon={<AlertTriangle className="h-4 w-4" />} />
          <div className="p-4">
            <HorizontalBarChart
              data={(ageing.data ?? []).map((a) => ({ name: a.bucket, value: Math.round(a.amount / 1000) }))}
              height={240}
              tone="#EF4444"
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Collection mix" subtitle="Invoice status distribution" />
          <div className="p-4">
            <FeePieChart
              data={[
                { name: "Paid", value: invoices.filter((i) => i.status === "Paid").length },
                { name: "Partial", value: invoices.filter((i) => i.status === "Partial").length },
                { name: "Overdue", value: invoices.filter((i) => i.status === "Overdue").length },
              ]}
              height={240}
            />
          </div>
        </Card>
      </div>

      <Modal
        open={!!payId}
        onClose={() => setPayId(null)}
        title="Collect fee payment"
        subtitle={invoice ? `${invoice.challanNo} · ${invoice.studentName} · ${invoice.month}` : ""}
        icon={<CreditCard className="h-5 w-5" />}
      >
        {invoice && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
              <ul className="space-y-2 text-[0.84rem]">
                {invoice.heads.map((h) => (
                  <li key={h.label} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 dark:border-white/8">
                    <span className="text-slate-600 dark:text-slate-300">{h.label}</span>
                    <span className={cn("font-numeric font-semibold", h.amount < 0 ? "text-success-500" : "")}>Rs {h.amount.toLocaleString("en-US")}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between pt-2 text-[0.9rem] font-bold">
                  <span>Total payable</span>
                  <span className="font-numeric">Rs {(invoice.amount + invoice.fine - invoice.paid).toLocaleString("en-US")}</span>
                </li>
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Payment method">
                <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                  {["Online", "Cash", "Card", "Bank Transfer"].map((m) => <option key={m}>{m}</option>)}
                </Select>
              </Field>
              <Field label="Amount received">
                <Input type="number" defaultValue={invoice.amount + invoice.fine - invoice.paid} />
              </Field>
            </div>
            <div className="flex flex-wrap justify-end gap-2.5">
              <Button variant="ghost" onClick={() => setPayId(null)}>Cancel</Button>
              <Button
                variant="primary"
                icon={<Receipt className="h-4 w-4" />}
                onClick={async () => {
                  const res = await api.fees.pay(invoice.id, invoice.amount - invoice.paid, method);
                  toast.success("Payment recorded", `Receipt ${res.receipt} generated and emailed to the guardian.`);
                  setPayId(null);
                }}
              >
                Confirm & print receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function FeeGenerate() {
  const [month, setMonth] = useState("March 2026");
  const [classes, setClasses] = useState<string[]>(["Grade 6-A", "Grade 6-B", "Grade 9-A"]);
  const [heads, setHeads] = useState([
    { label: "Tuition Fee", amount: 11400 },
    { label: "Lab & Library", amount: 1200 },
  ]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ generated: number; amount: number } | null>(null);
  usePageTitle("Generate Challans");

  return (
    <div>
      <PageHeader
        title="Generate Fee Challans"
        subtitle="Batch-generate challans for selected sections with fee heads, sibling discounts, transport and hostel add-ons."
        breadcrumb={[{ label: "Finance" }, { label: "Fees", to: "/fees" }, { label: "Generate" }]}
        actions={<Link to="/fees"><Button variant="ghost">Back to fees</Button></Link>}
      />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Billing month">
              <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                {["March 2026", "April 2026", "May 2026"].map((m) => <option key={m}>{m}</option>)}
              </Select>
            </Field>
            <Field label="Due date">
              <Input type="date" defaultValue="2026-03-12" />
            </Field>
            <div className="sm:col-span-2">
              <p className="label-saas">Sections to bill</p>
              <div className="flex flex-wrap gap-2">
                {["Grade 6-A", "Grade 6-B", "Grade 7-A", "Grade 9-A", "Grade 9-B", "Grade 10-A", "Grade 11-A", "Grade 12-A"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setClasses((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))}
                    className={cn("rounded-xl border px-3 py-2 text-[0.78rem] font-semibold transition", classes.includes(c) ? "border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-white" : "border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400")}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="label-saas">Fee heads</p>
              <ul className="space-y-2.5">
                {heads.map((h, i) => (
                  <li key={h.label} className="flex items-center gap-3">
                    <Input value={h.label} onChange={(e) => setHeads((prev) => prev.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))} className="flex-1" />
                    <Input type="number" value={h.amount} onChange={(e) => setHeads((prev) => prev.map((x, idx) => (idx === i ? { ...x, amount: Number(e.target.value) } : x)))} className="w-36" />
                    <Button variant="ghost" size="sm" onClick={() => setHeads((prev) => prev.filter((_, idx) => idx !== i))}>Remove</Button>
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="mt-3" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setHeads([...heads, { label: "New head", amount: 0 }])}>Add fee head</Button>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              loading={generating}
              icon={<CreditCard className="h-4 w-4" />}
              onClick={async () => {
                setGenerating(true);
                const res = await api.fees.generate({ month, classes, heads });
                setGenerating(false);
                setResult({ generated: res.generated, amount: res.amount });
                toast.success(`${res.generated} challans generated`, `${month} billing queued · SMS dispatched to guardians.`);
              }}
            >
              Generate challans
            </Button>
            <Button variant="outline" onClick={() => toast.info("Preview", "Draft challan preview generated for the first 10 students.")}>Preview sample</Button>
          </div>

          {result && (
            <div className="mt-6 rounded-2xl border border-success-500/30 bg-success-100/50 p-5 dark:bg-success-500/10">
              <p className="flex items-center gap-2 text-[0.9rem] font-bold text-success-700 dark:text-success-300">
                <CheckCircle2 className="h-4 w-4" /> {result.generated} challans created
              </p>
              <p className="mt-2 text-[0.84rem] text-slate-600 dark:text-slate-300">
                Billed amount {money(result.amount)} · challan PDFs stored on Cloudinary with unique numbers · online payment links active.
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <CardHeader title="Billing preview" subtitle="Estimated impact of this run" className="mb-5" />
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
              <p className="text-[0.72rem] uppercase tracking-wide text-slate-400">Per-student maximum</p>
              <p className="mt-1 font-numeric text-2xl font-extrabold">Rs {heads.reduce((a, h) => a + h.amount, 0).toLocaleString("en-US")}</p>
              <p className="mt-2 text-[0.78rem] text-slate-500 dark:text-slate-400">{classes.length} sections · approx {classes.length * 32} challans · {money(heads.reduce((a, h) => a + h.amount, 0) * classes.length * 32)} total billing</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
              <p className="text-[0.72rem] uppercase tracking-wide text-slate-400">Collection forecast</p>
              <div className="mt-3"><Sparkline data={[64, 70, 76, 74, 82, 88, 92]} height={50} /></div>
              <p className="mt-2 text-[0.82rem] text-slate-600 dark:text-slate-300">AI projects 92.7% realisation within 30 days of dispatch.</p>
            </div>
            <ul className="space-y-2.5 text-[0.82rem] text-slate-600 dark:text-slate-300">
              {["Sibling discounts applied automatically", "Transport & hostel add-ons included from student profile", "Late fine schedule applied after due date", "Scholarship credits deducted before invoicing"].map((t) => (
                <li key={t} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-500" /> {t}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function RevenuePage() {
  const revenue = useQuery({ queryKey: qk.revenue, queryFn: () => api.metrics.revenue() });
  const growth = useQuery({ queryKey: qk.growth, queryFn: () => api.metrics.growth() });
  usePageTitle("Revenue Analytics");

  const rows = revenue.data ?? [];
  const totalCollected = rows.reduce((a, r) => a + r.collected, 0);
  const totalOutstanding = rows.reduce((a, r) => a + r.outstanding, 0);
  const totalExpenses = rows.reduce((a, r) => a + r.expenses, 0);

  return (
    <div>
      <PageHeader
        title="Revenue & Fee Analytics"
        subtitle="Twelve-month revenue performance with collection efficiency, expense ratio and forecast."
        breadcrumb={[{ label: "Finance" }, { label: "Fees", to: "/fees" }, { label: "Revenue" }]}
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportExcel(rows, [{ key: "month", label: "Month" }, { key: "collected", label: "Collected" }, { key: "outstanding", label: "Outstanding" }, { key: "expenses", label: "Expenses" }], "revenue-ytd"); toast.success("Excel exported"); }}>Export</Button>
            <Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={() => exportPDF("revenue-report")}>Finance report</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue YTD" value={Math.round(totalCollected / 1_000_000)} decimals={1} prefix="Rs " suffix="M" icon={<Wallet className="h-5 w-5" />} tone="primary" delta={9.3} spark={rows.slice(-8).map((r) => r.collected / 100000)} />
        <StatCard label="Outstanding" value={Math.round(totalOutstanding / 1_000_000)} decimals={1} prefix="Rs " suffix="M" icon={<AlertTriangle className="h-5 w-5" />} tone="danger" delta={-5.2} />
        <StatCard label="Expenses" value={Math.round(totalExpenses / 1_000_000)} decimals={1} prefix="Rs " suffix="M" icon={<Receipt className="h-5 w-5" />} tone="warn" />
        <StatCard label="Collection efficiency" value={Number(((totalCollected / (totalCollected + totalOutstanding)) * 100).toFixed(1))} decimals={1} suffix="%" icon={<TrendingUp className="h-5 w-5" />} tone="success" delta={2.4} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue vs outstanding vs expenses" subtitle="Monthly comparison with target line" />
          <div className="p-4">{revenue.isLoading ? <div className="skeleton h-72 w-full" /> : <RevenueBarChart data={rows} height={320} />}</div>
        </Card>
        <Card>
          <CardHeader title="Enrolment vs revenue" subtitle="Growth correlation" />
          <div className="p-4">{growth.isLoading ? <div className="skeleton h-64 w-full" /> : <GrowthAreaChart data={growth.data ?? []} height={280} />}</div>
        </Card>
        <Card className="p-6">
          <CardHeader title="Revenue composition" subtitle="Where the money comes from" className="mb-5" />
          <DonutChart
            data={[
              { name: "Tuition", value: 62 },
              { name: "Transport", value: 14 },
              { name: "Hostel", value: 12 },
              { name: "Admission & misc", value: 8 },
              { name: "Events", value: 4 },
            ]}
            height={280}
            centerLabel="Share %"
            centerValue="100%"
          />
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Monthly ledger" subtitle="Collected, outstanding, expenses and realisation rate" />
        <div className="overflow-x-auto">
          <table className="table-saas">
            <thead><tr><th>Month</th><th>Target</th><th>Collected</th><th>Outstanding</th><th>Expenses</th><th>Realisation</th></tr></thead>
            <tbody>
              {rows.slice().reverse().map((r) => (
                <tr key={r.month}>
                  <td className="font-semibold">{r.month}</td>
                  <td className="font-numeric">{money(r.target)}</td>
                  <td className="font-numeric text-success-500">{money(r.collected)}</td>
                  <td className="font-numeric text-secondary-600 dark:text-secondary-300">{money(r.outstanding)}</td>
                  <td className="font-numeric text-analytics-600 dark:text-analytics-300">{money(r.expenses)}</td>
                  <td className="w-40"><ProgressBar value={Math.round((r.collected / r.target) * 100)} tone={r.collected / r.target > 0.9 ? "success" : "warn"} showLabel /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function OverduePage() {
  const overdue = invoices.filter((i) => i.status === "Overdue" || i.status === "Partial");
  const [selected, setSelected] = useState<string[]>([]);
  usePageTitle("Overdue & Recovery");
  const buckets = [
    { k: "0–15 days", v: 14, tone: "warn" as const },
    { k: "16–30 days", v: 18, tone: "warn" as const },
    { k: "31–60 days", v: 9, tone: "danger" as const },
    { k: "60+ days", v: 4, tone: "danger" as const },
  ];

  return (
    <div>
      <PageHeader
        title="Overdue Fees & Recovery"
        subtitle="Ageing buckets, escalation ladder and AI-assisted recovery prioritisation."
        breadcrumb={[{ label: "Finance" }, { label: "Fees", to: "/fees" }, { label: "Overdue" }]}
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportCSV(overdue as unknown as Record<string, unknown>[], [{ key: "challanNo", label: "Challan" }, { key: "studentName", label: "Student" }, { key: "amount", label: "Amount" }], "overdue-fees"); toast.success("CSV exported"); }}>Export list</Button>
            <Button variant="primary" icon={<Send className="h-4 w-4" />} onClick={() => toast.success("Escalation started", `${selected.length || overdue.length} guardians moved to the reminder ladder.`)}>Run recovery campaign</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {buckets.map((b) => (
          <Card key={b.k} hover className="p-5">
            <p className="text-[0.72rem] uppercase tracking-wide text-slate-400">{b.k}</p>
            <p className={cn("mt-1 font-numeric text-2xl font-extrabold", b.tone === "danger" ? "text-danger-500" : "text-secondary-600 dark:text-secondary-300")}>{b.v} challans</p>
            <div className="mt-3"><ProgressBar value={b.v * 4} tone={b.tone} /></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Overdue accounts" subtitle={`${overdue.length} students with pending dues`} />
          <div className="max-h-[32rem] overflow-y-auto">
            <table className="table-saas">
              <thead><tr><th>Student</th><th>Class</th><th>Pending</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {overdue.slice(0, 40).map((i) => (
                  <tr key={i.id}>
                    <td className="flex items-center gap-3">
                      <input type="checkbox" checked={selected.includes(i.id)} onChange={() => setSelected((s) => (s.includes(i.id) ? s.filter((x) => x !== i.id) : [...s, i.id]))} className="h-3.5 w-3.5 accent-primary-500" />
                      <Avatar name={i.studentName} size={28} />
                      <span className="font-semibold">{i.studentName}</span>
                    </td>
                    <td>{i.className}</td>
                    <td className="font-numeric text-danger-500">Rs {(i.amount - i.paid).toLocaleString("en-US")}</td>
                    <td><Badge tone={statusTone(i.status)}>{i.status}</Badge></td>
                    <td>
                      <Button variant="outline" size="sm" onClick={() => toast.info("Reminder sent", `SMS + email dispatched to guardian of ${i.studentName}.`)}>Remind</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader title="Escalation ladder" subtitle="Automated recovery sequence" className="mb-5" />
            <ol className="space-y-3">
              {[
                { d: "Day 1", t: "Automated SMS + email reminder with payment link" },
                { d: "Day 7", t: "Second reminder, online payment discount window" },
                { d: "Day 15", t: "Class teacher informed, diary note" },
                { d: "Day 30", t: "Guardian meeting request with accounts officer" },
                { d: "Day 45", t: "Principal escalation, instalment plan offer" },
              ].map((s) => (
                <li key={s.d} className="flex gap-3 rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10">
                  <Badge tone="primary">{s.d}</Badge>
                  <span className="text-[0.82rem] text-slate-600 dark:text-slate-300">{s.t}</span>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="p-6">
            <CardHeader title="AI recovery priority" subtitle="Predicted likelihood of payment" className="mb-5" icon={<Sparkles className="h-4 w-4" />} />
            <ul className="space-y-3">
              {[
                { n: "Zain Abbas (Grade 9-A)", p: 82, a: "Rs 4,200" },
                { n: "Sara Malik (Grade 7-B)", p: 68, a: "Rs 9,800" },
                { n: "Bilal Sheikh (Grade 11-A)", p: 41, a: "Rs 21,400" },
              ].map((c) => (
                <li key={c.n} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[0.84rem] font-semibold text-slate-800 dark:text-slate-100">{c.n}</span>
                    <Badge tone={c.p > 70 ? "success" : c.p > 50 ? "warn" : "danger"}>{c.p}% likely</Badge>
                  </div>
                  <div className="mt-2"><ProgressBar value={c.p} tone={c.p > 70 ? "success" : "warn"} /></div>
                  <p className="mt-2 text-[0.76rem] text-slate-500 dark:text-slate-400">Outstanding {c.a} · expected within 21 days</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Reports */

export function ReportsCentre() {
  const [type, setType] = useState("Attendance report");
  const [range, setRange] = useState({ from: "2026-01-01", to: "2026-03-01" });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ rows: number; pages: number } | null>(null);
  const attendanceReport = useQuery({ queryKey: ["attendance-report"], queryFn: () => api.reports.attendanceReport() });
  usePageTitle("Reports Centre");

  const reportTypes = ["Attendance report", "Student report", "Teacher report", "Exam report", "Revenue report", "Fee report", "Library report", "Transport report", "Custom report"];

  return (
    <div>
      <PageHeader
        title="Reports Centre"
        subtitle="Cross-module report builder with date range, grouping, drill-down, and CSV / Excel / PDF export."
        breadcrumb={[{ label: "Finance" }, { label: "Reports Centre" }]}
        actions={<Button variant="primary" icon={<FileBarChart2 className="h-4 w-4" />} onClick={() => toast.info("Scheduled reports", "Report schedules are delivered by email every Monday at 7 AM.")}>Schedule delivery</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <CardHeader title="Report builder" subtitle="Choose a report type and range" className="mb-5" />
          <div className="space-y-5">
            <Field label="Report type">
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {reportTypes.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="From"><Input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></Field>
              <Field label="To"><Input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Group by">
                <Select defaultValue="Class">
                  {["Class", "Section", "Gender", "Fee status", "Transport route", "Day"].map((g) => <option key={g}>{g}</option>)}
                </Select>
              </Field>
              <Field label="Format">
                <Select defaultValue="Excel">
                  {["Excel", "CSV", "PDF", "On screen"].map((g) => <option key={g}>{g}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Filters" hint="Leave blank to include the entire campus">
              <Input placeholder="e.g. Grade 9-A, female, overdue" />
            </Field>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                loading={generating}
                onClick={async () => {
                  setGenerating(true);
                  const res = await api.reports.build(type, range);
                  setGenerating(false);
                  setResult({ rows: res.rows, pages: res.pages });
                  toast.success(`${type} generated`, `${res.rows} rows across ${res.pages} pages.`);
                }}
              >
                Generate report
              </Button>
              <Button variant="outline" onClick={() => { exportExcel((attendanceReport.data ?? []) as unknown as Record<string, unknown>[], [{ key: "date", label: "Date" }, { key: "present", label: "Present" }, { key: "rate", label: "Rate" }], "report-sample"); toast.success("Sample exported"); }} icon={<Download className="h-4 w-4" />}>Sample export</Button>
            </div>
            {result && (
              <div className="rounded-2xl border border-success-500/30 bg-success-100/50 p-4 text-[0.84rem] dark:bg-success-500/10">
                <p className="font-bold text-success-700 dark:text-success-300">{type} ready</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{result.rows} records · {result.pages} pages · generated {new Date().toLocaleTimeString()}</p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader title="Attendance report preview" subtitle="30-day campus register" action={<Button variant="ghost" size="sm" icon={<Printer className="h-3.5 w-3.5" />} onClick={() => exportPDF("attendance-report-preview")}>Print</Button>} />
            <div className="max-h-80 overflow-y-auto">
              <table className="table-saas">
                <thead><tr><th>Date</th><th>Present</th><th>Boys</th><th>Girls</th><th>Staff</th><th>Rate</th></tr></thead>
                <tbody>
                  {(attendanceReport.data ?? []).slice(-16).reverse().map((r) => (
                    <tr key={r.date}>
                      <td className="font-numeric">{r.date}</td>
                      <td className="font-numeric">{r.present}</td>
                      <td className="font-numeric text-primary-600 dark:text-primary-300">{r.boys}</td>
                      <td className="font-numeric text-analytics-600 dark:text-analytics-300">{r.girls}</td>
                      <td className="font-numeric">{r.staffPresent}</td>
                      <td><Badge tone={r.rate > 94 ? "success" : "warn"}>{r.rate}%</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            {["Attendance", "Finance", "Academic"].map((cat) => (
              <Card key={cat} hover className="p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/12 dark:text-primary-300">
                  <FileBarChart2 className="h-4 w-4" />
                </span>
                <p className="mt-4 text-[0.9rem] font-bold">{cat} pack</p>
                <p className="mt-1 text-[0.78rem] text-slate-500 dark:text-slate-400">Pre-built report bundle with 6 standard reports.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => toast.success(`${cat} pack queued`, "Bundle will be emailed as a zip archive.")}>Download pack</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- Notice board */

export function NoticeBoard() {
  const list = useQuery({ queryKey: qk.notices, queryFn: () => api.notices.list() });
  const [filter, setFilter] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "All", priority: "Normal", pinned: false });
  usePageTitle("Notice Board");

  const notices = (list.data ?? seedNotices).filter((n) => (filter === "All" ? true : filter === "Pinned" ? n.pinned : n.priority === filter || n.audience === filter));

  return (
    <div>
      <PageHeader
        title="Notice Board"
        subtitle="School-wide, class-specific, urgent and pinned announcements with read receipts and attachment support."
        breadcrumb={[{ label: "Communication" }, { label: "Notice Board" }]}
        actions={
          <>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
              {["All", "Pinned", "Urgent", "Important", "Students", "Parents", "Teachers"].map((f) => <option key={f}>{f}</option>)}
            </Select>
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>New notice</Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active notices" value={notices.length} icon={<Bell className="h-5 w-5" />} tone="primary" />
        <StatCard label="Pinned" value={notices.filter((n) => n.pinned).length} icon={<Pin className="h-5 w-5" />} tone="analytics" />
        <StatCard label="Total views" value={notices.reduce((a, n) => a + n.views, 0)} icon={<Users className="h-5 w-5" />} tone="success" />
        <StatCard label="Urgent" value={notices.filter((n) => n.priority === "Urgent").length} icon={<AlertTriangle className="h-5 w-5" />} tone="danger" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {notices.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
            <Card hover className={cn("h-full p-5", n.pinned && "border-primary-300/70")}>
              <div className="flex flex-wrap items-center gap-2.5">
                {n.pinned && <Badge tone="primary" dot>Pinned</Badge>}
                <Badge tone={n.priority === "Urgent" ? "danger" : n.priority === "Important" ? "warn" : "muted"}>{n.priority}</Badge>
                <Badge tone="analytics">{n.audience}{n.className ? ` · ${n.className}` : ""}</Badge>
                <span className="ml-auto text-[0.72rem] text-slate-400">{n.postedAt}</span>
              </div>
              <h3 className="mt-3.5 text-[1.02rem] font-bold text-slate-900 dark:text-white">{n.title}</h3>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-slate-600 dark:text-slate-300">{n.body}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5 dark:border-white/8">
                <span className="flex items-center gap-3 text-[0.74rem] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {n.views.toLocaleString("en-US")} views</span>
                  {n.attachments > 0 && <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {n.attachments} files</span>}
                </span>
                <span className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toast.info("Reminder queued", "Guardians and students without read receipts will be reminded.")}>Remind unread</Button>
                  <Button variant="outline" size="sm" onClick={() => exportPDF(`notice-${n.id}`)}>Print</Button>
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Publish a notice" subtitle="Broadcast to selected audiences with attachments and pinning" size="lg" icon={<Bell className="h-5 w-5" />}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" required className="sm:col-span-2">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notice headline" />
          </Field>
          <Field label="Audience">
            <Select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              {["All", "Students", "Parents", "Teachers", "Class"].map((a) => <option key={a}>{a}</option>)}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {["Normal", "Important", "Urgent"].map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="Body" required className="sm:col-span-2">
            <Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write the notice content…" />
          </Field>
          <label className="sm:col-span-2 flex items-center gap-3 text-[0.84rem]">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="h-4 w-4 rounded accent-primary-500" />
            Pin to the top of the notice board
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="primary"
            onClick={async () => {
              if (form.title.trim().length < 5 || form.body.trim().length < 10) {
                toast.error("Incomplete notice", "Add a title and at least 10 characters of content.");
                return;
              }
              await api.notices.create(form as Partial<Notice>);
              toast.success("Notice published", `Delivered to ${form.audience.toLowerCase()} with push and email.`);
              setCreateOpen(false);
            }}
          >
            Publish notice
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/* ----------------------------------------------------------- Messages */

export function MessagesPage() {
  const threads = useQuery({ queryKey: qk.threads, queryFn: () => api.messages.threads() });
  const { threads: local, activeId, setThreads, setActive, send, pushInbound, setTyping, markSeen, connected } = useChatStore();
  const [draft, setDraft] = useState("");
  usePageTitle("Messages");

  useEffect(() => {
    if (threads.data && local.length === 0) setThreads(threads.data as Thread[]);
  }, [threads.data, local.length, setThreads]);

  const active = local.find((t) => t.id === activeId);
  const me = "You";

  const sendMessage = () => {
    if (!draft.trim() || !active) return;
    send(active.id, me, draft);
    const other = active.participants.find((p) => p.role !== "admin") ?? active.participants[1];
    setDraft("");
    const sim = api.messages.simulateReply(active.id, other?.name ?? "Kolachi Desk", [
      "Noted, I will action this today.",
      "Thanks for the update — sharing with the section now.",
      "Acknowledged. Please confirm once the marks are uploaded.",
      "Understood. I will follow up after the PTM.",
    ]);
    window.setTimeout(() => setTyping(active.id, true), sim.typingDelay);
    window.setTimeout(() => pushInbound(active.id, sim.reply), sim.replyDelay);
  };

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle="Realtime Socket.io messaging between administration, teachers, students and parents with seen status, typing indicators and attachments."
        breadcrumb={[{ label: "Communication" }, { label: "Messages" }]}
        actions={
          <Badge tone={connected ? "success" : "danger"} dot>
            {connected ? "Socket.io connected" : "Reconnecting…"}
          </Badge>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Conversations" subtitle={`${local.length} active threads`} />
          <ul className="max-h-[34rem] divide-y divide-slate-100 overflow-y-auto dark:divide-white/8">
            {local.map((t) => {
              const other = t.participants.find((p) => p.role !== "admin") ?? t.participants[0];
              const lastMessage = t.messages[t.messages.length - 1];
              return (
                <li key={t.id}>
                  <button onClick={() => { setActive(t.id); markSeen(t.id); }} className={cn("flex w-full items-start gap-3 px-4 py-3.5 text-left transition", activeId === t.id ? "bg-primary-50 dark:bg-primary-500/12" : "hover:bg-slate-50 dark:hover:bg-white/4")}>
                    <Avatar name={other.name} size={38} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[0.86rem] font-semibold text-slate-800 dark:text-slate-100">{other.name}</span>
                        <span className="shrink-0 text-[0.68rem] text-slate-400">{t.updatedAt}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[0.76rem] text-slate-500 dark:text-slate-400">{t.subject}</span>
                      <span className="mt-0.5 block truncate text-[0.74rem] text-slate-400">{lastMessage?.body}</span>
                    </span>
                    {t.unread > 0 && <span className="mt-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 font-numeric text-[0.62rem] font-bold text-white">{t.unread}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="flex h-[38rem] flex-col overflow-hidden">
          {active ? (
            <>
              <CardHeader
                title={active.participants.map((p) => p.name).join(" ↔ ")}
                subtitle={active.subject}
                action={
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={<Users className="h-3.5 w-3.5" />} onClick={() => toast.info("Participants", "Thread includes admin, teacher and guardian accounts.")}>Participants</Button>
                    <Button variant="outline" size="sm" icon={<FileText className="h-3.5 w-3.5" />} onClick={() => toast.success("Transcript emailed", "Conversation PDF exported to all participants.")}>Export</Button>
                  </div>
                }
              />

              <div className="flex-1 space-y-3.5 overflow-y-auto bg-slate-50/60 p-5 dark:bg-white/3">
                {active.messages.map((m) => {
                  const mine = m.from === me;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[78%] rounded-2xl px-4 py-3 text-[0.84rem] shadow-sm", mine ? "bg-primary-600 text-white" : "border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200")}>
                        {!mine && <p className="mb-1 text-[0.72rem] font-bold text-primary-600 dark:text-primary-300">{m.from}</p>}
                        <p className="leading-relaxed">{m.body}</p>
                        {m.attachment && (
                          <span className={cn("mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-[0.76rem]", mine ? "bg-white/15" : "bg-slate-100 dark:bg-white/8")}>
                            <FileText className="h-3.5 w-3.5" /> {m.attachment}
                          </span>
                        )}
                        <p className={cn("mt-1.5 flex items-center justify-end gap-1.5 text-[0.68rem]", mine ? "text-white/70" : "text-slate-400")}>
                          {m.at}
                          {mine && <CheckCircle2 className={cn("h-3 w-3", m.seen ? "text-white" : "text-white/50")} />}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                {active.typing && (
                  <div className="flex items-center gap-2 text-[0.78rem] text-slate-400">
                    <span className="flex gap-1 rounded-full bg-white px-3 py-2 dark:bg-slate-900/70">
                      <span className="typing-dot bg-slate-400" />
                      <span className="typing-dot bg-slate-400" />
                      <span className="typing-dot bg-slate-400" />
                    </span>
                    typing…
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 p-4 dark:border-white/8">
                <div className="flex items-end gap-2.5">
                  <Textarea
                    rows={1}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Write a message… (Enter to send, Shift+Enter for a new line)"
                    className="min-h-11 flex-1 resize-none"
                  />
                  <Button variant="outline" onClick={() => { send(active.id, me, "Shared a document", "performance-report.pdf"); toast.success("File shared", "Cloudinary signed upload completed."); }} icon={<Upload className="h-4 w-4" />}>{""}</Button>
                  <Button variant="primary" onClick={sendMessage} icon={<Send className="h-4 w-4" />}>Send</Button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {["👍 Acknowledged", "📅 PTM slot confirmed", "📊 Marks uploaded", "⚠️ Please review"].map((q) => (
                    <button key={q} onClick={() => setDraft(q)} className="rounded-full border border-slate-200 px-3 py-1.5 text-[0.72rem] text-slate-500 transition hover:border-primary-400 hover:text-primary-600 dark:border-white/10 dark:text-slate-400">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <EmptyState className="m-6" icon={<Mail className="h-7 w-7" />} title="Select a conversation" message="Pick a thread to view the full history, attachments and read receipts." />
          )}
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- AI insights */

export function AiInsightsPage() {
  const ai = useQuery({ queryKey: qk.ai, queryFn: () => api.ai.insights() });
  const risk = useQuery({ queryKey: qk.risk, queryFn: () => api.ai.riskCohort() });
  const [filter, setFilter] = useState("All");
  usePageTitle("AI Insights");

  const insights = (ai.data?.insights ?? []).filter((i) => filter === "All" || i.kind === filter);

  return (
    <div>
      <PageHeader
        title="AI Insight Engine"
        subtitle="Model smart-insight-v2 · attendance anomalies, dropout risk, fee forecasting, performance analysis and operational recommendations."
        breadcrumb={[{ label: "Overview" }, { label: "AI Insights" }]}
        actions={
          <>
            <Button variant="outline" icon={<Filter className="h-4 w-4" />} onClick={() => toast.info("Model settings", "Insight thresholds and confidence floor are configurable in Settings → AI.")}>Model settings</Button>
            <Button variant="primary" icon={<Sparkles className="h-4 w-4" />} onClick={() => { ai.refetch(); risk.refetch(); toast.success("Insights re-run", "Fresh analysis computed across 5,180 student records."); }}>Re-run analysis</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active insights" value={insights.length} icon={<Sparkles className="h-5 w-5" />} tone="analytics" />
        <StatCard label="At-risk students" value={(risk.data ?? []).length} icon={<AlertTriangle className="h-5 w-5" />} tone="danger" hint="Needs intervention" />
        <StatCard label="Avg. confidence" value={Number((((ai.data?.insights ?? []).reduce((a, i) => a + i.confidence, 0) / Math.max(1, ai.data?.insights.length ?? 1)) * 100).toFixed(1))} decimals={1} suffix="%" icon={<BadgeCheck className="h-5 w-5" />} tone="success" />
        <StatCard label="Interventions queued" value={12} icon={<Users className="h-5 w-5" />} tone="primary" hint="Mentor assignments" />
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", "Risk Detection", "Attendance Insight", "Fee Prediction", "Performance Analysis", "Recommendation", "Operational"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("pill-tab border border-slate-200 dark:border-white/10", filter === f && "pill-tab-active border-transparent")}>
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {ai.isLoading
          ? [0, 1, 2, 3].map((i) => <Card key={i} className="p-6"><div className="skeleton h-32 w-full" /></Card>)
          : insights.map((ins, i) => (
              <motion.div key={ins.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card hover className={cn("h-full p-6", ins.severity === "high" && "border-danger-500/40", ins.severity === "medium" && "border-secondary-400/40")}>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge tone={ins.severity === "high" ? "danger" : ins.severity === "medium" ? "warn" : "primary"} dot>
                      {ins.severity} priority
                    </Badge>
                    <Badge tone="analytics">{ins.kind}</Badge>
                    <span className="ml-auto text-[0.72rem] font-semibold text-slate-400">{Math.round(ins.confidence * 100)}% confidence</span>
                  </div>
                  <h3 className="mt-4 text-[1.05rem] font-bold text-slate-900 dark:text-white">{ins.title}</h3>
                  <p className="mt-2.5 text-[0.86rem] leading-relaxed text-slate-600 dark:text-slate-300">{ins.detail}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/8">
                    <Badge tone="success">Impact: {ins.impact}</Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toast.success("Action started", `${ins.action} queued for the responsible department.`)}>{ins.action}</Button>
                      <Button variant="ghost" size="sm" onClick={() => toast.info("Insight dismissed", "Feedback recorded to improve future model output.")}>Dismiss</Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader
          title="Risk cohort — recommended interventions"
          subtitle="Ranked by composite risk score from attendance, results and fee behaviour"
          action={<Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => { exportExcel((risk.data ?? []) as unknown as Record<string, unknown>[], [{ key: "name", label: "Student" }, { key: "risk", label: "Risk" }, { key: "recommendation", label: "Recommendation" }], "risk-cohort"); toast.success("Excel exported"); }}>Export cohort</Button>}
        />
        <div className="overflow-x-auto">
          <table className="table-saas">
            <thead><tr><th>Student</th><th>Class</th><th>Attendance</th><th>GPA</th><th>Outstanding</th><th>Risk drivers</th><th>Risk</th><th>Recommendation</th></tr></thead>
            <tbody>
              {risk.isLoading && Array.from({ length: 6 }).map((_, i) => <tr key={i}><td colSpan={8}><div className="skeleton h-5 w-full" /></td></tr>)}
              {(risk.data ?? []).slice(0, 14).map((s) => (
                <tr key={s.id}>
                  <td className="flex items-center gap-3">
                    <Avatar name={s.name} size={30} />
                    <Link to={`/students/${s.id}`} className="font-semibold text-slate-800 hover:text-primary-600 dark:text-slate-100">{s.name}</Link>
                  </td>
                  <td>{s.className}</td>
                  <td><Badge tone={s.attendance > 85 ? "success" : "danger"}>{s.attendance}%</Badge></td>
                  <td className="font-numeric">{s.gpa}</td>
                  <td className="font-numeric text-danger-500">{s.outstanding ? `Rs ${s.outstanding.toLocaleString("en-US")}` : "—"}</td>
                  <td className="text-[0.78rem] text-slate-500 dark:text-slate-400">{s.drivers.join(" · ") || "Behavioural signals"}</td>
                  <td className="w-32"><ProgressBar value={s.risk} tone={s.risk > 75 ? "danger" : "warn"} showLabel /></td>
                  <td className="max-w-[16rem] text-[0.78rem] text-slate-600 dark:text-slate-300">{s.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ----------------------------------------------------------- Audit log */

export function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("All");
  usePageTitle("Audit Log");
  const rows = activities.filter((a) => (kind === "All" || a.kind === kind) && (a.actor + a.action + a.target).toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Immutable, append-only record of every sensitive action with actor, IP, tenant and before/after values."
        breadcrumb={[{ label: "Operations" }, { label: "Audit Log" }]}
        actions={
          <>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search actor, action or record…" className="w-64" />
            <Select value={kind} onChange={(e) => setKind(e.target.value)} className="w-40">
              {["All", "student", "fee", "exam", "staff", "system", "message"].map((k) => <option key={k} value={k}>{k}</option>)}
            </Select>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportCSV(rows as unknown as Record<string, unknown>[], [{ key: "actor", label: "Actor" }, { key: "action", label: "Action" }, { key: "target", label: "Target" }, { key: "at", label: "When" }], "audit-log"); toast.success("Audit export ready"); }}>Export</Button>
          </>
        }
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-saas">
            <thead><tr><th>Actor</th><th>Action</th><th>Record</th><th>Module</th><th>IP</th><th>When</th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className="flex items-center gap-3">
                    <Avatar name={a.actor} size={28} />
                    <span className="font-semibold">{a.actor}</span>
                  </td>
                  <td>{a.action}</td>
                  <td className="text-slate-500 dark:text-slate-400">{a.target}</td>
                  <td><Badge tone={a.kind === "fee" ? "success" : a.kind === "exam" ? "analytics" : a.kind === "system" ? "warn" : "primary"}>{a.kind}</Badge></td>
                  <td className="font-numeric text-slate-400">10.0.{Math.abs(a.id.charCodeAt(2) % 12)}.{Math.abs(a.id.charCodeAt(3) % 255)}</td>
                  <td className="text-slate-400">{a.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------- Event manager */

export function EventsAdmin() {
  const events = useQuery({ queryKey: qk.events, queryFn: () => api.events.list() });
  const [tab, setTab] = useState<"upcoming" | "past" | "board">("upcoming");
  usePageTitle("Event Management");
  const list = (events.data ?? schoolEvents).filter((e) => (tab === "upcoming" ? e.status === "Upcoming" : tab === "past" ? e.status === "Completed" : true));

  return (
    <div>
      <PageHeader
        title="Event Management"
        subtitle="Sports days, parent meetings, science fairs, excursions and school functions with budgets, registration and galleries."
        breadcrumb={[{ label: "Operations" }, { label: "Events" }]}
        actions={
          <>
            <Button variant="outline" icon={<Download className="h-4 w-4" />} onClick={() => { exportExcel((events.data ?? schoolEvents) as unknown as Record<string, unknown>[], [{ key: "title", label: "Event" }, { key: "date", label: "Date" }, { key: "registered", label: "Registered" }], "events"); toast.success("Excel exported"); }}>Export</Button>
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => toast.info("Create event", "Event wizard covers budget, venue, registration and notifications.")}>New event</Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Upcoming events" value={(events.data ?? schoolEvents).filter((e) => e.status === "Upcoming").length} icon={<CalendarDays className="h-5 w-5" />} tone="primary" />
        <StatCard label="Total registrations" value={(events.data ?? schoolEvents).reduce((a, e) => a + e.registered, 0)} icon={<Users className="h-5 w-5" />} tone="analytics" delta={18.4} />
        <StatCard label="Events budget" value={Number(((events.data ?? schoolEvents).reduce((a, e) => a + e.budget, 0) / 1_000_000).toFixed(1))} decimals={1} prefix="Rs " suffix="M" icon={<Wallet className="h-5 w-5" />} tone="warn" />
        <StatCard label="Completed this year" value={(events.data ?? schoolEvents).filter((e) => e.status === "Completed").length} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
      </div>

      <Tabs
        tabs={[
          { id: "upcoming", label: "Upcoming", badge: (events.data ?? schoolEvents).filter((e) => e.status === "Upcoming").length },
          { id: "past", label: "Completed" },
          { id: "board", label: "Planning board" },
        ]}
        value={tab}
        onChange={setTab}
        className="mb-6"
      />

      {tab !== "board" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {list.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
              <Card hover className="h-full p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge tone={e.category === "Sports" ? "success" : e.category === "Academic" ? "primary" : e.category === "Meeting" ? "analytics" : "warn"}>{e.category}</Badge>
                  <Badge tone={statusTone(e.status)}>{e.status}</Badge>
                  <span className="ml-auto flex items-center gap-1.5 text-[0.76rem] text-slate-500 dark:text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" /> {e.date}
                  </span>
                </div>
                <h3 className="mt-3.5 text-[1.02rem] font-bold">{e.title}</h3>
                <p className="mt-2 text-[0.83rem] leading-relaxed text-slate-600 dark:text-slate-300">{e.description}</p>
                <div className="mt-4 flex items-center gap-2 text-[0.76rem] text-slate-500 dark:text-slate-400">
                  <Building2 className="h-3.5 w-3.5" /> {e.venue} · {e.organiser}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[0.78rem] text-slate-500 dark:text-slate-400">
                    <span>Registered {e.registered} / {e.expected}</span>
                    <span className="font-numeric font-bold">{Math.round((e.registered / e.expected) * 100)}%</span>
                  </div>
                  <ProgressBar value={Math.round((e.registered / e.expected) * 100)} tone="primary" className="mt-1.5" />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/8">
                  <span className="text-[0.78rem] text-slate-500 dark:text-slate-400">Budget Rs {e.budget.toLocaleString("en-US")}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.success("Registration opened", `Portal link shared with ${e.expected} guardians.`)}>Open registration</Button>
                    <Button variant="ghost" size="sm" onClick={async () => { const res = await api.events.register(e.id, 4); toast.success("Seats reserved", `${res.seats} seats booked · confirmation emailed.`); }}>Book seats</Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="p-5">
          <CardHeader title="Event planning board" subtitle="Drag events between stages to track readiness" className="mb-5" />
          <div className="grid gap-4 lg:grid-cols-4">
            {[
              { stage: "Planning", items: ["Annual Prize Distribution", "Career Counselling Day"] },
              { stage: "Approved", items: ["Science & Robotics Fair", "Quiz Championship"] },
              { stage: "Marketing", items: ["Annual Sports Day", "PTM (Term 2)"] },
              { stage: "Execution", items: ["Grade 9 Field Trip", "Night Cricket Gala"] },
            ].map((col) => (
              <div key={col.stage} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-white/10 dark:bg-white/3">
                <p className="mb-3 flex items-center justify-between text-[0.8rem] font-bold">
                  {col.stage}
                  <span className="font-numeric text-slate-400">{col.items.length}</span>
                </p>
                <ul className="space-y-2.5">
                  {col.items.map((it) => (
                    <li key={it} className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[0.82rem] font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
