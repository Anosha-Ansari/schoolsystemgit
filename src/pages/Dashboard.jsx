import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Users, GraduationCap, CalendarCheck, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import Banner from "../components/Banner";
import StatCard from "../components/StatCard";
import Card from "../components/Card";

const attendanceData = [
  { day: "Sep 15", present: 78, absent: 10, late: 8 },
  { day: "Sep 16", present: 80, absent: 12, late: 10 },
  { day: "Sep 17", present: 82, absent: 9, late: 12 },
  { day: "Sep 18", present: 85, absent: 14, late: 14 },
  { day: "Sep 19", present: 88, absent: 8, late: 18 },
  { day: "Sep 20", present: 95, absent: 6, late: 22 },
  { day: "Sep 21", present: 100, absent: 5, late: 45 },
];

const performance = [
  { name: "Excellent", value: 62, color: "#12B981" },
  { name: "Good", value: 25, color: "#2F6FED" },
  { name: "Average", value: 8, color: "#F5A524" },
  { name: "Needs Improvement", value: 5, color: "#8B5CF6" },
];

const activities = [
  { title: "New student enrolled", sub: "Ayesha Khan (Class 6)", time: "2 hours ago" },
  { title: "Teacher profile updated", sub: "Mr. Ahmed Khan (Maths)", time: "4 hours ago" },
  { title: "Attendance recorded", sub: "Class 5 — 92% attendance today", time: "5 hours ago" },
  { title: "Fee received", sub: "PKR 25,000 from Ali Raza (Class 8)", time: "7 hours ago" },
];

const events = [
  { day: "22", month: "SEP", title: "Parent Teacher Meeting", time: "10:00 AM – 12:00 PM", place: "Main Hall" },
  { day: "25", month: "SEP", title: "Science Exhibition", time: "09:00 AM – 03:00 PM", place: "School Campus" },
  { day: "28", month: "SEP", title: "Mid Term Exam (Class 6-8)", time: "08:00 AM – 12:00 PM", place: "Examination Hall" },
  { day: "02", month: "OCT", title: "Sports Day", time: "09:00 AM – 02:00 PM", place: "School Ground" },
];

const quickActions = [
  { label: "Add Student", to: "/students/register" },
  { label: "Add Teacher", to: "/teachers/register" },
  { label: "Mark Attendance", to: "/attendance" },
  { label: "Add Exam", to: "/examinations" },
  { label: "Record Fee", to: "/fees" },
  { label: "Generate Report", to: "/reports" },
];

export default function Dashboard() {
  return (
    <>
      <Banner
        title="Dashboard"
        subtitle="Here's what's happening at your school today."
        tagline={"Better Education\nBrighter Future"}
      />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={<Users size={16} />} iconBg="#2F6FED" label="Total Students" value="1,248" delta="12% vs last month" to="/students/list" />
        <StatCard icon={<GraduationCap size={16} />} iconBg="#F5A524" label="Teachers" value="86" delta="5% vs last month" to="/teachers/list" />
        <StatCard icon={<CalendarCheck size={16} />} iconBg="#12B981" label="Attendance Today" value="92%" delta="3% vs yesterday" to="/attendance" />
        <StatCard icon={<Wallet size={16} />} iconBg="#8B5CF6" label="Fees Collected" value="PKR 1,245,000" delta="18% vs last month" to="/fees" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4 mb-5">
        <Card title="Attendance Overview">
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={attendanceData}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6B7590" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="present" stroke="#2F6FED" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="absent" stroke="#F5A524" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="late" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-muted">
            <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-brand-blue inline-block" />Present</span>
            <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-brand-orange inline-block" />Absent</span>
            <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-brand-purple inline-block" />Late</span>
          </div>
        </Card>

        <Card title="Performance Overview">
          <div className="relative flex items-center justify-center h-[130px]">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={performance} dataKey="value" innerRadius={40} outerRadius={60} startAngle={90} endAngle={-270}>
                  {performance.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <div className="font-heading font-bold text-xl">92%</div>
              <div className="text-[10px] text-muted">Overall</div>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {performance.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />{p.name}</span>
                <b>{p.value}%</b>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Card title="Recent Activities" action={<Link to="/students/list" className="text-brand-blue text-[12.5px] font-semibold">View All</Link>}>
            {activities.map((a) => (
              <div key={a.title} className="flex justify-between py-2.5 border-b border-border last:border-none text-[13px]">
                <div><b>{a.title}</b><div className="text-muted text-xs">{a.sub}</div></div>
                <span className="text-muted text-xs whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </Card>
          <Card title="Upcoming Events" action={<Link to="/notices" className="text-brand-blue text-[12.5px] font-semibold">View All</Link>}>
            {events.map((e) => (
              <div key={e.title} className="flex gap-3 py-2.5 border-b border-border last:border-none text-[13px]">
                <div className="text-center w-9 shrink-0">
                  <div className="text-[10px] text-brand-blue font-bold">{e.month}</div>
                  <div className="font-heading font-bold text-base leading-none">{e.day}</div>
                </div>
                <div><b>{e.title}</b><div className="text-muted text-xs">{e.time} · {e.place}</div></div>
              </div>
            ))}
          </Card>
        </div>
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to} className="bg-bg rounded-xl p-3 text-[12.5px] font-semibold text-ink cursor-pointer hover:bg-blue-50">
                {a.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
