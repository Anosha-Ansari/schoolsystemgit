/* ------------------------------------------------------------------
   SmartSchool ERP — in-browser database seed
   Deterministic (seeded PRNG) so analytics are stable between renders.
   Mirrors the MongoDB collections used by the Express API layer.
-------------------------------------------------------------------*/

export type Role = "super_admin" | "admin" | "teacher" | "student" | "parent" | "accountant" | "librarian";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatarSeed: string;
  phone: string;
  linkedId?: string;
  status: "active" | "suspended";
  lastLogin: string;
  language: "en" | "ur";
  emailVerified: boolean;
};

export type Student = {
  id: string;
  rollNo: string;
  name: string;
  gender: "Male" | "Female";
  dob: string;
  className: string;
  section: string;
  guardian: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  admissionDate: string;
  status: "active" | "inactive" | "graduated";
  bloodGroup: string;
  cnic: string;
  house: "Blue" | "Green" | "Red" | "Yellow";
  transport: string | null;
  hostel: string | null;
  attendanceRate: number;
  gpa: number;
  feeStatus: "Paid" | "Partial" | "Overdue";
  outstanding: number;
  riskScore: number;
  documents: { name: string; type: string; size: string; uploaded: string; verified: boolean }[];
  achievements: string[];
};

export type Teacher = {
  id: string;
  employeeId: string;
  name: string;
  gender: "Male" | "Female";
  designation: string;
  department: string;
  subjects: string[];
  classes: string[];
  qualification: string;
  joiningDate: string;
  email: string;
  phone: string;
  cnic: string;
  salary: number;
  status: "active" | "on_leave" | "resigned";
  experience: number;
  attendanceRate: number;
  rating: number;
  students: number;
};

export type ClassRoom = {
  id: string;
  name: string;
  grade: number;
  section: string;
  room: string;
  classTeacher: string;
  students: number;
  capacity: number;
  subjects: string[];
  avgScore: number;
  attendance: number;
};

export type FeeInvoice = {
  id: string;
  challanNo: string;
  studentId: string;
  studentName: string;
  className: string;
  month: string;
  issuedOn: string;
  dueDate: string;
  amount: number;
  discount: number;
  fine: number;
  paid: number;
  status: "Paid" | "Partial" | "Unpaid" | "Overdue";
  method: "Cash" | "Bank Transfer" | "Card" | "Online" | "—";
  heads: { label: string; amount: number }[];
};

export type AttendanceDay = { date: string; present: number; absent: number; late: number; rate: number };

export type Exam = {
  id: string;
  name: string;
  term: string;
  startDate: string;
  endDate: string;
  classes: string[];
  subjects: number;
  halls: string[];
  status: "Scheduled" | "Ongoing" | "Completed" | "Published";
  invigilators: string[];
  resultsPublished: boolean;
};

export type ExamPaper = { id: string; examId: string; className: string; subject: string; date: string; time: string; hall: string; invigilator: string; totalMarks: number; status: "Scheduled" | "Completed" };

export type Mark = { id: string; examId: string; studentId: string; studentName: string; className: string; subject: string; total: number; obtained: number; grade: string; position?: number; remarks: string };

export type Assignment = {
  id: string;
  title: string;
  subject: string;
  className: string;
  teacher: string;
  createdOn: string;
  deadline: string;
  totalMarks: number;
  submissions: number;
  totalStudents: number;
  pending: number;
  attachments: number;
  status: "Open" | "Closed" | "Grading";
  type: "Homework" | "Project" | "Quiz" | "Presentation";
  description: string;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  audience: "All" | "Students" | "Teachers" | "Parents" | "Class";
  className?: string;
  priority: "Normal" | "Important" | "Urgent";
  pinned: boolean;
  postedBy: string;
  postedAt: string;
  views: number;
  attachments: number;
};

export type Thread = {
  id: string;
  participants: { name: string; role: Role; id: string }[];
  subject: string;
  unread: number;
  updatedAt: string;
  messages: { id: string; from: string; body: string; at: string; seen: boolean; attachment?: string }[];
};

export type Book = { id: string; title: string; author: string; isbn: string; category: string; copies: number; available: number; shelf: string; year: number; rating: number };
export type BookIssue = { id: string; bookTitle: string; member: string; memberRole: Role; issuedOn: string; dueDate: string; returnedOn: string | null; fine: number; status: "Issued" | "Returned" | "Overdue" };

export type Route = { id: string; name: string; vehicle: string; plate: string; driver: string; phone: string; capacity: number; onboard: number; stops: string[]; shift: "Morning" | "Afternoon" | "Both"; fee: number; status: "Active" | "Maintenance" };
export type HostelRoom = { id: string; block: string; room: string; floor: number; type: "Single" | "Double" | "Triple" | "Quad"; beds: number; occupied: number; fee: number; warden: string; status: "Available" | "Full" | "Maintenance" };

export type SchoolEvent = {
  id: string;
  title: string;
  category: "Sports" | "Academic" | "Meeting" | "Cultural" | "Excursion";
  date: string;
  endDate: string;
  venue: string;
  organiser: string;
  expected: number;
  registered: number;
  budget: number;
  status: "Upcoming" | "Ongoing" | "Completed";
  description: string;
};

export type Activity = { id: string; actor: string; action: string; target: string; at: string; kind: "student" | "fee" | "exam" | "staff" | "system" | "message" };
export type PayRoll = { id: string; teacherId: string; name: string; designation: string; month: string; basic: number; allowances: number; deductions: number; net: number; status: "Paid" | "Pending" | "Processing" };
export type LeaveRequest = { id: string; staff: string; role: Role; type: "Sick" | "Casual" | "Annual" | "Unpaid"; from: string; to: string; days: number; reason: string; status: "Pending" | "Approved" | "Rejected"; appliedOn: string };

/* --------------------------------------------------------------- PRNG */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260214);
export const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
export const range = (n: number) => Array.from({ length: n }, (_, i) => i);
export const between = (min: number, max: number) => Math.round(min + rnd() * (max - min));
const money = (min: number, max: number) => Math.round((min + rnd() * (max - min)) / 100) * 100;

