import { useState } from "react";
import { Settings as Cog, User, School, BookOpen, Shield, Mail, Bell, Palette, Database, Save, KeyRound } from "lucide-react";
import Banner from "../components/Banner";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { icon: Cog, label: "General Settings", sub: "Basic information and preferences" },
  { icon: User, label: "Profile Settings", sub: "Manage your profile information" },
  { icon: School, label: "School Settings", sub: "School details and configuration" },
  { icon: BookOpen, label: "Academic Settings", sub: "Classes, subjects and terms" },
  { icon: Shield, label: "System Settings", sub: "Security, backup and maintenance" },
  { icon: Mail, label: "Email Settings", sub: "SMTP and notification emails" },
  { icon: Bell, label: "Notification Settings", sub: "Alerts and system notifications" },
  { icon: Palette, label: "Appearance", sub: "Theme, layout and display" },
  { icon: Database, label: "Backup & Restore", sub: "Data backup and recovery" },
];

export default function Settings() {
  const [active, setActive] = useState(0);
  const { user, changePassword } = useAuth();

  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const submitPassword = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!cur || !next) { setMsg({ type: "error", text: "Please fill in all password fields." }); return; }
    if (next.length < 6) { setMsg({ type: "error", text: "New password must be at least 6 characters." }); return; }
    if (next !== confirm) { setMsg({ type: "error", text: "New passwords do not match." }); return; }
    setBusy(true);
    const res = await changePassword(cur, next);
    setBusy(false);
    if (!res.ok) { setMsg({ type: "error", text: res.error }); return; }
    setMsg({ type: "success", text: "Password updated successfully." });
    setCur(""); setNext(""); setConfirm("");
  };

  return (
    <>
      <Banner title="Settings" subtitle="Manage your account, system preferences, school information and customize your experience." tagline={"Customize\nYour School Experience"} />

      <div className="grid grid-cols-[240px_1.6fr_1fr] gap-4">
        <div className="flex flex-col gap-2">
          {tabs.map((t, i) => (
            <div
              key={t.label}
              onClick={() => setActive(i)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer bg-card border ${i === active ? "border-brand-blue" : "border-border"}`}
            >
              <span className="w-9 h-9 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center"><t.icon size={16} /></span>
              <div><div className="text-[13px] font-semibold">{t.label}</div><div className="text-[11px] text-muted">{t.sub}</div></div>
            </div>
          ))}
        </div>

        <Card title="General Settings">
          <p className="text-muted text-[12.5px] -mt-2 mb-4">Update your basic school information and system preferences.</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[12.5px] font-semibold block mb-1.5">School Name *</label><input defaultValue="Smart School Management System" className="w-full border border-border rounded-lg px-3.5 py-2.5 text-[13px]" /></div>
            <div><label className="text-[12.5px] font-semibold block mb-1.5">School Code *</label><input defaultValue="SSMS-001" className="w-full border border-border rounded-lg px-3.5 py-2.5 text-[13px]" /></div>
          </div>
          <div className="mt-4"><label className="text-[12.5px] font-semibold block mb-1.5">Address *</label><input defaultValue="123 Education Street, Karachi, Pakistan" className="w-full border border-border rounded-lg px-3.5 py-2.5 text-[13px]" /></div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div><label className="text-[12.5px] font-semibold block mb-1.5">Phone Number *</label><input defaultValue="+92 312 3456789" className="w-full border border-border rounded-lg px-3.5 py-2.5 text-[13px]" /></div>
            <div><label className="text-[12.5px] font-semibold block mb-1.5">Email Address *</label><input defaultValue="info@smartschool.pk" className="w-full border border-border rounded-lg px-3.5 py-2.5 text-[13px]" /></div>
          </div>
          <button className="mt-5 bg-brand-green text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 btn-tap hover:brightness-105 transition-all"><Save size={14} /> Save Changes</button>

          <div className="border-t border-border mt-6 pt-5">
            <h4 className="font-heading font-semibold text-[14px] mb-1 flex items-center gap-2"><KeyRound size={15} /> Change Password</h4>
            <p className="text-muted text-[12px] mb-3">Signed in as {user?.email}</p>
            <form onSubmit={submitPassword}>
              <div className="grid grid-cols-3 gap-3">
                <input value={cur} onChange={(e) => setCur(e.target.value)} type="password" placeholder="Current Password" className="border border-border rounded-lg px-3.5 py-2.5 text-[13px]" />
                <input value={next} onChange={(e) => setNext(e.target.value)} type="password" placeholder="New Password" className="border border-border rounded-lg px-3.5 py-2.5 text-[13px]" />
                <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="Confirm Password" className="border border-border rounded-lg px-3.5 py-2.5 text-[13px]" />
              </div>
              {msg && (
                <div className={`text-xs mt-3 ${msg.type === "error" ? "text-brand-red" : "text-brand-green"}`}>{msg.text}</div>
              )}
              <button disabled={busy} className="mt-4 bg-navy text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg disabled:opacity-70 btn-tap hover:bg-navy2 transition-colors">
                {busy ? "Updating…" : "Update Password"}
              </button>
            </form>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="System Information">
            {[["Version", "v2.5.0"], ["Last Updated", "Aug 15, 2026"], ["Database", "Connected"], ["Server Status", "Running"]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 text-[13px]"><span className="text-muted">{k}</span><b>{v}</b></div>
            ))}
          </Card>
          <Card title="Support & Help">
            <p className="text-muted text-[12.5px]">Need help? Get support from our team.</p>
            <div className="mt-2 space-y-2 text-[13px] font-semibold text-brand-blue">
              <div>Documentation</div><div>Contact Support</div><div>FAQ</div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
