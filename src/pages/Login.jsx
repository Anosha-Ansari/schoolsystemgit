import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Mail, Lock, ArrowRight, GraduationCap, ShieldCheck, Sun, Moon, Globe,
  Users, CalendarCheck, FileText, Wallet, BarChart3, Star, Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LOGIN_BG_VIDEO } from "../data/images";
import Logo from "../components/Logo";

const FEATURES = [
  { icon: Users, label: "Student Management", color: "#2F6FED", bg: "#e8f0ff" },
  { icon: GraduationCap, label: "Teacher Management", color: "#8B5CF6", bg: "#f1eafe" },
  { icon: CalendarCheck, label: "Attendance Tracking", color: "#12B981", bg: "#e5f9f1" },
  { icon: FileText, label: "Exam & Marks", color: "#F5A524", bg: "#fff3e0" },
  { icon: Wallet, label: "Fee Management", color: "#EC4899", bg: "#fde8f3" },
  { icon: BarChart3, label: "Reports & Analytics", color: "#0EA5A5", bg: "#e3f7f7" },
];

const BADGES = [
  { icon: GraduationCap, label: "Quality Education" },
  { icon: ShieldCheck, label: "Safe Environment" },
  { icon: Star, label: "Bright Future" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleNote, setGoogleNote] = useState(false);
  const [lang, setLang] = useState("English");
  const { login, user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter both email and password."); return; }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    navigate("/");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-navy">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={LOGIN_BG_VIDEO} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1330f2] via-[#0a1330cc] to-[#0a133055]" />

      <div className="relative z-[1] min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-8 py-6">
          <Logo size="md" light />
          <nav className="hidden lg:flex items-center gap-8 text-[14px] font-semibold text-white/80">
            <span>Learn</span><span>Grow</span><span>Succeed</span>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={toggle} className="w-9 h-9 rounded-full bg-sky-400/20 flex items-center justify-center text-sky-100 hover:bg-sky-400/35 transition-colors btn-tap">
              {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button
              onClick={() => setLang((l) => (l === "English" ? "اردو" : "English"))}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-pink-100 bg-pink-400/20 hover:bg-pink-400/35 transition-colors px-3.5 py-2 rounded-full btn-tap"
            >
              <Globe size={15} /> {lang}
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-10 px-8 lg:px-16 pb-10">
          <div className="max-w-xl text-white">
            <div className="text-brand-orange font-bold text-[12px] tracking-[0.25em] mb-3">WELCOME TO OUR</div>
            <h1 className="font-heading text-5xl lg:text-6xl font-extrabold leading-[1.05] mb-5">
              <span className="text-white">School</span>{" "}
              <span className="bg-gradient-to-r from-sky-300 via-blue-200 to-white bg-clip-text text-transparent">Management</span>{" "}
              <span className="bg-gradient-to-r from-brand-orange via-brand-pink to-brand-purple bg-clip-text text-transparent">System</span>
            </h1>
            <div className="flex items-center gap-3 text-[13px] font-semibold text-white/85 mb-4">
              <span>Smarter Management</span><span className="text-brand-orange">|</span>
              <span>Better Learning</span><span className="text-brand-orange">|</span>
              <span>Brighter Future</span>
            </div>
            <p className="text-white/75 text-[14.5px] mb-7 max-w-md">
              Our School Management System makes it easy to manage students, teachers, classes, attendance, exams and much more — all in one place.
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-lg mb-8">
              {FEATURES.map((f) => (
                <div key={f.label} className="bg-white/10 backdrop-blur rounded-2xl p-3.5 text-center hover:bg-white/20 transition-colors cursor-default">
                  <div className="w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: f.bg }}>
                    <f.icon size={16} style={{ color: f.color }} />
                  </div>
                  <div className="text-[11px] font-semibold text-white/90 leading-tight">{f.label}</div>
                </div>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-6 text-white/80 text-[12px] font-semibold">
              {BADGES.map((b) => (
                <span key={b.label} className="flex items-center gap-1.5">
                  <b.icon size={14} className="text-brand-orange" /> {b.label}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full max-w-[500px] bg-card text-ink rounded-3xl p-11 shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center mx-auto mb-5">
              <GraduationCap size={36} className="text-white" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-center mb-1.5">Welcome Back!</h2>
            <p className="text-muted text-[15px] text-center mb-8">Sign in to your school account</p>

            <form onSubmit={submit}>
              <div className="relative mb-4">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username or Email Address"
                  className="w-full pl-11 pr-4 py-3.5 border border-border rounded-xl text-[15px] bg-bg outline-none focus:border-brand-blue"
                />
              </div>
              <div className="relative mb-2">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Password"
                  className="w-full pl-11 pr-4 py-3.5 border border-border rounded-xl text-[15px] bg-bg outline-none focus:border-brand-blue"
                />
              </div>
              {error && <div className="text-brand-red text-xs mb-2">{error}</div>}
              <div className="flex items-center justify-between text-[13.5px] text-muted my-4">
                <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Remember Me</label>
                <a href="#" className="text-brand-blue font-semibold hover:underline">Forgot Password?</a>
              </div>
              <button
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold text-[16px] flex items-center justify-center gap-2 disabled:opacity-70 btn-tap hover:brightness-110 hover:shadow-lg transition-all"
              >
                <ArrowRight size={17} /> {loading ? "Signing in…" : "Login"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5 text-muted text-[12px]">
              <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={() => { setGoogleNote(true); setTimeout(() => setGoogleNote(false), 4000); }}
              className="w-full py-3.5 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-center gap-2 text-[14px] font-semibold text-amber-800 hover:bg-amber-100 transition-colors btn-tap"
            >
              <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-4.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l6-6C34.6 5.1 29.6 3 24 3c-7.5 0-14 4.2-17.7 10.7z"/><path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4C29.6 36.3 27 37 24 37c-5.4 0-9.9-3.1-11.3-7.9l-6.5 5C9.9 40.6 16.4 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2 3.9-3.7 5.2l6.6 5.4C41.9 35.6 45 30.3 45 24c0-1.4-.1-2.7-.4-3.5z"/></svg>
              Continue with Google
            </button>
            {googleNote && (
              <div className="mt-2 flex items-start gap-1.5 text-[11.5px] text-muted bg-bg rounded-lg px-3 py-2">
                <Info size={13} className="mt-0.5 shrink-0" /> Google sign-in requires a connected backend — coming soon.
              </div>
            )}

            <p className="text-center text-[14px] text-muted mt-6">
              Don't have an account? <Link to="/signup" className="text-brand-blue font-semibold hover:underline">Create one</Link>
            </p>

            <div className="flex items-center justify-center gap-1.5 text-muted text-[11.5px] mt-5">
              <ShieldCheck size={13} /> Secure &amp; encrypted connection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