const pad = (n: number, len = 2) => String(n).padStart(len, "0");
export const dayOffset = (offset: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const monthLabel = (offset: number) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};
export const relativeTime = (minutesAgo: number) => {
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  if (minutesAgo < 1440) return `${Math.round(minutesAgo / 60)}h ago`;
  return `${Math.round(minutesAgo / 1440)}d ago`;
};

/* --------------------------------------------------------------- names */

const FIRST_M = ["Ahmed", "Bilal", "Hamza", "Usman", "Zain", "Hassan", "Danish", "Fahad", "Saad", "Rayyan", "Talha", "Ayaan", "Ibrahim", "Salman", "Moiz", "Omar", "Shayan", "Kashan", "Arham", "Rehan"];
const FIRST_F = ["Ayesha", "Fatima", "Zara", "Hoorain", "Emaan", "Maryam", "Laiba", "Areeba", "Hiba", "Noor", "Anaya", "Sana", "Iqra", "Mahnoor", "Zoya", "Aleena", "Rida", "Amna", "Khadija", "Warda"];
const LAST = ["Khan", "Ahmed", "Siddiqui", "Raza", "Sheikh", "Malik", "Qureshi", "Hashmi", "Ansari", "Farooqi", "Baig", "Mirza", "Junaid", "Iqbal", "Zafar", "Nadeem", "Tariq", "Shafiq", "Alam", "Bhatti"];

export const personName = (gender: "Male" | "Female") => `${gender === "Male" ? pick(FIRST_M) : pick(FIRST_F)} ${pick(LAST)}`;

export const SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Computer Science", "Urdu", "Islamiyat", "Pakistan Studies", "Economics", "Business Studies", "Accounting", "Fine Arts", "Physical Education"];
export const GRADE_LEVELS = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
export const CLASS_NAMES = GRADE_LEVELS.flatMap((g) => ["A", "B"].map((s) => `${g}-${s}`));
export const HOUSES = ["Blue", "Green", "Red", "Yellow"] as const;

/* --------------------------------------------------------------- users */

export const demoUsers: User[] = [
  { id: "u-1", name: "Dr. Shahid Mahmood", email: "superadmin@smartschool.pk", password: "school123", role: "super_admin", avatarSeed: "SM", phone: "+92 300 1112233", status: "active", lastLogin: relativeTime(3), language: "en", emailVerified: true },
  { id: "u-2", name: "Ayesha Rehman", email: "admin@smartschool.pk", password: "school123", role: "admin", avatarSeed: "AR", phone: "+92 301 4455667", status: "active", lastLogin: relativeTime(22), language: "en", emailVerified: true },
  { id: "u-3", name: "Sir Kamran Aslam", email: "teacher@smartschool.pk", password: "school123", role: "teacher", avatarSeed: "KA", phone: "+92 321 7788990", linkedId: "T-001", status: "active", lastLogin: relativeTime(48), language: "en", emailVerified: true },
  { id: "u-4", name: "Hamza Khan", email: "student@smartschool.pk", password: "school123", role: "student", avatarSeed: "HK", phone: "+92 333 1212121", linkedId: "S-1001", status: "active", lastLogin: relativeTime(180), language: "en", emailVerified: true },
  { id: "u-5", name: "Imran Khan", email: "parent@smartschool.pk", password: "school123", role: "parent", avatarSeed: "IK", phone: "+92 345 9090909", linkedId: "S-1001", status: "active", lastLogin: relativeTime(600), language: "en", emailVerified: true },
  { id: "u-6", name: "Naveed Alam", email: "accountant@smartschool.pk", password: "school123", role: "accountant", avatarSeed: "NA", phone: "+92 311 3434343", status: "active", lastLogin: relativeTime(95), language: "en", emailVerified: true },
  { id: "u-7", name: "Sadia Noor", email: "librarian@smartschool.pk", password: "school123", role: "librarian", avatarSeed: "SN", phone: "+92 334 6565656", status: "active", lastLogin: relativeTime(1400), language: "en", emailVerified: true },
];

/* ------------------------------------------------------------ teachers */

const DESIGNATIONS = ["Senior Teacher", "Subject Teacher", "Lecturer", "Head of Department", "Lab Instructor", "Assistant Teacher"];
const DEPARTMENTS = ["Science", "Mathematics", "Languages", "Computer Science", "Humanities", "Commerce"];

export const teachers: Teacher[] = range(48).map((i) => {
  const gender: "Male" | "Female" = i % 3 === 0 ? "Female" : "Male";
  const dept = DEPARTMENTS[i % DEPARTMENTS.length];
  const subjectPool = SUBJECTS.filter((s) => (dept === "Science" ? ["Physics", "Chemistry", "Biology"].includes(s) : dept === "Mathematics" ? s === "Mathematics" : dept === "Languages" ? ["English", "Urdu", "Islamiyat"].includes(s) : dept === "Computer Science" ? ["Computer Science", "Mathematics"].includes(s) : dept === "Commerce" ? ["Accounting", "Business Studies", "Economics"].includes(s) : ["Pakistan Studies", "Fine Arts", "Physical Education"].includes(s)));
  return {
    id: `T-${pad(i + 1, 3)}`,
    employeeId: `EMP-${2000 + i}`,
    name: personName(gender),
    gender,
    designation: DESIGNATIONS[i % DESIGNATIONS.length],
    department: dept,
    subjects: subjectPool.length ? subjectPool.slice(0, 2) : ["Mathematics"],
    classes: range(3).map(() => pick(CLASS_NAMES)),
    qualification: pick(["M.Phil Education", "MSc", "MA", "BS Honours", "PhD Scholar"]),
    joiningDate: dayOffset(-between(200, 3200)),
    email: `teacher${i + 1}@smartschool.pk`,
    phone: `+92 3${between(10, 49)} ${between(1000000, 9999999)}`,
    cnic: `42101-${between(1000000, 9999999)}-${between(1, 9)}`,
    salary: money(65000, 240000),
    status: i % 17 === 0 ? "on_leave" : i % 41 === 0 ? "resigned" : "active",
    experience: between(2, 22),
    attendanceRate: between(88, 99),
    rating: Number((3.6 + rnd() * 1.4).toFixed(1)),
    students: between(60, 240),
  };
});

