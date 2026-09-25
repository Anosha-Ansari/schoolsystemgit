import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, UserPlus, GraduationCap, UserX, Search, ArrowRightLeft } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Banner from "../../components/Banner";
import StatCard from "../../components/StatCard";
import Card from "../../components/Card";
import Pill from "../../components/Pill";
import { useStudents } from "../../context/StudentsContext";

const dist = [
  { name: "Class 6", value: 210, color: "#2F6FED" },
  { name: "Class 7", value: 198, color: "#12B981" },
  { name: "Class 8", value: 176, color: "#F5A524" },
  { name: "Class 9", value: 164, color: "#8B5CF6" },
  { name: "Class 10", value: 158, color: "#EC4899" },
  { name: "Others", value: 342, color: "#94a3b8" },
];

export default function StudentList() {
  const { students } = useStudents();
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.class.toLowerCase().includes(q.toLowerCase())),
    [students, q]
  );

  const active = students.filter((s) => s.status === "Active").length;
  const inactive = students.length - active;

  return (
    <>
      <Banner title="Student List" subtitle="Manage your students, track performance, attendance and growth — all in one place." tagline={"Learn · Grow\nSucceed"} />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={<Users size={16} />} iconBg="#2F6FED" label="Total Students" value={students.length} delta="12% vs last month" />
        <StatCard icon={<UserPlus size={16} />} iconBg="#F5A524" label="New Admissions" value="86" delta="5% vs last month" />
        <StatCard icon={<GraduationCap size={16} />} iconBg="#12B981" label="Active Students" value={active} delta="3% vs yesterday" />
        <StatCard icon={<UserX size={16} />} iconBg="#8B5CF6" label="Inactive Students" value={inactive} delta="2% vs last month" deltaTone="down" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <Card
          title="Student List"
          action={
            <Link to="/students/register" className="bg-brand-blue text-white text-[13px] font-semibold px-4 py-2 rounded-lg btn-tap hover:bg-brand-bluedark transition-colors">
              + Add Student
            </Link>
          }
        >
          <div className="flex items-center gap-2 bg-bg rounded-lg px-3 py-2 mb-3 max-w-[280px]">
            <Search size={14} className="text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students…" className="bg-transparent outline-none text-[13px] flex-1" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-muted text-[11.5px] uppercase border-b border-border">
                  <th className="py-2.5">ID</th><th>Name</th><th>Class</th><th>Roll No</th><th>Gender</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-none row-hover">
                    <td className="py-2.5 text-muted">{s.id}</td>
                    <td className="font-semibold flex items-center gap-2 py-2.5">
                      <span className="w-7 h-7 rounded-full bg-bg text-brand-blue flex items-center justify-center text-[11px] font-bold">{s.name[0]}</span>
                      {s.name}
                    </td>
                    <td>{s.class}</td>
                    <td>{s.roll}</td>
                    <td>{s.gender}</td>
                    <td className="flex items-center gap-1.5">
                      <Pill>{s.status}</Pill>
                      {s.isTransfer && (
                        <span className="flex items-center gap-1 bg-purple-50 text-brand-purple text-[10.5px] font-semibold px-2 py-1 rounded-full">
                          <ArrowRightLeft size={10} /> Transfer
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-6">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-muted mt-3">Showing {filtered.length} of {students.length} students</div>
        </Card>

        <Card title="Class Distribution">
          <div className="relative flex items-center justify-center h-[120px]">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={dist} dataKey="value" innerRadius={38} outerRadius={58}>
                  {dist.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <div className="font-heading font-bold text-lg">1,248</div>
              <div className="text-[10px] text-muted">Students</div>
            </div>
          </div>
          <div className="space-y-1.5 mt-2 text-[12px]">
            {dist.map((d) => (
              <div key={d.name} className="flex justify-between">
                <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full inline-block" style={{ background: d.color }} />{d.name}</span>
                <b>{d.value}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
