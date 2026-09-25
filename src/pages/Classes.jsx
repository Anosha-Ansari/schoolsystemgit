import { BookOpen, Users, GraduationCap, Building2 } from "lucide-react";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Link } from "react-router-dom";
import Banner from "../components/Banner";
import StatCard from "../components/StatCard";
import Card from "../components/Card";
import Pill from "../components/Pill";
import { useAcademic } from "../context/AcademicContext";

const perf = [
  { g: "Grade 1", attendance: 30, results: 20 },
  { g: "Grade 2", attendance: 45, results: 35 },
  { g: "Grade 3", attendance: 55, results: 48 },
  { g: "Grade 4", attendance: 60, results: 58 },
  { g: "Grade 5", attendance: 75, results: 65 },
];

export default function Classes() {
  const { classes, sections } = useAcademic();

  const dist = Object.values(
    classes.reduce((acc, c) => {
      const key = c.grade;
      acc[key] = acc[key] || { name: key, value: 0 };
      acc[key].value += c.studentsCount || 0;
      return acc;
    }, {})
  );
  const colors = ["#2F6FED", "#8B5CF6", "#12B981", "#F5A524", "#EC4899", "#94a3b8"];
  const totalStudents = dist.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <Banner title="Classes Management" subtitle="Manage classes, sections, schedules and academic structure efficiently." tagline={"Organized\nLearning Environment"} />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={<BookOpen size={16} />} iconBg="#2F6FED" label="Total Classes" value={classes.length} delta="active classes" />
        <StatCard icon={<Building2 size={16} />} iconBg="#8B5CF6" label="Sections" value={sections.length} delta="configured" />
        <StatCard icon={<GraduationCap size={16} />} iconBg="#F5A524" label="Class Teachers Assigned" value={classes.filter((c) => c.teacher !== "Unassigned").length} delta="of total classes" />
        <StatCard icon={<Users size={16} />} iconBg="#12B981" label="Total Students" value={totalStudents} delta="across all classes" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <Card
          title="Classes Directory"
          action={<Link to="/academic/classes" className="bg-brand-orange text-white text-[13px] font-semibold px-4 py-2 rounded-lg btn-tap hover:brightness-105 transition-all">+ Add Class</Link>}
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted text-[11.5px] uppercase border-b border-border">
                <th className="py-2.5">Class</th><th>Section</th><th>Students</th><th>Teacher</th><th>Room</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-none row-hover">
                  <td className="py-2.5 font-semibold">{c.grade}</td>
                  <td>{c.section}</td>
                  <td>{c.studentsCount}</td>
                  <td>{c.teacher}</td>
                  <td>{c.room}</td>
                  <td><Pill>{c.status}</Pill></td>
                </tr>
              ))}
              {classes.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-6">No classes configured yet.</td></tr>}
            </tbody>
          </table>
        </Card>

        <Card title="Students per Grade">
          {dist.length > 0 ? (
            <>
              <div className="relative flex items-center justify-center h-[120px]">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={dist} dataKey="value" innerRadius={38} outerRadius={58}>
                      {dist.map((d, i) => <Cell key={d.name} fill={colors[i % colors.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <div className="font-heading font-bold text-lg">{totalStudents}</div>
                  <div className="text-[10px] text-muted">Students</div>
                </div>
              </div>
              <div className="space-y-1.5 mt-2 text-[12px]">
                {dist.map((d, i) => (
                  <div key={d.name} className="flex justify-between">
                    <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full inline-block" style={{ background: colors[i % colors.length] }} />{d.name}</span>
                    <b>{d.value}</b>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted text-[13px]">No data yet.</p>
          )}
        </Card>
      </div>

      <Card title="Student Performance by Class" className="mt-4">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={perf}>
            <XAxis dataKey="g" tick={{ fontSize: 11, fill: "#6B7590" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="attendance" stroke="#2F6FED" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="results" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}