/* ------------------------------------------------------------ students */

const BLOOD = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const students: Student[] = range(160).map((i) => {
  const gender: "Male" | "Female" = i % 2 === 0 ? "Male" : "Female";
  const className = CLASS_NAMES[i % CLASS_NAMES.length];
  const guardian = personName(rnd() > 0.75 ? "Female" : "Male");
  const attendanceRate = between(72, 100);
  const gpa = Number((2.4 + rnd() * 1.6).toFixed(2));
  const outstanding = i % 4 === 0 ? money(4000, 42000) : i % 11 === 0 ? money(1500, 9000) : 0;
  const transport = i % 3 === 0 ? pick(["Route R-1 — Gulshan", "Route R-4 — Clifton", "Route R-7 — North Nazimabad", "Route R-9 — Korangi"]) : null;
  const hostel = i % 9 === 0 ? pick(["Al-Farabi Boys Block A", "Ibn-e-Sina Boys Block B", "Fatima Jinnah Girls Block C"]) : null;
  return {
    id: `S-${1000 + i}`,
    rollNo: `${className.replace(/[^0-9]/g, "")}${pad(100 + i, 4)}`,
    name: personName(gender),
    gender,
    dob: dayOffset(-between(2200, 6500)),
    className: className.split("-")[0],
    section: className.split("-")[1],
    guardian,
    guardianPhone: `+92 3${between(10, 49)} ${between(1000000, 9999999)}`,
    guardianEmail: `guardian${i + 1}@mail.com`,
    address: pick(["House 12-B, DHA Phase 5, Karachi", "Flat 402, Gulshan Block 13, Karachi", "34/A North Nazimabad, Karachi", "Shop 8, Saddar, Karachi", "Villa 77, Bahria Town, Karachi"]),
    admissionDate: dayOffset(-between(60, 2400)),
    status: i % 40 === 39 ? "inactive" : i % 53 === 0 ? "graduated" : "active",
    bloodGroup: pick(BLOOD),
    cnic: `42${between(100, 999)}-${between(1000000, 9999999)}-${between(1, 9)}`,
    house: HOUSES[i % 4],
    transport,
    hostel,
    attendanceRate,
    gpa,
    feeStatus: outstanding === 0 ? "Paid" : outstanding > 15000 ? "Overdue" : "Partial",
    outstanding,
    riskScore: attendanceRate < 80 || gpa < 2.8 ? between(58, 94) : between(4, 45),
    documents: [
      { name: "Birth Certificate.pdf", type: "PDF", size: "824 KB", uploaded: dayOffset(-between(20, 400)), verified: true },
      { name: "B-Form (NADRA).pdf", type: "PDF", size: "512 KB", uploaded: dayOffset(-between(20, 400)), verified: true },
      { name: "Previous Transcript.pdf", type: "PDF", size: "1.1 MB", uploaded: dayOffset(-between(10, 300)), verified: i % 5 !== 0 },
      { name: "Vaccination Record.jpg", type: "Image", size: "2.4 MB", uploaded: dayOffset(-between(5, 240)), verified: true },
      { name: "Guardian CNIC.jpg", type: "Image", size: "1.7 MB", uploaded: dayOffset(-between(5, 240)), verified: i % 7 !== 0 },
    ],
    achievements: [pick(["Inter-house Cricket Captain", "Science Olympiad Finalist", "Best Debater 2025", "Mathematics Quiz Winner", "Robotics Team Lead"]), pick(["Perfect Attendance 2024", "Art Competition Runner-up", "Coding Hackathon Winner", "Regional Spelling Bee"])],
  };
});

/* ------------------------------------------------------------ classes */

export const classRooms: ClassRoom[] = CLASS_NAMES.map((c, i) => {
  const [grade, section] = c.split("-");
  const prefix = `Grade ${grade}-${section}`;
  const taught = SUBJECTS.slice(0, 8).map((_, k) => SUBJECTS[(k + i) % SUBJECTS.length]);
  return {
    id: `C-${pad(i + 1, 3)}`,
    name: prefix,
    grade: Number(grade.replace(/\D/g, "")),
    section,
    room: `Room ${100 + i}`,
    classTeacher: teachers[i % teachers.length].name,
    students: students.filter((s) => s.className === `Grade ${grade}` && s.section === section).length,
    capacity: 45,
    subjects: taught,
    avgScore: between(58, 92),
    attendance: between(82, 98),
  };
});

/* ----------------------------------------------------------- fees */

export const invoices: FeeInvoice[] = (() => {
  const out: FeeInvoice[] = [];
  let n = 0;
  for (let m = -5; m <= 1; m++) {
    for (let i = 0; i < students.length; i += 1) {
      const s = students[i];
      const tuition = 9500 + s.className.replace(/\D/g, "").length * 0 + between(0, 6000);
      const transportFee = s.transport ? 4500 : 0;
      const hostelFee = s.hostel ? 18000 : 0;
      const discount = i % 7 === 0 ? 1500 : 0;
      const heads = [
        { label: "Tuition Fee", amount: tuition },
        ...(transportFee ? [{ label: "Transport", amount: transportFee }] : []),
        ...(hostelFee ? [{ label: "Hostel & Mess", amount: hostelFee }] : []),
        { label: discount ? "Sibling Discount" : "Lab & Library", amount: discount ? -discount : 1200 },
      ];
      const amount = heads.reduce((a, h) => a + h.amount, 0);
      const overdue = m < 0 && (i + m) % 4 === 0;
      const partial = !overdue && (i + m) % 11 === 0;
      const paid = overdue ? 0 : partial ? Math.round(amount * 0.5) : amount;
      out.push({
        id: `INV-${1000 + n}`,
        challanNo: `CH-${new Date().getFullYear()}${pad(monthIndex(m))}-${pad(i + 1, 4)}`,
        studentId: s.id,
        studentName: s.name,
        className: `${s.className}-${s.section}`,
        month: monthLabel(m),
        issuedOn: dayOffset(-30 * -m - 25),
        dueDate: dayOffset(-30 * -m - 15),
        amount,
        discount,
        fine: overdue ? 500 : 0,
        paid,
        status: overdue ? "Overdue" : partial ? "Partial" : "Paid",
        method: paid === 0 ? "—" : pick(["Cash", "Bank Transfer", "Card", "Online"]),
        heads,
      });
      n++;
    }
  }
  return out;
})();

