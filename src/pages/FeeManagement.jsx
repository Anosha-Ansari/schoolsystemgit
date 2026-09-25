import { Wallet, CheckCircle2, Clock, Users } from "lucide-react";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import Banner from "../components/Banner";
import StatCard from "../components/StatCard";
import Card from "../components/Card";
import Pill from "../components/Pill";
import { fees } from "../data/sampleData";

const trend = [
  { m: "Mar", collected: 0.3, pending: 0.1 },
  { m: "Apr", collected: 0.5, pending: 0.15 },
  { m: "May", collected: 0.8, pending: 0.2 },
  { m: "Jun", collected: 1.1, pending: 0.25 },
  { m: "Jul", collected: 1.5, pending: 0.3 },
  { m: "Aug", collected: 1.98, pending: 0.35 },
];

const byClass = [
  { name: "Grade 1", value: 18, color: "#2F6FED" },
  { name: "Grade 2", value: 22, color: "#8B5CF6" },
  { name: "Grade 3", value: 17, color: "#12B981" },
  { name: "Grade 4", value: 15, color: "#F5A524" },
  { name: "Grade 5", value: 28, color: "#EC4899" },
];

const money = (n) => `PKR ${n.toLocaleString()}`;

export default function FeeManagement() {
  return (
    <>
      <Banner title="Fee Management" subtitle="Track, manage and monitor all student fees, payments and dues in one place." tagline={"Timely Fees\nBuild a Better Future"} />

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={<Wallet size={16} />} iconBg="#2F6FED" label="Total Fees" value="PKR 2,845,000" delta="12% vs last month" />
        <StatCard icon={<CheckCircle2 size={16} />} iconBg="#12B981" label="Collected Amount" value="PKR 1,976,500" delta="18% vs last month" />
        <StatCard icon={<Clock size={16} />} iconBg="#F5A524" label="Pending Amount" value="PKR 868,500" delta="6% vs last month" deltaTone="down" />
        <StatCard icon={<Users size={16} />} iconBg="#8B5CF6" label="Total Students" value="1,248" delta="12% vs last month" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4 mb-4">
        <Card title="Fee Collection Overview">
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={trend}>
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#6B7590" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `PKR ${v}M`} />
              <Line type="monotone" dataKey="collected" stroke="#2F6FED" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="pending" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Fee Collection by Class">
          <div className="relative flex items-center justify-center h-[110px]">
            <ResponsiveContainer width={110} height={110}>
              <PieChart>
                <Pie data={byClass} dataKey="value" innerRadius={34} outerRadius={52}>
                  {byClass.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2 text-[12px]">
            {byClass.map((d) => (
              <div key={d.name} className="flex justify-between">
                <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full inline-block" style={{ background: d.color }} />{d.name}</span>
                <b>{d.value}%</b>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Fee Records" action={<button className="bg-brand-pink text-white text-[13px] font-semibold px-4 py-2 rounded-lg btn-tap hover:brightness-105 transition-all">Export</button>}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-muted text-[11.5px] uppercase border-b border-border">
              <th className="py-2.5">Student</th><th>Class</th><th>Total Fee</th><th>Paid</th><th>Due</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.roll} className="border-b border-border last:border-none row-hover">
                <td className="py-2.5 font-semibold flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-bg text-brand-blue flex items-center justify-center text-[11px] font-bold">{f.name[0]}</span>
                  {f.name}
                </td>
                <td>{f.class}</td>
                <td>{money(f.total)}</td>
                <td className="text-brand-green">{money(f.paid)}</td>
                <td className={f.due ? "text-brand-red" : ""}>{money(f.due)}</td>
                <td><Pill>{f.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
