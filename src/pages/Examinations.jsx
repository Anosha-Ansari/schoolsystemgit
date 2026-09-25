import { FileText, CheckCircle2, Trophy, GraduationCap } from "lucide-react";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import Banner from "../components/Banner";
import StatCard from "../components/StatCard";
import Card from "../components/Card";
import Pill from "../components/Pill";
import { exams } from "../data/sampleData";

const trend = [
  { m: "Mar", avg: 55, top: 70, low: 30 },
  { m: "Apr", avg: 60, top: 74, low: 34 },
  { m: "May", avg: 63, top: 78, low: 38 },
  { m: "Jun", avg: 68, top: 82, low: 42 },
  { m: "Jul", avg: 72, top: 88, low: 48 },
  { m: "Aug", avg: 78, top: 92, low: 55 },
];

const subjects = [
  { name: "Mathematics", value: 85, color: "#2F6FED" },
  { name: "English", value: 78, color: "#8B5CF6" },
  { name: "Science", value: 72, color: "#12B981" },
  { name: "Urdu", value: 68, color: "#F5A524" },
  { name: "Social Studies", value: 62, color: "#EC4899" },
];

export default function Examinations() {
  return (
    <>
      <Banner title="Examinations Management" subtitle="Create, manage and track exams, results and academic performance." tagline={"Knowledge Builds\nBetter Future"} />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={<FileText size={16} />} iconBg="#2F6FED" label="Total Exams" value="24" delta="8% vs last month" />
        <StatCard icon={<CheckCircle2 size={16} />} iconBg="#12B981" label="Ongoing Exams" value="6" delta="20% vs last week" />
        <StatCard icon={<Trophy size={16} />} iconBg="#8B5CF6" label="Published Results" value="18" delta="15% vs last month" />
        <StatCard icon={<GraduationCap size={16} />} iconBg="#F5A524" label="Average Performance" value="78%" delta="5% vs last month" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <Card title="Examinations List" action={<button className="bg-brand-purple text-white text-[13px] font-semibold px-4 py-2 rounded-lg btn-tap hover:brightness-110 transition-all">+ Create Exam</button>}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted text-[11.5px] uppercase border-b border-border">
                <th className="py-2.5">Exam</th><th>Class</th><th>Subject</th><th>Type</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.name} className="border-b border-border last:border-none row-hover">
                  <td className="py-2.5 font-semibold">{e.name}</td>
                  <td>{e.class}</td>
                  <td>{e.subject}</td>
                  <td>{e.type}</td>
                  <td>{e.date}</td>
                  <td><Pill>{e.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="Exam Performance Overview">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={trend}>
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#6B7590" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#2F6FED" strokeWidth={2.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="top" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="low" stroke="#12B981" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Subject Performance">
            <div className="relative flex items-center justify-center h-[110px]">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={subjects} dataKey="value" innerRadius={34} outerRadius={52}>
                    {subjects.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center"><div className="font-heading font-bold text-base">78%</div></div>
            </div>
            <div className="space-y-1 mt-2 text-[12px]">
              {subjects.map((d) => (
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