function monthIndex(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.getMonth() + 1;
}

/* ------------------------------------------------------- attendance */

export const attendanceSeries: AttendanceDay[] = range(120).map((i) => {
  const dow = new Date(dayOffset(-119 + i)).getDay();
  const base = dow === 0 ? 0 : dow === 6 ? 88 : 94;
  const rate = Math.min(99, Math.max(68, base + between(-6, 5)));
  const total = 1480;
  const absent = Math.round((total * (100 - rate)) / 100);
  const late = Math.round(absent * 0.4);
  return { date: dayOffset(-119 + i), present: total - absent, absent, late, rate: dow === 0 ? 0 : rate };
});

export const todayAttendance = students.map((s, i) => ({
  studentId: s.id,
  name: s.name,
  className: `${s.className}-${s.section}`,
  rollNo: s.rollNo,
  status: (i % 23 === 7 ? "Absent" : i % 31 === 5 ? "Late" : i % 43 === 3 ? "Leave" : "Present") as "Present" | "Absent" | "Late" | "Leave",
  markedBy: i % 4 === 0 ? "QR Scan" : "Manual",
  at: `${pad(between(7, 8))}:${pad(between(10, 59))} AM`,
}));

/* ------------------------------------------------------------ exams */

export const exams: Exam[] = [
  { id: "EX-01", name: "First Term Examination", term: "Term 1", startDate: dayOffset(-86), endDate: dayOffset(-78), classes: ["Grade 9", "Grade 10"], subjects: 8, halls: ["Main Hall", "Hall B", "Hall C"], status: "Published", invigilators: teachers.slice(0, 6).map((t) => t.name), resultsPublished: true },
  { id: "EX-02", name: "Mid Term Examination", term: "Term 1", startDate: dayOffset(-42), endDate: dayOffset(-34), classes: ["Grade 9", "Grade 10", "Grade 11"], subjects: 9, halls: ["Main Hall", "Hall B"], status: "Published", invigilators: teachers.slice(6, 12).map((t) => t.name), resultsPublished: true },
  { id: "EX-03", name: "Class Test Series — Round 3", term: "Term 2", startDate: dayOffset(-12), endDate: dayOffset(-5), classes: ["Grade 8", "Grade 9"], subjects: 6, halls: ["Room 201"], status: "Completed", invigilators: teachers.slice(12, 15).map((t) => t.name), resultsPublished: false },
  { id: "EX-04", name: "Pre-Board Examination", term: "Term 2", startDate: dayOffset(6), endDate: dayOffset(18), classes: ["Grade 10", "Grade 12"], subjects: 10, halls: ["Main Hall", "Hall B", "Hall C", "Hall D"], status: "Scheduled", invigilators: teachers.slice(3, 14).map((t) => t.name), resultsPublished: false },
  { id: "EX-05", name: "Annual Examination 2026", term: "Term 3", startDate: dayOffset(48), endDate: dayOffset(64), classes: GRADE_LEVELS, subjects: 14, halls: ["Main Hall", "Hall B", "Hall C", "Hall D", "Auditorium"], status: "Scheduled", invigilators: teachers.slice(0, 20).map((t) => t.name), resultsPublished: false },
  { id: "EX-06", name: "Monthly Assessment — February", term: "Term 2", startDate: dayOffset(2), endDate: dayOffset(5), classes: ["Grade 6", "Grade 7", "Grade 8"], subjects: 5, halls: ["Hall B", "Room 105"], status: "Scheduled", invigilators: teachers.slice(20, 26).map((t) => t.name), resultsPublished: false },
];

export const examPapers: ExamPaper[] = exams.flatMap((ex, ei) =>
  range(6).map((i) => ({
    id: `PP-${ex.id}-${i + 1}`,
    examId: ex.id,
    className: ex.classes[i % ex.classes.length],
    subject: SUBJECTS[(i + ei * 3) % SUBJECTS.length],
    date: dayOffset(Number(ex.startDate.slice(-2)) + i - 60),
    time: pick(["08:30 AM – 10:30 AM", "11:00 AM – 01:00 PM", "02:00 PM – 04:00 PM"]),
    hall: ex.halls[i % ex.halls.length],
    invigilator: ex.invigilators[i % ex.invigilators.length],
    totalMarks: pick([50, 75, 100]),
    status: ei < 3 ? "Completed" : "Scheduled",
  })),
);

const gradeOf = (pct: number) => (pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : pct >= 40 ? "E" : "F");

export const marks: Mark[] = (() => {
  const out: Mark[] = [];
  exams.forEach((ex) => {
    students
      .filter((s) => ex.classes.includes(s.className))
      .slice(0, 26)
      .forEach((s) => {
        SUBJECTS.slice(0, 6).forEach((sub, si) => {
          const total = 100;
          const base = s.gpa * 16 + 22;
          const obtained = Math.max(24, Math.min(99, Math.round(base + between(-12, 12))));
          out.push({
            id: `MK-${ex.id}-${s.id}-${si}`,
            examId: ex.id,
            studentId: s.id,
            studentName: s.name,
            className: `${s.className}-${s.section}`,
            subject: sub,
            total,
            obtained,
            grade: gradeOf(obtained),
            remarks: obtained > 85 ? "Outstanding" : obtained > 70 ? "Good effort" : obtained > 55 ? "Needs focus" : "Requires support",
          });
        });
      });
  });
  return out;
})();

/* ------------------------------------------------------ assignments */

