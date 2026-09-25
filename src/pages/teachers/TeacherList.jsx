import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, Search } from "lucide-react";
import Banner from "../../components/Banner";
import StatCard from "../../components/StatCard";
import Card from "../../components/Card";
import Pill from "../../components/Pill";
import { useTeachers } from "../../context/TeachersContext";

export default function TeacherList() {
  const { teachers } = useTeachers();
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () => teachers.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()) || t.subject.toLowerCase().includes(q.toLowerCase())),
    [teachers, q]
  );
  const active = teachers.filter((t) => t.status === "Active").length;

  return (
    <>
      <Banner title="Teacher List" subtitle="Manage teaching staff, subjects, schedules and performance." tagline={"Teach · Inspire\nMake a Difference"} />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={<Users size={16} />} iconBg="#2F6FED" label="Total Teachers" value={teachers.length} delta="5% vs last month" />
        <StatCard icon={<BookOpen size={16} />} iconBg="#F5A524" label="Subjects Covered" value={new Set(teachers.map((t) => t.subject)).size} delta="2 new this term" />
        <StatCard icon={<Users size={16} />} iconBg="#12B981" label="Active Today" value={active} delta="4% vs yesterday" />
        <StatCard icon={<Users size={16} />} iconBg="#8B5CF6" label="On Leave" value={teachers.filter((t) => t.status === "On Leave").length} delta="1 vs last week" deltaTone="down" />
      </div>

      <Card
        title="Teachers Directory"
        action={
          <Link to="/teachers/register" className="bg-brand-purple text-white text-[13px] font-semibold px-4 py-2 rounded-lg btn-tap hover:brightness-110 transition-all">
            + Add Teacher
          </Link>
        }
      >
        <div className="flex items-center gap-2 bg-bg rounded-lg px-3 py-2 mb-3 max-w-[280px]">
          <Search size={14} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teachers…" className="bg-transparent outline-none text-[13px] flex-1" />
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-muted text-[11.5px] uppercase border-b border-border">
              <th className="py-2.5">Name</th><th>Subject</th><th>Experience</th><th>Classes</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-none row-hover">
                <td className="font-semibold flex items-center gap-2 py-2.5">
                  <span className="w-7 h-7 rounded-full bg-bg text-brand-blue flex items-center justify-center text-[11px] font-bold">{t.name[0]}</span>
                  {t.name}
                </td>
                <td>{t.subject}</td>
                <td>{t.experience}</td>
                <td>{t.classes} classes</td>
                <td><Pill>{t.status}</Pill></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center text-muted py-6">No teachers found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
