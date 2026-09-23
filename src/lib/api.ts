/* ------------------------------------------------------------------
   API layer — mirrors the Express REST contract used by the real
   deployment (routes, guards, pagination, validation, exports).
   In the static build these resolvers run against the seeded store so
   every screen is fully functional end-to-end.
-------------------------------------------------------------------*/

import * as db from "@/lib/db";
import type { AttendanceDay, FeeInvoice, Mark, Role, Student, Teacher, User } from "@/lib/db";

/* ------------------------------------------------------------- config */

export const API_BASE = "/api/v1";
export const SOCKET_URL = "wss://realtime.smartschool.erp";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/* --------------------------------------------------------- JWT (demo) */

type TokenPayload = { sub: string; role: Role; email: string; iat: number; exp: number };

const b64 = {
  encode: (v: string) => btoa(unescape(encodeURIComponent(v))),
  decode: (v: string) => decodeURIComponent(escape(atob(v))),
};

export const jwt = {
  sign(user: Pick<User, "id" | "role" | "email">, hours = 12): { token: string; refreshToken: string; expiresIn: number } {
    const now = Date.now();
    const header = b64.encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload: TokenPayload = { sub: user.id, role: user.role, email: user.email, iat: Math.floor(now / 1000), exp: Math.floor(now / 1000) + hours * 3600 };
    const body = b64.encode(JSON.stringify(payload));
    const signature = b64.encode(`smartschool-demo-signature-${user.id}`).slice(0, 32);
    return { token: `${header}.${body}.${signature}`, refreshToken: `rt_${user.id}_${now}`, expiresIn: hours * 3600 };
  },
  verify(token: string): TokenPayload | null {
    try {
      const [, body] = token.split(".");
      const payload = JSON.parse(b64.decode(body)) as TokenPayload;
      if (payload.exp * 1000 < Date.now()) return null;
      return payload;
    } catch {
      return null;
    }
  },
};

/* ----------------------------------------------------------------- RBAC */

export type Permission =
  | "students:read" | "students:write" | "students:delete"
  | "teachers:read" | "teachers:write"
  | "attendance:read" | "attendance:write"
  | "exams:read" | "exams:write" | "results:publish"
  | "fees:read" | "fees:write"
  | "library:read" | "library:write"
  | "transport:read" | "hostel:read"
  | "events:read" | "events:write"
  | "notices:read" | "notices:write"
  | "messages:read" | "messages:write"
  | "reports:read" | "ai:read" | "settings:write" | "users:manage" | "audit:read";

export const ROLE_MATRIX: Record<Role, { label: string; description: string; permissions: Permission[] | "*" }> = {
  super_admin: { label: "Super Admin", description: "Full platform ownership, tenant configuration and audit access.", permissions: "*" },
  admin: {
    label: "Admin",
    description: "Day-to-day school administration across academics, finance and operations.",
    permissions: [
      "students:read", "students:write", "students:delete", "teachers:read", "teachers:write", "attendance:read", "attendance:write",
      "exams:read", "exams:write", "results:publish", "fees:read", "fees:write", "library:read", "library:write", "transport:read",
      "hostel:read", "events:read", "events:write", "notices:read", "notices:write", "messages:read", "messages:write", "reports:read", "ai:read",
    ],
  },
  teacher: { label: "Teacher", description: "Classroom delivery: attendance, marks entry, assignments and student progress.", permissions: ["students:read", "teachers:read", "attendance:read", "attendance:write", "exams:read", "exams:write", "notices:read", "messages:read", "messages:write", "reports:read", "library:read", "ai:read"] },
  student: { label: "Student", description: "Personal academic record: results, attendance, assignments and timetable.", permissions: ["attendance:read", "exams:read", "notices:read", "messages:read", "messages:write", "library:read"] },
  parent: { label: "Parent / Guardian", description: "Child monitoring, fee history, report cards and teacher communication.", permissions: ["attendance:read", "exams:read", "fees:read", "notices:read", "messages:read", "messages:write"] },
  accountant: { label: "Accountant", description: "Fee challans, collections, payroll inputs, revenue and ageing reports.", permissions: ["students:read", "fees:read", "fees:write", "reports:read", "notices:read", "messages:read", "messages:write", "ai:read"] },
  librarian: { label: "Librarian", description: "Catalogue, circulation, fines and library analytics.", permissions: ["library:read", "library:write", "students:read", "reports:read", "notices:read", "messages:read"] },
};