export const assignments: Assignment[] = range(26).map((i) => {
  const totalStudents = between(28, 45);
  const submissions = between(6, totalStudents);
  const deadline = dayOffset(between(-22, 14));
  const closed = new Date(deadline) < new Date();
  return {
    id: `AS-${100 + i}`,
    title: pick(["Algebra Worksheet 4", "Essay: My City Karachi", "Physics Lab Report — Optics", "Chemistry Titration Practical", "Biology Diagram Sheet", "HTML & CSS Mini Project", "Urdu Nazm Analysis", "Economics Case Study", "Book Review — Non-fiction", "Trigonometry Practice Set", "Data Structures Assignment", "Business Plan Draft"]) + ` #${i + 1}`,
    subject: SUBJECTS[i % SUBJECTS.length],
    className: pick(CLASS_NAMES.slice(4)),
    teacher: teachers[i % teachers.length].name,
    createdOn: dayOffset(-between(3, 30)),
    deadline,
    totalMarks: pick([10, 20, 25, 50]),
    submissions,
    totalStudents,
    pending: totalStudents - submissions,
    attachments: between(1, 4),
    status: closed ? (submissions === totalStudents ? "Closed" : "Grading") : "Open",
    type: pick(["Homework", "Project", "Quiz", "Presentation"]) as Assignment["type"],
    description:
      "Complete all questions in your workbook and attach a scanned copy or photo of your work. Late submissions lose 10% of the awarded marks per day. Refer to the chapter notes uploaded on the resources tab.",
  };
});

/* ----------------------------------------------------------- notices */

export const notices: Notice[] = [
  { id: "NT-01", title: "Pre-Board Examination Schedule Released", body: "The schedule for the Pre-Board Examination for Grade 10 and Grade 12 is now available. Papers begin at 8:30 AM sharp. Students must bring their admit cards; entry without an admit card will not be permitted. Revision classes run daily from 2:00 PM to 4:00 PM in Rooms 201 and 202.", audience: "Students", priority: "Urgent", pinned: true, postedBy: "Ayesha Rehman", postedAt: relativeTime(35), views: 1842, attachments: 2 },
  { id: "NT-02", title: "Parent–Teacher Meeting — Term 2", body: "PTM for all grades is scheduled for next Saturday from 9:00 AM to 1:00 PM. Parents are requested to arrive according to the slot communicated by their class teacher. Report cards will be handed over in person.", audience: "Parents", priority: "Important", pinned: true, postedBy: "Dr. Shahid Mahmood", postedAt: relativeTime(240), views: 3120, attachments: 1 },
  { id: "NT-03", title: "Science Fair Project Registration Open", body: "Registration for the Annual Science Fair is open to Grade 6 to Grade 12. Team size: maximum 3 students. Project synopsis must be submitted to the Science Department by the 20th of this month.", audience: "Students", priority: "Normal", pinned: false, postedBy: "Sadia Noor", postedAt: relativeTime(600), views: 934, attachments: 3 },
  { id: "NT-04", title: "Staff Meeting — Curriculum Review", body: "All heads of departments are required to attend the curriculum review meeting in the conference room at 3:00 PM on Wednesday. Bring subject-wise progress reports.", audience: "Teachers", priority: "Important", pinned: false, postedBy: "Ayesha Rehman", postedAt: relativeTime(1200), views: 210, attachments: 0 },
  { id: "NT-05", title: "Fee Submission Deadline Extended", body: "The due date for February fees has been extended to the 12th. Challans can be generated from the parent portal or collected from the accounts office. A late fine applies after the deadline.", audience: "Parents", priority: "Important", pinned: false, postedBy: "Naveed Alam", postedAt: relativeTime(1600), views: 2450, attachments: 1 },
  { id: "NT-06", title: "Inter-house Cricket Trials", body: "Trials for the inter-house cricket tournament begin Monday after school at the main ground. Bring your own kit. Selected players will be notified by the sports office.", audience: "All", priority: "Normal", pinned: false, postedBy: "Sports Office", postedAt: relativeTime(2600), views: 1420, attachments: 0 },
  { id: "NT-07", title: "Grade 9-B Field Trip to Planetarium", body: "Grade 9-B will visit the PIA Planetarium on Thursday. Consent forms signed by guardians are mandatory. Bus departs at 9:00 AM and returns by 2:00 PM. Packed lunch provided.", audience: "Class", className: "Grade 9-B", priority: "Normal", pinned: false, postedBy: "Sir Kamran Aslam", postedAt: relativeTime(3200), views: 96, attachments: 2 },
  { id: "NT-08", title: "Library Stocktake — Closure Notice", body: "The library will remain closed for annual stocktake next Tuesday and Wednesday. All borrowed books must be returned before the closure to avoid fines.", audience: "All", priority: "Normal", pinned: false, postedBy: "Sadia Noor", postedAt: relativeTime(4200), views: 640, attachments: 0 },
  { id: "NT-09", title: "Winter Uniform Enforcement", body: "With the temperature drop, students must wear the complete winter uniform including the navy blazer. Uniform violation slips will be issued from Monday.", audience: "Students", priority: "Normal", pinned: false, postedBy: "Ayesha Rehman", postedAt: relativeTime(5400), views: 1180, attachments: 1 },
  { id: "NT-10", title: "Scholarship Applications — Merit 2026", body: "Merit-based scholarship applications are invited from students securing 90% or above in the last annual examination. Submit the form with transcript and income certificate to the admin office.", audience: "All", priority: "Important", pinned: false, postedBy: "Dr. Shahid Mahmood", postedAt: relativeTime(6800), views: 2010, attachments: 4 },
  { id: "NT-11", title: "Hostel Inspection Schedule", body: "Monthly inspection of hostel blocks will take place on Friday at 11:00 AM. Wardens must ensure rooms and common areas are cleaned and maintenance requests logged.", audience: "Teachers", priority: "Normal", pinned: false, postedBy: "Hostel Warden", postedAt: relativeTime(7400), views: 88, attachments: 0 },
  { id: "NT-12", title: "AC Maintenance in Block B", body: "Air conditioning service will be carried out in Block B Class 9-B classrooms, Library and the Computer Lab. Alternate rooms have been assigned for affected periods.", audience: "All", priority: "Normal", pinned: false, postedBy: "Admin Office", postedAt: relativeTime(8600), views: 340, attachments: 0 },
];

/* ---------------------------------------------------------- messages */

