import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ChevronDown, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../data/roles";
import { SCHOOL_BUILDING_PHOTO } from "../data/images";
import Logo from "../components/Logo";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError("Please fill in all required fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    const res = await signup({ name, email, password, role });
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    navigate("/");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative hidden md:block">
        <img src={SCHOOL_BUILDING_PHOTO} alt="School campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a45f2] via-[#173f9bb3] to-[#2F6FED4d]" />
        <div className="relative z-[1] h-full flex flex-col justify-between p-10 text-white">
          <Logo size="md" light />
          <h1 className="font-heading text-3xl font-extrabold leading-tight">
            Join your school's<br />digital campus today.
          </h1>
          <div />
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          <h1 className="font-heading text-2xl font-bold text-navy mb-1">Create Account</h1>
          <p className="text-muted text-sm mb-6">Register a new account to get started</p>

          <form onSubmit={submit}>
            <label className="text-[12.5px] font-semibold text-ink block mb-1.5">Full Name</label>
            <div className="relative mb-4">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ayesha Khan"
                className="w-full pl-11 pr-4 py-3 border border-border rounded-xl text-sm bg-slate-50 outline-none focus:border-brand-blue" />
            </div>

            <label className="text-[12.5px] font-semibold text-ink block mb-1.5">Email Address</label>
            <div className="relative mb-4">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@smartschool.pk"
                className="w-full pl-11 pr-4 py-3 border border-border rounded-xl text-sm bg-slate-50 outline-none focus:border-brand-blue" />
            </div>

            <label className="text-[12.5px] font-semibold text-ink block mb-1.5">I am registering as</label>
            <div className="relative mb-4">
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none pl-4 pr-9 py-3 border border-border rounded-xl text-sm bg-slate-50 outline-none focus:border-brand-blue font-medium">
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <label className="text-[12.5px] font-semibold text-ink block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Min. 6 characters"
                    className="w-full pl-11 pr-3 py-3 border border-border rounded-xl text-sm bg-slate-50 outline-none focus:border-brand-blue" />
                </div>
              </div>
              <div>
                <label className="text-[12.5px] font-semibold text-ink block mb-1.5">Confirm</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="Repeat password"
                    className="w-full pl-11 pr-3 py-3 border border-border rounded-xl text-sm bg-slate-50 outline-none focus:border-brand-blue" />
                </div>
              </div>
            </div>
            {error && <div className="text-brand-red text-xs mb-2 mt-2">{error}</div>}

            <button disabled={loading} className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-bluedark text-white font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-70">
              <UserPlus size={16} /> {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[13px] text-muted mt-5">
            Already have an account? <Link to="/login" className="text-brand-blue font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