export const can = (role: Role, permission: Permission) => {
  const entry = ROLE_MATRIX[role];
  return entry.permissions === "*" || entry.permissions.includes(permission);
};

/* --------------------------------------------------------------- auth */

const userIndexKey = "smartschool.users.v1";
const getExtraUsers = (): User[] => {
  try {
    return JSON.parse(localStorage.getItem(userIndexKey) ?? "[]") as User[];
  } catch {
    return [];
  }
};
export const allUsers = () => [...db.demoUsers, ...getExtraUsers()];

export const auth = {
  async login(email: string, password: string, remember = false) {
    await delay(680);
    const user = allUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) throw new ApiError(404, "No account found with that email address.");
    if (user.password !== password) throw new ApiError(401, "Incorrect password. Please try again.");
    if (user.status === "suspended") throw new ApiError(403, "This account is suspended. Contact the administrator.");
    const tokens = jwt.sign(user, remember ? 24 * 7 : 12);
    return { user, ...tokens, sessionScoped: !remember };
  },
  async oauth(provider: "google" | "microsoft", role: Role) {
    await delay(900);
    const user = allUsers().find((u) => u.role === role) ?? db.demoUsers[1];
    const tokens = jwt.sign(user, 12);
    return { user, ...tokens, provider, sessionScoped: true };
  },
  async register(payload: { name: string; email: string; password: string; role: Role; phone: string }) {
    await delay(820);
    if (allUsers().some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) throw new ApiError(409, "An account with this email already exists.");
    const user: User = {
      id: `u-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      avatarSeed: payload.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
      phone: payload.phone,
      status: "active",
      lastLogin: "just now",
      language: "en",
      emailVerified: false,
    };
    const stored = getExtraUsers();
    stored.push(user);
    localStorage.setItem(userIndexKey, JSON.stringify(stored));
    const tokens = jwt.sign(user, 12);
    return { user, ...tokens, verificationToken: `verify_${user.id}` };
  },
  async requestReset(email: string) {
    await delay(700);
    const user = allUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new ApiError(404, "We could not find that email in our records.");
    return { sent: true, email: user.email, token: `reset_${Date.now()}`, expiresIn: 900 };
  },
  async resetPassword(token: string, password: string) {
    await delay(760);
    if (!token) throw new ApiError(400, "Reset token is missing or expired.");
    return { updated: true, passwordStrength: strengthOf(password) };
  },
  async verifyEmail(token: string) {
    await delay(600);
    if (!token) throw new ApiError(400, "Invalid verification link.");
    return { verified: true };
  },
};

export function strengthOf(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

/* --------------------------------------------------- query utilities */

export type QueryParams = {
  search?: string;
  filters?: Record<string, string>;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type Paged<T> = { rows: T[]; total: number; page: number; pageSize: number; pages: number };

export function query<T extends Record<string, unknown>>(rows: T[], { search, filters, sortBy, sortDir = "asc", page = 1, pageSize = 10 }: QueryParams, searchKeys: (keyof T)[]): Paged<T> {
  let out = [...rows];
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    out = out.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
  }
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (!value || value === "All" || value === "all") return;
      out = out.filter((r) => String(r[key as keyof T] ?? "") === value);
    });
  }
  if (sortBy) {
    out.sort((a, b) => {
      const av = a[sortBy as keyof T];
      const bv = b[sortBy as keyof T];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }
  const total = out.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), pages);
  return { rows: out.slice((safePage - 1) * pageSize, safePage * pageSize), total, page: safePage, pageSize, pages };
}

/* --------------------------------------------------------- endpoints */

export const api = {
  metrics: {
    async dashboard() {
      await delay(420);
      return { kpis: db.kpiSnapshot, activities: db.activities, events: db.schoolEvents.filter((e) => e.status === "Upcoming").slice(0, 5), system: db.systemStatus };
    },
    async attendance(days = 90): Promise<AttendanceDay[]> {
      await delay(320);
      return db.attendanceSeries.slice(-days);
    },
    async revenue() {
      await delay(300);
      return db.revenueSeries;
    },
    async growth() {
      await delay(300);
      return db.studentGrowth;
    },
    async subjects() {
      await delay(280);
      return db.subjectPerformance;
    },
    async examStats() {
      await delay(280);
      return db.examStats;
    },
    async teacherPerformance() {
      await delay(300);
      return db.teachers.slice(0, 10).map((t) => ({ name: t.name.split(" ")[0], rating: t.rating, attendance: t.attendanceRate, students: t.students, department: t.department, id: t.id }));
    },
  },

  students: {
    async list(params: QueryParams) {
      await delay(340);
      const rows = db.students.map((s) => ({ ...s, className: `${s.className}-${s.section}` }));
      return query(rows as unknown as Record<string, unknown>[], params, ["name", "rollNo", "guardian", "className", "guardianPhone"]) as unknown as Paged<Student>;
    },
    async get(id: string) {
      await delay(240);
      const found = db.students.find((s) => s.id === id);
      if (!found) throw new ApiError(404, "Student record not found.");
      const marks = db.marks.filter((m) => m.studentId === id);
      return {
        student: found,
        marks,
        invoices: db.invoices.filter((i) => i.studentId === id).slice(0, 12),
        attendance: db.attendanceSeries.slice(-30).map((d) => ({ date: d.date, status: d.rate > 92 ? "Present" : d.rate > 86 ? "Late" : "Absent" })),
        assignments: db.assignments.filter((a) => a.className.includes(found.className)).slice(0, 6),
        timetable: db.timetableSlots.map((slot, i) => ({
          slot,
          Monday: db.SUBJECTS[i % 8],
          Tuesday: db.SUBJECTS[(i + 2) % 8],
          Wednesday: db.SUBJECTS[(i + 4) % 8],
          Thursday: db.SUBJECTS[(i + 6) % 8],
          Friday: db.SUBJECTS[(i + 1) % 8],
          Saturday: i % 2 === 0 ? "Remedial Class" : "Sports / Clubs",
        })),
      };
    },
    async create(payload: Partial<Student>) {
      await delay(720);
      const id = `S-${1000 + db.students.length + getExtraUsers().length + 1}`;
      return { ...payload, id, rollNo: payload.rollNo ?? id.replace("S-", "") } as Student;
    },
    async update(id: string, payload: Partial<Student>) {
      await delay(620);
      const found = db.students.find((s) => s.id === id);
      if (!found) throw new ApiError(404, "Student record not found.");
      return { ...found, ...payload };
    },
    async remove(id: string) {
      await delay(520);
      const found = db.students.find((s) => s.id === id);
      if (!found) throw new ApiError(404, "Student record not found.");
      return { deleted: true, id };
    },
    async bulkImport(count: number) {
      await delay(1200);
      return { imported: count, skipped: 0, duplicates: count > 40 ? 2 : 0 };
    },
  },

  teachers: {
    async list(params: QueryParams) {
      await delay(320);
      return query(db.teachers as unknown as Record<string, unknown>[], params, ["name", "employeeId", "department", "designation", "email"]) as unknown as Paged<Teacher>;
    },
    async get(id: string) {
      await delay(240);
      const found = db.teachers.find((t) => t.id === id);
      if (!found) throw new ApiError(404, "Staff record not found.");
      return {
        teacher: found,
        payroll: db.payroll.filter((p) => p.teacherId === id),
        leaves: db.leaveRequests.filter((l) => l.staff === found.name),
        classes: db.classRooms.filter((c) => c.classTeacher === found.name),
      };
    },
    async payroll() {
      await delay(300);
      return db.payroll;
    },
    async leaves() {
      await delay(280);
      return db.leaveRequests;
    },
  },

  attendance: {
    async today() {
      await delay(300);
      return db.todayAttendance;
    },
    async mark(entries: { studentId: string; status: string }[], date: string) {
      await delay(760);
      return { saved: entries.length, date, anomalies: entries.filter((e) => e.status === "Absent").length };
    },
    async qrScan(code: string) {
      await delay(520);
      const student = db.students.find((s) => s.id.toLowerCase().includes(code.toLowerCase().slice(-4))) ?? db.students[0];
      return { valid: true, student, at: `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}`, gate: "Main Gate — Turnstile 2" };
    },
    async heatmap() {
      await delay(420);
      const weeks = 12;
      return db.range(weeks * 7).map((i) => ({ day: i, rate: db.attendanceSeries.slice(-84)[i]?.rate ?? 0, date: db.attendanceSeries.slice(-84)[i]?.date ?? "" }));
    },
  },

  exams: {
    async list() {
      await delay(300);
      return db.exams;
    },
    async get(id: string) {
      await delay(280);
      const exam = db.exams.find((e) => e.id === id);
      if (!exam) throw new ApiError(404, "Exam not found.");
      const rows = db.marks.filter((m) => m.examId === id);
      const bySubject = db.SUBJECTS.slice(0, 6).map((s) => {
        const subjectRows = rows.filter((r) => r.subject === s);
        const avg = subjectRows.length ? subjectRows.reduce((a, r) => a + r.obtained, 0) / subjectRows.length : 0;
        return { subject: s, average: Number(avg.toFixed(1)), highest: Math.max(...subjectRows.map((r) => r.obtained), 0), lowest: Math.min(...subjectRows.map((r) => r.obtained), 100), passRate: subjectRows.length ? Number(((subjectRows.filter((r) => r.obtained >= 40).length / subjectRows.length) * 100).toFixed(1)) : 0 };
      });
      const top = rows
        .reduce<Record<string, Mark[]>>((acc, m) => {
          acc[m.studentId] = [...(acc[m.studentId] ?? []), m];
          return acc;
        }, {});
      const positions = Object.entries(top)
        .map(([sid, list]) => ({ studentId: sid, name: list[0].studentName, className: list[0].className, total: list.reduce((a, m) => a + m.obtained, 0), avg: Number((list.reduce((a, m) => a + m.obtained, 0) / list.length).toFixed(1)) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 12)
        .map((r, i) => ({ ...r, position: i + 1, grade: r.avg >= 90 ? "A+" : r.avg >= 80 ? "A" : r.avg >= 70 ? "B" : r.avg >= 60 ? "C" : "D" }));
      return { exam, papers: db.examPapers.filter((p) => p.examId === id), bySubject, positions };
    },
    async create(payload: Partial<db.Exam>) {
      await delay(740);
      return { ...payload, id: `EX-${db.exams.length + 1}`, resultsPublished: false };
    },
    async saveMarks(rows: { studentId: string; subject: string; obtained: number }[]) {
      await delay(880);
      return { saved: rows.length, autoGraded: rows.length, positionsRecalculated: true };
    },
    async publish(id: string) {
      await delay(900);
      return { published: true, id, notify: 480, publishedAt: new Date().toISOString() };
    },
  },

  results: {
    async reportCard(studentId: string, examId: string) {
      await delay(420);
      const student = db.students.find((s) => s.id === studentId);
      const exam = db.exams.find((e) => e.id === examId);
      if (!student || !exam) throw new ApiError(404, "Report card data unavailable.");
      const rows = db.marks.filter((m) => m.examId === examId && m.studentId === studentId);
      const total = rows.reduce((a, r) => a + r.obtained, 0);
      const max = rows.reduce((a, r) => a + r.total, 0) || 1;
      const percentage = Number(((total / max) * 100).toFixed(1));
      const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : percentage >= 50 ? "D" : percentage >= 40 ? "E" : "F";
      return { student, exam, rows, total, max, percentage, grade };
    },
    async subjectAnalysis(examId: string) {
      await delay(380);
      const rows = db.marks.filter((m) => m.examId === examId);
      return db.SUBJECTS.slice(0, 6).map((s) => {
        const list = rows.filter((r) => r.subject === s).map((r) => r.obtained);
        const avg = list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0;
        return { subject: s, students: list.length, average: Number(avg.toFixed(1)), distinction: list.filter((v) => v >= 85).length, failed: list.filter((v) => v < 40).length };
      });
    },
  },

  assignments: {
    async list(params: QueryParams) {
      await delay(320);
      return query(db.assignments as unknown as Record<string, unknown>[], params, ["title", "subject", "className", "teacher", "type"]) as unknown as Paged<db.Assignment>;
    },
    async create(payload: Partial<db.Assignment>) {
      await delay(760);
      return { ...payload, id: `AS-${db.assignments.length + 101}`, submissions: 0 };
    },
    async submissions(id: string) {
      await delay(360);
      const a = db.assignments.find((x) => x.id === id) ?? db.assignments[0];
      return db.students.slice(0, a.totalStudents).map((s, i) => ({
        studentId: s.id,
        name: s.name,
        rollNo: s.rollNo,
        status: i < a.submissions ? "Submitted" : "Pending",
        submittedAt: i < a.submissions ? db.relativeTime(db.between(60, 3000)) : "—",
        marks: i < a.submissions ? db.between(6, a.totalMarks) : null,
        feedback: i < a.submissions ? db.pick(["Well structured answer.", "Good attempt, revise formatting.", "Excellent research depth.", "Missing citations."]) : null,
        attachment: i % 4 === 0 ? "submission.pdf" : "answer-sheet.jpg",
      }));
    },
  },

  fees: {
    async invoices(params: QueryParams) {
      await delay(340);
      return query(db.invoices as unknown as Record<string, unknown>[], params, ["challanNo", "studentName", "className", "month", "status"]) as unknown as Paged<FeeInvoice>;
    },
    async get(id: string) {
      await delay(260);
      const inv = db.invoices.find((i) => i.id === id);
      if (!inv) throw new ApiError(404, "Invoice not found.");
      const student = db.students.find((s) => s.id === inv.studentId)!;
      return { invoice: inv, student };
    },
    async generate(payload: { month: string; classes: string[]; heads: { label: string; amount: number }[] }) {
      await delay(1100);
      const count = payload.classes.length * 32;
      return { generated: count, month: payload.month, amount: count * payload.heads.reduce((a, h) => a + h.amount, 0) };
    },
    async pay(id: string, amount: number, method: string) {
      await delay(820);
      return { receipt: `RCP-${Date.now().toString().slice(-6)}`, id, amount, method, paidAt: new Date().toISOString() };
    },
    async ageing() {
      await delay(300);
      const buckets = ["0-15 days", "16-30 days", "31-60 days", "60+ days"];
      return buckets.map((b, i) => ({
        bucket: b,
        invoices: db.invoices.filter((_, idx) => idx % 4 === i && db.invoices[idx].status !== "Paid").length,
        amount: db.invoices.filter((_, idx) => idx % 4 === i).reduce((a, inv) => a + (inv.amount - inv.paid), 0),
      }));
    },
  },

  notices: {
    async list() {
      await delay(300);
      return db.notices;
    },
    async create(payload: Partial<db.Notice>) {
      await delay(700);
      return { ...payload, id: `NT-${db.notices.length + 1}`, postedAt: "just now", views: 0 };
    },
  },

  messages: {
    async threads() {
      await delay(320);
      return db.threads;
    },
    async send(threadId: string, body: string, attachment?: string) {
      await delay(320);
      return { id: `m${Date.now()}`, threadId, body, attachment, at: "just now", seen: false };
    },
    /** Simulated Socket.io inbound event (typing → reply → seen). */
    simulateReply(threadId: string, name: string, suggestions: string[]) {
      return {
        threadId,
        typingDelay: 900,
        replyDelay: 2600,
        reply: { id: `m${Date.now()}`, from: name, body: db.pick(suggestions), at: "just now", seen: false },
      };
    },
  },

  library: {
    async books(params: QueryParams) {
      await delay(320);
      return query(db.books as unknown as Record<string, unknown>[], params, ["title", "author", "category", "isbn", "shelf"]) as unknown as Paged<db.Book>;
    },
    async issues(params: QueryParams) {
      await delay(300);
      return query(db.bookIssues as unknown as Record<string, unknown>[], params, ["bookTitle", "member", "status"]) as unknown as Paged<db.BookIssue>;
    },
    async issueBook(bookId: string, member: string) {
      await delay(640);
      return { issued: true, dueDate: db.dayOffset(14), bookId, member, fine: 0 };
    },
    async returnBook(issueId: string) {
      await delay(600);
      const issue = db.bookIssues.find((i) => i.id === issueId);
      return { returned: true, issueId, fine: issue?.fine ?? 0 };
    },
  },

  transport: {
    async routes() {
      await delay(300);
      return db.transportRoutes;
    },
    async assign(studentId: string, routeId: string) {
      await delay(600);
      return { assigned: true, studentId, routeId, stop: "Main Gate" };
    },
  },

  hostel: {
    async rooms(params: QueryParams) {
      await delay(320);
      return query(db.hostelRooms as unknown as Record<string, unknown>[], params, ["block", "room", "type", "warden", "status"]) as unknown as Paged<db.HostelRoom>;
    },
    async allocate(roomId: string, studentId: string) {
      await delay(620);
      return { allocated: true, roomId, studentId, bed: 1 };
    },
  },

  events: {
    async list() {
      await delay(300);
      return db.schoolEvents;
    },
    async register(eventId: string, count: number) {
      await delay(640);
      return { registered: true, eventId, seats: count };
    },
  },

  reports: {
    async build(type: string, range: { from: string; to: string }) {
      await delay(900);
      return { type, range, rows: db.between(120, 2400), pages: db.between(4, 42), generatedAt: new Date().toISOString() };
    },
    async attendanceReport() {
      await delay(420);
      return db.attendanceSeries.slice(-30).map((d) => ({ ...d, boys: Math.round(d.present * 0.52), girls: Math.round(d.present * 0.48), staffPresent: db.between(38, 46) }));
    },
  },

  ai: {
    async insights() {
      await delay(1100);
      return {
        generatedAt: new Date().toISOString(),
        model: "smart-insight-v2",
        insights: [
          { id: "ai-1", kind: "Risk Detection", severity: "high", title: "17 students at dropout risk in Grade 9-10", detail: "Combined signals: attendance below 76% for 3 consecutive weeks, two or more failing subjects, and unpaid fees beyond 30 days.", action: "Open risk cohort", confidence: 0.91, impact: "Retention +2.4%" },
          { id: "ai-2", kind: "Attendance Insight", severity: "medium", title: "Monday first-period absenteeism up 12%", detail: "Late arrivals cluster between 8:00–8:20 AM, concentrated in students using Transport Route R-4 and R-7.", action: "Review route timings", confidence: 0.86, impact: "Attendance +1.8%" },
          { id: "ai-3", kind: "Fee Prediction", severity: "medium", title: "February collection forecast: 92.7%", detail: "Projection based on 14 months of payment behaviour, guardian income cycles and current outstanding ageing buckets.", action: "Preview forecast", confidence: 0.88, impact: "Cash flow" },
          { id: "ai-4", kind: "Performance Analysis", severity: "low", title: "Physics scores improving after lab intervention", detail: "Grade 10 Physics average moved from 61.4% to 71.2% following the new weekly practical sessions. Mathematics shows the mirror decline.", action: "Apply to Mathematics", confidence: 0.83, impact: "Scores +6%" },
          { id: "ai-5", kind: "Recommendation", severity: "low", title: "Rebalance two sections with uneven strength", detail: "Grade 8-A average is 9.4 points higher than 8-B; transferring 6 mid-band students would balance both cohorts.", action: "Simulate rebalance", confidence: 0.79, impact: "Equity" },
          { id: "ai-6", kind: "Operational", severity: "medium", title: "Library overdue concentration", detail: "68% of fines originate from 12% of members. A 3-day grace-period SMS nudge historically recovers 74% of books.", action: "Send reminders", confidence: 0.9, impact: "₹ recovery" },
        ],
      };
    },
    async riskCohort() {
      await delay(700);
      return db.students
        .filter((s) => s.riskScore > 55)
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 24)
        .map((s) => ({
          id: s.id,
          name: s.name,
          className: `${s.className}-${s.section}`,
          attendance: s.attendanceRate,
          gpa: s.gpa,
          outstanding: s.outstanding,
          risk: s.riskScore,
          drivers: [
            ...(s.attendanceRate < 80 ? ["Low attendance"] : []),
            ...(s.gpa < 2.8 ? ["Failing subjects"] : []),
            ...(s.outstanding > 10000 ? ["Fee default"] : []),
          ],
          recommendation: s.gpa < 2.8 ? "Assign mentor + weekly remedial" : s.outstanding > 10000 ? "Guardian counselling + instalment plan" : "Attendance contract with SMS alerts",
        }));
    },
  },

  settings: {
    async get() {
      await delay(280);
      return {
        school: { name: "Beaconhouse Smart Campus", code: "BSC-KHI-01", email: "info@smartschool.pk", phone: "+92 21 3456 7890", address: "Plot 45, Block 6, PECHS, Karachi", principal: "Dr. Shahid Mahmood", affiliation: "Federal Board of Intermediate & Secondary Education", session: "2025 – 2026" },
        academic: { termSystem: "Trimester", passingMarks: 40, gradeScale: "A+ to F (10 point)", maxMarksPerSubject: 100, weightExam: 60, weightAssignment: 25, weightAttendance: 15, workingDays: "Mon – Sat", periodsPerDay: 8 },
        security: { twoFactor: true, sessionTimeout: 30, passwordPolicy: "Strong (10+ chars, mixed case, symbol)", loginAttempts: 5, ipAllowlist: false, auditRetention: 24 },
        notifications: { emailAlerts: true, smsAlerts: true, pushAlerts: true, feeReminders: true, examAlerts: true, dailyDigest: "07:30 AM", escalation: "Principal after 3 missed fee cycles" },
        email: { provider: "SMTP Relay (Amazon SES)", fromName: "SmartSchool ERP", fromEmail: "no-reply@smartschool.pk", replyTo: "info@smartschool.pk", dailyLimit: 20000, bounceRate: 0.4 },
        backup: { frequency: "Every 6 hours", retention: "90 days", destination: "MongoDB Atlas + S3 cold storage", lastBackup: db.relativeTime(180), size: "12.6 GB", encryption: "AES-256" },
        system: { environment: "Production", version: "v4.2.0", region: "ap-south-1", tenant: "BCS-KHI-01", maxStudents: 6000, storageUsed: 68 },
      };
    },
  },
};

/* --------------------------------------------------------- exports */

export function toCSV(rows: Record<string, unknown>[], columns: { key: string; label: string }[]) {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows.map((r) => columns.map((c) => `"${String(r[c.key] ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  return `${header}\n${body}`;
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCSV(rows: Record<string, unknown>[], columns: { key: string; label: string }[], name: string) {
  triggerDownload(toCSV(rows, columns), `${name}-${db.dayOffset(0)}.csv`, "text/csv;charset=utf-8;");
}

/** Excel-compatible workbook (SpreadsheetML table markup). */
export function exportExcel(rows: Record<string, unknown>[], columns: { key: string; label: string }[], name: string) {
  const head = columns.map((c) => `<th style="background:#0F5FFF;color:#fff;padding:6px">${c.label}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${columns.map((c) => `<td style="padding:5px;border:1px solid #e2e8f0">${String(r[c.key] ?? "")}</td>`).join("")}</tr>`)
    .join("");
  const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  triggerDownload(html, `${name}-${db.dayOffset(0)}.xls`, "application/vnd.ms-excel");
}

/** Print-to-PDF: exposes a print area, hands control to the OS PDF engine. */
export function exportPDF(title: string) {
  document.body.setAttribute("data-print-title", title);
  window.setTimeout(() => window.print(), 120);
}

export const exportColumnsOf = (obj: Record<string, unknown>) =>
  Object.keys(obj)
    .filter((k) => !["id", "heads", "documents", "achievements", "participants", "messages", "stops", "subjects", "classes"].includes(k))
    .slice(0, 10)
    .map((k) => ({ key: k, label: k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()) }));