export const threads: Thread[] = [
  {
    id: "TH-01",
    participants: [
      { name: "Ayesha Rehman", role: "admin", id: "u-2" },
      { name: "Sir Kamran Aslam", role: "teacher", id: "T-001" },
    ],
    subject: "Grade 10 result verification",
    unread: 2,
    updatedAt: relativeTime(4),
    messages: [
      { id: "m1", from: "Ayesha Rehman", body: "Good morning Sir Kamran. The Grade 10 mid-term result sheet has been uploaded. Could you verify the Physics and Mathematics marks before we publish?", at: relativeTime(90), seen: true },
      { id: "m2", from: "Sir Kamran Aslam", body: "Good morning. I have cross-checked the Physics entries — two students had clerical marks missing. Sending corrections now.", at: relativeTime(64), seen: true, attachment: "physics-corrections.xlsx" },
      { id: "m3", from: "Ayesha Rehman", body: "Received, thank you. I have pushed the correction. Position list will be auto-recalculated overnight.", at: relativeTime(20), seen: true },
      { id: "m4", from: "Sir Kamran Aslam", body: "Perfect. Also, may I schedule the practical viva for Tuesday 11:00 AM in Lab 2?", at: relativeTime(4), seen: false },
    ],
  },
  {
    id: "TH-02",
    participants: [
      { name: "Sir Kamran Aslam", role: "teacher", id: "T-001" },
      { name: "Hamza Khan", role: "student", id: "S-1001" },
    ],
    subject: "Physics assignment extension",
    unread: 1,
    updatedAt: relativeTime(38),
    messages: [
      { id: "m1", from: "Sir Kamran Aslam", body: "Hamza, your lab report is due tomorrow. Do you need additional apparatus time?", at: relativeTime(120), seen: true },
      { id: "m2", from: "Hamza Khan", body: "Sir, I was unwell for two days. May I submit by Friday?", at: relativeTime(80), seen: true },
      { id: "m3", from: "Sir Kamran Aslam", body: "Approved. Submit by Friday 4:00 PM without any late penalty. Focus on the observation table.", at: relativeTime(38), seen: false },
    ],
  },
  {
    id: "TH-03",
    participants: [
      { name: "Sir Kamran Aslam", role: "teacher", id: "T-001" },
      { name: "Imran Khan", role: "parent", id: "S-1001" },
    ],
    subject: "Parent–teacher meeting slot",
    unread: 0,
    updatedAt: relativeTime(320),
    messages: [
      { id: "m1", from: "Imran Khan", body: "Assalam o Alaikum. I would like to book a slot on Saturday for Hamza's PTM.", at: relativeTime(400), seen: true },
      { id: "m2", from: "Sir Kamran Aslam", body: "Walaikum Assalam. I have you at 10:30 AM — Room 12. Please bring his mid-term report card.", at: relativeTime(320), seen: true },
    ],
  },
  {
    id: "TH-04",
    participants: [
      { name: "Naveed Alam", role: "accountant", id: "u-6" },
      { name: "Ayesha Rehman", role: "admin", id: "u-2" },
    ],
    subject: "February fee collection summary",
    unread: 3,
    updatedAt: relativeTime(12),
    messages: [
      { id: "m1", from: "Naveed Alam", body: "February collection stands at 87% with 43 challans overdue. Sending the ageing report for approval.", at: relativeTime(150), seen: true, attachment: "fee-ageing-feb.xlsx" },
      { id: "m2", from: "Ayesha Rehman", body: "Approved. Please issue SMS reminders to the overdue guardians today.", at: relativeTime(40), seen: true },
      { id: "m3", from: "Naveed Alam", body: "SMS campaign queued for 5:00 PM. Cash book closes at 6 PM.", at: relativeTime(12), seen: false },
    ],
  },
];

/* ---------------------------------------------------------- library */

const BOOKS = ["Physics for Scientists", "Advanced Mathematics Vol. 2", "Chemistry: The Central Science", "Biology Campbell", "Oxford English Grammar", "Urdu Adab Zaban", "Introduction to Algorithms", "World History Atlas", "Islamic Studies Standard", "Business Studies Basics", "Economics Today", "Art of Programming", "Pakistan Studies Reader", "Organic Chemistry Lab Manual", "Statistics for Schools", "Discrete Mathematics", "Robotics for Beginners", "Environmental Science", "Financial Accounting", "Creative Writing Guide"];

export const books: Book[] = range(120).map((i) => {
  const copies = between(2, 18);
  const available = between(0, copies);
  return {
    id: `BK-${1000 + i}`,
    title: `${BOOKS[i % BOOKS.length]}${i >= BOOKS.length ? ` (Ed. ${Math.floor(i / BOOKS.length) + 2})` : ""}`,
    author: personName(rnd() > 0.5 ? "Male" : "Female"),
    isbn: `978-0-${between(100000, 999999)}-${between(10, 99)}-${between(1, 9)}`,
    category: pick(["Science", "Mathematics", "Literature", "Technology", "History", "Commerce"]),
    copies,
    available,
    shelf: `${pick(["A", "B", "C", "D"])}-${between(1, 24)}`,
    year: between(2015, 2025),
    rating: Number((3.4 + rnd() * 1.6).toFixed(1)),
  };
});

export const bookIssues: BookIssue[] = range(64).map((i) => {
  const issuedOn = dayOffset(-between(1, 40));
  const dueDate = dayOffset(-between(-20, 25));
  const overdue = new Date(dueDate) < new Date();
  const returned = i % 3 === 0 ? dayOffset(-between(1, 10)) : null;
  return {
    id: `IS-${500 + i}`,
    bookTitle: books[i % books.length].title,
    member: i % 2 === 0 ? students[i % students.length].name : teachers[i % teachers.length].name,
    memberRole: (i % 2 === 0 ? "student" : "teacher") as Role,
    issuedOn,
    dueDate,
    returnedOn: returned,
    fine: returned ? 0 : overdue ? between(20, 400) : 0,
    status: returned ? "Returned" : overdue ? "Overdue" : "Issued",
  };
});

/* --------------------------------------------------------- transport */

