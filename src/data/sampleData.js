export const students = [
  { id: "STU001", name: "Ayesha Khan", roll: 12, class: "Class 6 - A", gender: "Female", status: "Active" },
  { id: "STU002", name: "Ali Raza", roll: 15, class: "Class 6 - A", gender: "Male", status: "Active" },
  { id: "STU003", name: "Fatima Noor", roll: 8, class: "Class 7 - B", gender: "Female", status: "Active" },
  { id: "STU004", name: "Usman Ahmed", roll: 21, class: "Class 7 - B", gender: "Male", status: "Active" },
  { id: "STU005", name: "Sara Malik", roll: 7, class: "Class 8 - A", gender: "Female", status: "Active" },
  { id: "STU006", name: "Zain Ali", roll: 18, class: "Class 8 - A", gender: "Male", status: "Active", isTransfer: true, transfer: { previousSchool: "City Grammar School", tcNumber: "TC-2026-0451", tcDate: "2026-08-01", previousClass: "Class 7", reason: "Family relocation" } },
  { id: "STU007", name: "Hira Shah", roll: 14, class: "Class 9 - C", gender: "Female", status: "Active" },
  { id: "STU008", name: "Danish Khan", roll: 22, class: "Class 9 - C", gender: "Male", status: "Inactive" },
  { id: "STU009", name: "Sana Iqbal", roll: 9, class: "Class 10 - A", gender: "Female", status: "Active" },
  { id: "STU010", name: "Hamza Javed", roll: 16, class: "Class 10 - A", gender: "Male", status: "Active" },
];

export const teachers = [
  { name: "Ahmed Khan", subject: "Mathematics", experience: "12 yrs", classes: 6, status: "Active" },
  { name: "Fatima Noor", subject: "English", experience: "8 yrs", classes: 5, status: "Active" },
  { name: "Zeeshan Ali", subject: "Physics", experience: "5 yrs", classes: 4, status: "On Leave" },
  { name: "Mahnoor Sheikh", subject: "Biology", experience: "6 yrs", classes: 5, status: "Active" },
  { name: "Bilal Ahmad", subject: "Urdu", experience: "9 yrs", classes: 6, status: "Active" },
];

export const classes = [
  { name: "Grade 1", section: "A", students: 32, teacher: "Sarah Khan", room: "R101", schedule: "8:00 AM", status: "Active" },
  { name: "Grade 1", section: "B", students: 29, teacher: "Ahmed Ali", room: "R102", schedule: "8:00 AM", status: "Active" },
  { name: "Grade 2", section: "A", students: 35, teacher: "Fatima Noor", room: "R201", schedule: "9:00 AM", status: "Active" },
  { name: "Grade 2", section: "B", students: 31, teacher: "Bilal Ahmad", room: "R202", schedule: "9:00 AM", status: "Active" },
  { name: "Grade 3", section: "A", students: 28, teacher: "Ayesha Malik", room: "R301", schedule: "10:00 AM", status: "Active" },
  { name: "Grade 3", section: "B", students: 33, teacher: "Zain Ul Abdin", room: "R302", schedule: "10:00 AM", status: "Active" },
];

export const attendance = [
  { name: "Ayesha Khan", roll: "STU001", class: "Grade 1", section: "A", status: "Present", pct: 100 },
  { name: "Ahmed Ali", roll: "STU002", class: "Grade 1", section: "B", status: "Present", pct: 100 },
  { name: "Fatima Noor", roll: "STU003", class: "Grade 2", section: "A", status: "Present", pct: 100 },
  { name: "Bilal Ahmad", roll: "STU004", class: "Grade 2", section: "B", status: "Absent", pct: 0 },
  { name: "Zainab Fatima", roll: "STU005", class: "Grade 3", section: "A", status: "Present", pct: 100 },
  { name: "Usman Raza", roll: "STU006", class: "Grade 3", section: "B", status: "Present", pct: 100 },
  { name: "Hira Shah", roll: "STU007", class: "Grade 4", section: "A", status: "Late", pct: 90 },
];

export const exams = [
  { name: "Mid Term Examination", class: "Grade 5", subject: "Mathematics", type: "Mid Term", date: "2026-09-28", status: "Upcoming" },
  { name: "Unit Test 1", class: "Grade 3", subject: "English", type: "Quiz", date: "2026-08-18", status: "Ongoing" },
  { name: "Science Test", class: "Grade 4", subject: "Science", type: "Test", date: "2026-08-16", status: "Completed" },
  { name: "Maths Quiz", class: "Grade 2", subject: "Mathematics", type: "Quiz", date: "2026-08-14", status: "Completed" },
  { name: "Final Term Exam", class: "Grade 5", subject: "Computer", type: "Final", date: "2026-08-10", status: "Completed" },
];

export const fees = [
  { name: "Ayesha Khan", roll: "STU001", class: "Grade 5", total: 30000, paid: 30000, due: 0, status: "Paid" },
  { name: "Ahmed Raza", roll: "STU002", class: "Grade 3", total: 25000, paid: 15000, due: 10000, status: "Partial" },
  { name: "Fatima Noor", roll: "STU003", class: "Grade 2", total: 22000, paid: 22000, due: 0, status: "Paid" },
  { name: "Bilal Ahmed", roll: "STU004", class: "Grade 1", total: 20000, paid: 10000, due: 10000, status: "Partial" },
  { name: "Zainab Fatima", roll: "STU005", class: "Grade 4", total: 28000, paid: 0, due: 28000, status: "Pending" },
];

export const notices = [
  { title: "Mid Term Examination Schedule Released", body: "The mid term examination schedule for all classes has been uploaded. Please check the attached file for complete details.", date: "Aug 15, 2026", tags: ["Academic", "All Classes"], priority: "High" },
  { title: "Parent Teacher Meeting", body: "Parent Teacher Meeting will be held on 22nd August 2026 (Friday) from 9:00 AM to 12:00 PM. All parents are requested to attend.", date: "Aug 14, 2026", tags: ["Event", "All Classes"], priority: "Medium" },
  { title: "Fee Payment Reminder", body: "Kindly note that the last date for fee submission for August 2026 is 20th August. Late payment will incur a fine of PKR 500.", date: "Aug 12, 2026", tags: ["Circular", "All Classes"], priority: "Medium" },
  { title: "Science Exhibition 2026", body: "Science Exhibition will be held on 30th August 2026 at the school campus. All students are encouraged to participate.", date: "Aug 10, 2026", tags: ["Event", "Grade 6 - 10"], priority: "Low" },
];

export const conversations = [
  { name: "Ayesha Khan", role: "Grade 5 · Student", last: "Thank you ma'am!", time: "10:24 AM", unread: 2 },
  { name: "Mrs. Sarah Khan", role: "Teacher · Mathematics", last: "Class test will be on Friday.", time: "09:45 AM", unread: 1 },
  { name: "Ahmed Raza", role: "Grade 3 · Student", last: "Can I submit my homework late?", time: "Yesterday", unread: 1 },
  { name: "Fatima Noor", role: "Parent · Grade 2", last: "Kindly check my child's attendance.", time: "Yesterday", unread: 0 },
  { name: "Bilal Ahmad", role: "Grade 4 · Student", last: "Sir, I have a question about the project.", time: "Aug 11", unread: 0 },
];
