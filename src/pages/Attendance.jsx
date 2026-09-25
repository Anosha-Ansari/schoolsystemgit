import { Users, CheckCircle2, UserX, CalendarCheck } from "lucide-react";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import Banner from "../components/Banner";
import StatCard from "../components/StatCard";
import Card from "../components/Card";
import Pill from "../components/Pill";
import { attendance } from "../data/sampleData";

const week = [
  { day: "Aug 6", present: 90, absent: 10 },
  { day: "Aug 7", present: 92, absent: 8 },
  { day: "Aug 8", present: 88, absent: 12 },
  { day: "Aug 9", present: 91, absent: 9 },
  { day: "Aug 10", present: 89, absent: 11 },
  { day: "Aug 11", present: 93, absent: 7 },
  { day: "Aug 12", present: 88, absent: 12 },
];

const classWise = [
  { name: "Grade 1", value: 95, color: "#2F6FED" },
  { name: "Grade 2", value: 92, color: "#8B5CF6" },
  { name: "Grade 3", value: 88, color: "#12B981" },
  { name: "Grade 4", value: 85, color: "#F5A524" },
  { name: "Grade 5", value: 82, color: "#EC4899" },
];

export default function Attendance() {
  return (
    <>
      <Banner title="Attendance Management" subtitle="Track and manage student attendance with detailed reports and analytics." tagline={"Better Attendance\nBrighter Future"} />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={<Users size={16} />} iconBg="#2F6FED" label="Total Students" value="1,248" delta="12% vs last month" />
        <StatCard icon={<CheckCircle2 size={16} />} iconBg="#12B981" label="Present Today" value="1,102" delta="88.3% attendance rate" />
        <StatCard icon={<UserX size={16} />} iconBg="#F5A524" label="Absent Today" value="146" delta="11.7% absent" deltaTone="down" />
        <StatCard icon={<CalendarCheck size={16} />} iconBg="#8B5CF6" label="Class Average" value="91%" delta="4% vs last week" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <Card title="Attendance Records" action={<button className="bg-brand-green text-white text-[13px] font-semibold px-4 py-2 rounded-lg btn-tap hover:brightness-105 transition-all">Export</button>}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted text-[11.5px] uppercase border-b border-border">
                <th className="py-2.5">Student</th><th>Roll No</th><th>Class</th><th>Status</th><th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.roll} className="border-b border-border last:border-none row-hover">
                  <td className="py-2.5 font-semibold flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-bg text-brand-blue flex items-center justify-center text-[11px] font-bold">{a.name[0]}</span>
                    {a.name}
                  </td>
                  <td>{a.roll}</td>
                  <td>{a.class} - {a.section}</td>
                  <td><Pill>{a.status}</Pill></td>
                  <td>
                    <div className="w-24 h-1.5 bg-bg rounded-full overflow-hidden">
                      <div className="h-full bg-brand-green" style={{ width: `${a.pct}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Attendance Overview">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={week}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6B7590" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="present" stroke="#12B981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Class Wise Attendance">
            <div className="relative flex items-center justify-center h-[110px]">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={classWise} dataKey="value" innerRadius={34} outerRadius={52}>
                    {classWise.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <div className="font-heading font-bold text-base">88.3%</div>
              </div>
            </div>
            <div className="space-y-1 mt-2 text-[12px]">
              {classWise.map((d) => (
                <div key={d.name} className="flex justify-between">
                  <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full inline-block" style={{ background: d.color }} />{d.name}</span>
                  <b>{d.value}%</b>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