export const transportRoutes: Route[] = range(14).map((i) => {
  const capacity = pick([28, 36, 42, 52]);
  return {
    id: `R-${i + 1}`,
    name: `${pick(["Gulshan", "Clifton", "North Nazimabad", "Korangi", "Malir", "DHA", "Bahria Town", "Saddar", "Landhi", "Scheme 33", "PECHS", "Gulistan-e-Jauhar", "Kemari", "Tariq Road"])} Route`,
    vehicle: `Bus ${pick(["Hino", "Isuzu", "Toyota Coaster"])} — ${between(100, 999)}`,
    plate: `BL-${between(1000, 9999)}`,
    driver: personName("Male"),
    phone: `+92 3${between(10, 49)} ${between(1000000, 9999999)}`,
    capacity,
    onboard: between(Math.round(capacity * 0.5), capacity),
    stops: ["Main Gate", pick(["Aladdin Park", "Dolmen Mall", "FTC", "Millennium Mall", "Askari Park"]), pick(["Civic Centre", "KDA Chowrangi", "Safoora", "Nipa"]), "School Campus"],
    shift: pick(["Morning", "Afternoon", "Both"]) as Route["shift"],
    fee: money(3500, 7500),
    status: i % 8 === 7 ? "Maintenance" : "Active",
  };
});

/* ------------------------------------------------------------ hostel */

export const hostelRooms: HostelRoom[] = range(48).map((i) => {
  const type = pick(["Single", "Double", "Triple", "Quad"]) as HostelRoom["type"];
  const beds = type === "Single" ? 1 : type === "Double" ? 2 : type === "Triple" ? 3 : 4;
  const occupied = between(0, beds);
  return {
    id: `HR-${200 + i}`,
    block: pick(["Block A (Boys)", "Block B (Boys)", "Block C (Girls)", "Block D (Girls)"]),
    room: `${between(1, 4)}${pad(between(1, 24))}`,
    floor: between(1, 4),
    type,
    beds,
    occupied,
    fee: money(12000, 24000),
    warden: personName(rnd() > 0.5 ? "Male" : "Female"),
    status: occupied === beds ? "Full" : i % 23 === 22 ? "Maintenance" : "Available",
  };
});

/* ------------------------------------------------------------ events */

export const schoolEvents: SchoolEvent[] = [
  { id: "EV-01", title: "Annual Sports Day 2026", category: "Sports", date: dayOffset(9), endDate: dayOffset(9), venue: "Main Ground", organiser: "Sports Office", expected: 1800, registered: 1240, budget: 850000, status: "Upcoming", description: "Full-day inter-house athletics meet with march past, 24 track and field events, and medal distribution by the chief guest." },
  { id: "EV-02", title: "Parent–Teacher Meeting (Term 2)", category: "Meeting", date: dayOffset(4), endDate: dayOffset(4), venue: "All Wings", organiser: "Ayesha Rehman", expected: 900, registered: 812, budget: 120000, status: "Upcoming", description: "Slot-based PTM for all grades. Report cards issued in person; subject teachers available in assigned rooms." },
  { id: "EV-03", title: "Science & Robotics Fair", category: "Academic", date: dayOffset(21), endDate: dayOffset(22), venue: "Auditorium & Labs", organiser: "Science Department", expected: 600, registered: 384, budget: 420000, status: "Upcoming", description: "Student projects judged across physics, chemistry, biology and robotics. Industry judges invited from local universities." },
  { id: "EV-04", title: "Inter-house Cricket Final", category: "Sports", date: dayOffset(-3), endDate: dayOffset(-3), venue: "Cricket Ground", organiser: "Sports Office", expected: 700, registered: 700, budget: 95000, status: "Completed", description: "Green House beat Blue House by 18 runs in a closely contested final." },
  { id: "EV-05", title: "Independence Day Celebration", category: "Cultural", date: dayOffset(-58), endDate: dayOffset(-58), venue: "Courtyard", organiser: "Fine Arts", expected: 1500, registered: 1500, budget: 260000, status: "Completed", description: "Flag hoisting, national songs, tableau performance and traditional dress day." },
  { id: "EV-06", title: "Grade 9 Field Trip — Planetarium", category: "Excursion", date: dayOffset(2), endDate: dayOffset(2), venue: "PIA Planetarium", organiser: "Sir Kamran Aslam", expected: 42, registered: 39, budget: 65000, status: "Upcoming", description: "Guided astronomy session and documentary screening with practical worksheet." },
  { id: "EV-07", title: "Quiz Championship (Inter-School)", category: "Academic", date: dayOffset(34), endDate: dayOffset(34), venue: "Auditorium", organiser: "English Department", expected: 320, registered: 96, budget: 180000, status: "Upcoming", description: "Twelve invited schools compete across general knowledge, sciences and current affairs rounds." },
  { id: "EV-08", title: "Annual Prize Distribution", category: "Cultural", date: dayOffset(64), endDate: dayOffset(64), venue: "Auditorium", organiser: "Administration", expected: 1100, registered: 0, budget: 640000, status: "Upcoming", description: "Academic excellence awards, scholarship announcements and cultural performance." },
  { id: "EV-09", title: "Anti-Bullying Awareness Seminar", category: "Meeting", date: dayOffset(-12), endDate: dayOffset(-12), venue: "Auditorium", organiser: "Counselling Cell", expected: 800, registered: 780, budget: 40000, status: "Completed", description: "Sessions led by child psychologists for students of Grade 6 to Grade 12." },
  { id: "EV-10", title: "Career Counselling Day", category: "Academic", date: dayOffset(28), endDate: dayOffset(28), venue: "Conference Hall", organiser: "Career Office", expected: 260, registered: 148, budget: 150000, status: "Upcoming", description: "University representatives and professionals guide Grade 11 and 12 students on pathways." },
  { id: "EV-11", title: "Sports Gala — Ramadan Night Cricket", category: "Sports", date: dayOffset(42), endDate: dayOffset(43), venue: "Cricket Ground", organiser: "Sports Office", expected: 900, registered: 210, budget: 210000, status: "Upcoming", description: "Sehri-adjacent night cricket tournament for senior grades with floodlit ground." },
  { id: "EV-12", title: "Art & Calligraphy Exhibition", category: "Cultural", date: dayOffset(-25), endDate: dayOffset(-24), venue: "Art Block", organiser: "Fine Arts", expected: 500, registered: 500, budget: 130000, status: "Completed", description: "Over 180 student artworks exhibited, including traditional Urdu calligraphy pieces." },
];

