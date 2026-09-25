import { Link } from "react-router-dom";
import { ArrowRightLeft, FileCheck2, School } from "lucide-react";
import Banner from "../../components/Banner";
import StatCard from "../../components/StatCard";
import Card from "../../components/Card";
import Pill from "../../components/Pill";
import { useStudents } from "../../context/StudentsContext";

export default function TransferStudents() {
  const { students } = useStudents();
  const transferred = students.filter((s) => s.isTransfer);

  return (
    <>
      <Banner title="Transfer Students" subtitle="Students admitted via transfer from another school, along with their Transfer Certificate (TC) details." tagline={"Smooth\nSchool Transitions"} />

      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard icon={<ArrowRightLeft size={16} />} iconBg="#8B5CF6" label="Total Transfers" value={transferred.length} delta="this academic year" />
        <StatCard icon={<FileCheck2 size={16} />} iconBg="#12B981" label="TC Verified" value={transferred.length} delta="all documents on file" />
        <StatCard icon={<School size={16} />} iconBg="#F5A524" label="Different Schools" value={new Set(transferred.map((s) => s.transfer?.previousSchool)).size} delta="previous institutions" />
      </div>

      <Card
        title="Transferred Students"
        action={
          <Link to="/students/register" className="bg-brand-blue text-white text-[13px] font-semibold px-4 py-2 rounded-lg btn-tap">
            + Register Transfer Student
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted text-[11.5px] uppercase border-b border-border">
                <th className="py-2.5">Student</th><th>Current Class</th><th>Previous School</th><th>Previous Class</th><th>TC Number</th><th>TC Date</th><th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {transferred.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-none row-hover">
                  <td className="py-2.5 font-semibold flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-bg text-brand-blue flex items-center justify-center text-[11px] font-bold">{s.name[0]}</span>
                    {s.name}
                  </td>
                  <td>{s.class}</td>
                  <td>{s.transfer?.previousSchool || "—"}</td>
                  <td>{s.transfer?.previousClass || "—"}</td>
                  <td>{s.transfer?.tcNumber || "—"}</td>
                  <td>{s.transfer?.tcDate || "—"}</td>
                  <td>{s.transfer?.reason || "—"}</td>
                </tr>
              ))}
              {transferred.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-8">No transfer students yet. Mark "Transfer Student" while registering a new student.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