/* ------------------------------------------------- activities & misc */

export const activities: Activity[] = range(22).map((i) => ({
  id: `AC-${i + 1}`,
  actor: i % 4 === 0 ? teachers[i % teachers.length].name : i % 4 === 1 ? students[i % students.length].name : i % 4 === 2 ? pick(["Ayesha Rehman", "Naveed Alam", "Sadia Noor"]) : "System",
  action: pick(["marked attendance for", "created fee challan for", "published result for", "approved leave for", "issued book to", "uploaded assignment for", "generated report card of", "registered admission for", "updated timetable of", "recorded payment from"]),
  target: pick([`Grade ${between(6, 12)}-${pick(["A", "B"])}`, students[i % students.length].name, teachers[i % teachers.length].name, "Section A", "Term 2"]),
  at: relativeTime(between(2, 1400)),
  kind: pick(["student", "fee", "exam", "staff", "system", "message"]) as Activity["kind"],
}));

export const payroll: PayRoll[] = teachers.map((t, i) => {
  const allowances = Math.round(t.salary * 0.18);
  const deductions = Math.round(t.salary * 0.09);
  return {
    id: `PR-${400 + i}`,
    teacherId: t.id,
    name: t.name,
    designation: t.designation,
    month: monthLabel(0),
    basic: t.salary,
    allowances,
    deductions,
    net: t.salary + allowances - deductions,
    status: i % 9 === 0 ? "Pending" : i % 13 === 0 ? "Processing" : "Paid",
  };
});

export const leaveRequests: LeaveRequest[] = range(18).map((i) => {
  const from = dayOffset(between(-6, 12));
  const days = between(1, 5);
  return {
    id: `LV-${300 + i}`,
    staff: i % 2 === 0 ? teachers[i % teachers.length].name : personName(pick(["Male", "Female"])),
    role: (i % 3 === 0 ? "teacher" : "accountant") as Role,
    type: pick(["Sick", "Casual", "Annual", "Unpaid"]) as LeaveRequest["type"],
    from,
    to: dayOffset(between(-5, 16)),
    days,
    reason: pick(["Medical treatment and rest advised by doctor.", "Family obligation out of city.", "Wedding in the family.", "Personal matters.", "Attending professional certification exam."]),
    status: i % 4 === 0 ? "Pending" : i % 5 === 0 ? "Rejected" : "Approved",
    appliedOn: dayOffset(-between(1, 10)),
  };
});

/* ------------------------------------------------- aggregate analytics */

export const revenueSeries = range(12).map((i) => {
  const target = 8_400_000 + i * 120_000;
  const collected = Math.round(target * (0.78 + rnd() * 0.24));
  return {
    month: monthLabel(i - 11),
    collected,
    outstanding: Math.max(0, target - collected),
    target,
    expenses: Math.round(target * (0.52 + rnd() * 0.14)),
  };
});

export const studentGrowth = range(12).map((i) => ({
  month: monthLabel(i - 11),
  students: 4180 + i * 74 + between(-28, 42),
  admissions: between(18, 96),
  left: between(4, 34),
}));

export const subjectPerformance = SUBJECTS.slice(0, 8).map((s, i) => ({
  subject: s,
  score: between(62, 94),
  lastTerm: between(58, 90),
  students: between(180, 620),
  passRate: between(78, 99),
  index: i,
}));

export const examStats = exams.map((e, i) => ({
  exam: e.name.split(" ").slice(0, 2).join(" "),
  appeared: between(120, 480),
  passed: between(100, 470),
  distinction: between(8, 60),
  failed: between(2, 30),
  avg: between(58, 84),
  id: e.id,
  index: i,
}));

export const kpiSnapshot = {
  students: students.filter((s) => s.status === "active").length * 31,
  teachers: teachers.filter((t) => t.status !== "resigned").length,
  parents: 3820,
  attendanceRate: Number((attendanceSeries.slice(-30).reduce((a, d) => a + d.rate, 0) / 30).toFixed(1)),
  feeCollectedThisMonth: invoices.filter((i) => i.month === monthLabel(0) && i.paid > 0).reduce((a, i) => a + i.paid, 0),
  revenueYTD: revenueSeries.reduce((a, r) => a + r.collected, 0),
  activeClasses: CLASS_NAMES.length,
  examAverage: Number((marks.reduce((a, m) => a + m.obtained, 0) / Math.max(marks.length, 1)).toFixed(1)),
  passRate: 94.6,
  outstandingTotal: invoices.filter((i) => i.status !== "Paid").reduce((a, i) => a + (i.amount - i.paid), 0),
  hostelOccupancy: Math.round((hostelRooms.reduce((a, r) => a + r.occupied, 0) / hostelRooms.reduce((a, r) => a + r.beds, 0)) * 100),
  transportUtilisation: Math.round((transportRoutes.reduce((a, r) => a + r.onboard, 0) / transportRoutes.reduce((a, r) => a + r.capacity, 0)) * 100),
  libraryIssued: bookIssues.filter((b) => b.status !== "Returned").length,
  pendingLeaves: leaveRequests.filter((l) => l.status === "Pending").length,
  openAssignments: assignments.filter((a) => a.status === "Open").length,
};

export const systemStatus = [
  { name: "API Gateway", status: "Operational", latency: 82, uptime: 99.99 },
  { name: "MongoDB Cluster", status: "Operational", latency: 41, uptime: 99.98 },
  { name: "Realtime Socket Layer", status: "Operational", latency: 26, uptime: 99.95 },
  { name: "Media (Cloudinary)", status: "Operational", latency: 118, uptime: 99.9 },
  { name: "Backup Service", status: "Degraded", latency: 640, uptime: 98.2 },
  { name: "SMS / Notification Worker", status: "Operational", latency: 210, uptime: 99.8 },
];

export const timetableSlots = ["08:00", "08:45", "09:30", "10:15", "11:15", "12:00", "12:45", "01:30"];
export const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
