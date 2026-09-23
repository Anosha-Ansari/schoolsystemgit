import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, BadgeCheck, CheckCircle2, Eye, EyeOff, Globe, KeyRound, Languages, Lock, Mail, Moon, RefreshCw, ShieldCheck, Sun, User } from "lucide-react";
import { Badge, Button, Card, Field, Input, Select } from "@/components/ui";
import { ROLE_MATRIX } from "@/lib/api";
import { auth, ApiError, strengthOf } from "@/lib/api";
import { demoUsers, type Role } from "@/lib/db";
import { queryClient, toast, useAuthStore, useUIStore, useLocalStorage } from "@/lib/store";
import { cn } from "@/utils/cn";

const roles: Role[] = ["super_admin", "admin", "teacher", "student", "parent", "accountant", "librarian"];
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function AuthHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-7">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-[0.78rem] font-bold text-slate-400 transition hover:text-primary-600">
        ← Back to website
      </Link>
      <h1 className="font-display text-[1.7rem] leading-tight font-extrabold">{title}</h1>
      <p className="mt-2 text-[0.86rem] text-slate-500 dark:text-slate-400">{sub}</p>
    </div>
  );
}

/* ------------------------------------------------------------- Login */

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [remember, setRemember] = useLocalStorage("smartschool.remember", true);
  const [form, setForm] = useState({ email: "", password: "", role: "admin" as Role });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [intro, setIntro] = useState(false);
  const { theme, toggleTheme } = useUIStore();

  useEffect(() => {
    const t = window.setTimeout(() => setIntro(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!emailRe.test(form.email)) err.email = "Enter a valid email address";
    if (form.password.length < 6) err.password = "Password must be at least 6 characters";
    setErrors(err);
    setServerError("");
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      const res = await auth.login(form.email, form.password, remember);
      login({ user: res.user, token: res.token, refreshToken: res.refreshToken, remember });
      queryClient.clear();
      toast.success(`Welcome back, ${res.user.name.split(" ")[0]}`, `Signed in as ${ROLE_MATRIX[res.user.role].label} · JWT valid for ${remember ? "7 days" : "12 hours"}.`);
      navigate("/dashboard");
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Unable to sign in right now. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const oauth = async (provider: "google" | "microsoft") => {
    setLoading(true);
    const res = await auth.oauth(provider, form.role);
    login({ user: res.user, token: res.token, refreshToken: res.refreshToken, remember });
    queryClient.clear();
    toast.success(`${provider === "google" ? "Google" : "Microsoft"} sign-in complete`, `Demo SSO mapped to ${ROLE_MATRIX[res.user.role].label}.`);
    navigate("/dashboard");
  };

  const fillDemo = (role: Role) => {
    const user = demoUsers.find((u) => u.role === role);
    if (!user) return;
    setForm({ email: user.email, password: user.password, role });
    setErrors({});
    setServerError("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: intro ? 1 : 0, y: intro ? 0 : 18 }} transition={{ duration: 0.45 }}>
      <AuthHeader title="Sign in to your workspace" sub="Role-based access for administrators, teachers, students, parents, accountants and librarians." />

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {roles.slice(0, 4).map((r) => (
          <button key={r} onClick={() => fillDemo(r)} className={cn("rounded-xl border px-3 py-2 text-left transition", form.role === r ? "border-primary-400 bg-primary-50 dark:bg-primary-500/12" : "border-slate-200 hover:border-primary-300 dark:border-white/10")}>
            <span className="block text-[0.68rem] font-bold uppercase tracking-wide text-slate-400">Demo</span>
            <span className="mt-0.5 block text-[0.78rem] font-bold text-slate-700 dark:text-slate-200">{ROLE_MATRIX[r].label}</span>
          </button>
        ))}
      </div>

      {serverError && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-danger-500/30 bg-danger-100/70 px-4 py-3.5 dark:bg-danger-500/10" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" />
          <p className="text-[0.82rem] text-danger-600 dark:text-danger-400">{serverError}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <Field label="Email address" required error={errors.email}>
          <Input icon={<Mail className="h-4 w-4" />} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@smartschool.pk" />
        </Field>

        <Field label="Password" required error={errors.password}>
          <span className="relative block">
            <Input icon={<Lock className="h-4 w-4" />} type={showPass ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="pr-11" />
            <button type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? "Hide password" : "Show password"} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:hover:text-white">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2.5 text-[0.82rem] text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-primary-500" />
            Remember me for 7 days
          </label>
          <Link to="/forgot-password" className="text-[0.82rem] font-bold text-primary-600 hover:underline dark:text-primary-300">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full" iconRight={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}>
          {loading ? "Authenticating…" : "Sign in securely"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        <span className="text-[0.72rem] font-semibold uppercase tracking-wide text-slate-400">or continue with</span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" onClick={() => oauth("google")} disabled={loading}>
          <Globe /> Google Workspace
        </Button>
        <Button variant="outline" onClick={() => oauth("microsoft")} disabled={loading}>
          <ShieldCheck /> Microsoft 365
        </Button>
      </div>

      <p className="mt-6 text-center text-[0.84rem] text-slate-500 dark:text-slate-400">
        New to SmartSchool?{" "}
        <Link to="/register" className="font-bold text-primary-600 hover:underline dark:text-primary-300">
          Create an account
        </Link>
      </p>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-white/10">
        <span className="flex items-center gap-2 text-[0.76rem] text-slate-500 dark:text-slate-400">
          <BadgeCheck className="h-4 w-4 text-success-500" /> Demo password for all accounts: <span className="font-numeric font-bold">school123</span>
        </span>
        <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------- Register */

export function Register() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "", role: "parent" as Role, terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ email: string; token: string } | null>(null);
  const showPass = strengthOf(form.password);

  const strengthLabel = ["Very weak", "Weak", "Fair", "Strong", "Excellent"][showPass];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.name.trim().length < 3) err.name = "Enter your full name";
    if (!emailRe.test(form.email)) err.email = "Enter a valid email address";
    if (!/^[+0-9\s()-]{9,}$/.test(form.phone)) err.phone = "Enter a valid phone number";
    if (form.password.length < 8) err.password = "Use at least 8 characters";
    if (form.password !== form.confirm) err.confirm = "Passwords do not match";
    if (!form.terms) err.terms = "Please accept the terms to continue";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      const res = await auth.register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone });
      login({ user: res.user, token: res.token, refreshToken: res.refreshToken, remember: true });
      setDone({ email: res.user.email, token: res.verificationToken });
      toast.success("Account created", "A verification link has been queued to your inbox.");
    } catch (error) {
      setErrors({ email: error instanceof ApiError ? error.message : "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <AuthHeader title="Verify your email" sub={`We sent a 6-digit code and magic link to ${done.email}.`} />
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-success-100 text-success-600 dark:bg-success-500/12">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[0.9rem] font-bold">Account created successfully</p>
              <p className="mt-1 text-[0.82rem] text-slate-500 dark:text-slate-400">
                Verification token: <span className="font-numeric font-bold text-primary-600">{done.token}</span>
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => navigate("/verify-email")}>
              Enter verification code
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Skip and open dashboard
            </Button>
          </div>
        </Card>
      </motion.div>
    );

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <AuthHeader title="Create your SmartSchool account" sub="Choose the account type that matches how you use the platform." />
      <form onSubmit={submit} className="space-y-5">
        <Field label="Full name" required error={errors.name}>
          <Input icon={<User className="h-4 w-4" />} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ayesha Rehman" />
        </Field>
        <Field label="Email address" required error={errors.email}>
          <Input icon={<Mail className="h-4 w-4" />} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Mobile number" required error={errors.phone}>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 1234567" inputMode="tel" />
          </Field>
          <Field label="Account type">
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_MATRIX[r].label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password" required error={errors.password} hint={`Strength: ${strengthLabel}`}>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" />
          </Field>
          <Field label="Confirm password" required error={errors.confirm}>
            <Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat password" />
          </Field>
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < showPass ? (showPass >= 3 ? "bg-success-500" : showPass === 2 ? "bg-secondary-400" : "bg-danger-400") : "bg-slate-200 dark:bg-white/10")} />
          ))}
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-[0.8rem] text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} className="mt-0.5 h-4 w-4 rounded accent-primary-500" />
          <span>
            I agree to the platform terms of use and the school's data protection policy.
            {errors.terms && <span className="mt-1 block text-danger-500">{errors.terms}</span>}
          </span>
        </label>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[0.84rem] text-slate-500 dark:text-slate-400">
        Already registered?{" "}
        <Link to="/login" className="font-bold text-primary-600 hover:underline dark:text-primary-300">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

/* ---------------------------------------------------- Forgot / Reset */

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<{ email: string; token: string } | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!seconds) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRe.test(email)) {
      setError("Enter the email registered with the school");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await auth.requestReset(email);
      setSent({ email: res.email, token: res.token });
      setSeconds(45);
      toast.success("Reset link sent", "Check your inbox — the link expires in 15 minutes.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <AuthHeader title="Reset your password" sub="Enter your registered email and we will send a secure reset link." />
      {sent ? (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/12">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[0.9rem] font-bold">Link sent to {sent.email}</p>
              <p className="mt-1 text-[0.82rem] text-slate-500 dark:text-slate-400">
                Demo token: <span className="font-numeric font-bold text-primary-600">{sent.token}</span>
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/reset-password?token=${sent.token}`}>
              <Button variant="primary">Open reset form</Button>
            </Link>
            <Button variant="outline" onClick={submit} disabled={seconds > 0} icon={<RefreshCw className="h-4 w-4" />}>
              {seconds > 0 ? `Resend in ${seconds}s` : "Resend link"}
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <Field label="Registered email" required error={error}>
            <Input icon={<Mail className="h-4 w-4" />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@smartschool.pk" />
          </Field>
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-[0.84rem] text-slate-500 dark:text-slate-400">
            <Link to="/login" className="font-bold text-primary-600 hover:underline dark:text-primary-300">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </motion.div>
  );
}

export function ResetPassword() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const token = useMemo(() => new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("token") ?? "reset_demo", []);
  const strength = strengthOf(form.password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.password.length < 8) err.password = "Use at least 8 characters with a number and symbol";
    if (form.password !== form.confirm) err.confirm = "Passwords do not match";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    await auth.resetPassword(token, form.password);
    setDone(true);
    setLoading(false);
    toast.success("Password updated", "You can now sign in with your new password.");
  };

  if (done)
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <AuthHeader title="Password updated" sub="Your new password is active across all devices." />
        <Card className="p-6">
          <p className="flex items-center gap-2 text-[0.86rem] font-semibold text-success-600 dark:text-success-400">
            <CheckCircle2 className="h-4 w-4" /> All previous sessions have been signed out.
          </p>
          <Button
            variant="primary"
            className="mt-6"
            onClick={() => {
              const admin = demoUsers[1];
              login({ user: admin, token: "demo.reset.sig", refreshToken: "demo", remember: true });
              navigate("/dashboard");
            }}
          >
            Sign in to dashboard
          </Button>
        </Card>
      </motion.div>
    );

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <AuthHeader title="Choose a new password" sub="Use a strong password you have not used elsewhere on the platform." />
      <form onSubmit={submit} className="space-y-5">
        <Field label="New password" required error={errors.password} hint={`Strength: ${["Very weak", "Weak", "Fair", "Strong", "Excellent"][strength]}`}>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" />
        </Field>
        <Field label="Confirm new password" required error={errors.confirm}>
          <Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Repeat password" />
        </Field>
        <div className="grid gap-2 rounded-2xl border border-slate-200 p-4 text-[0.78rem] text-slate-500 dark:border-white/10 dark:text-slate-400">
          {[
            { ok: form.password.length >= 8, t: "At least 8 characters" },
            { ok: /[A-Z]/.test(form.password), t: "One uppercase letter" },
            { ok: /[0-9]/.test(form.password), t: "One number" },
            { ok: /[^A-Za-z0-9]/.test(form.password), t: "One symbol" },
          ].map((r) => (
            <span key={r.t} className={cn("flex items-center gap-2", r.ok && "text-success-600 dark:text-success-400")}>
              <CheckCircle2 className="h-3.5 w-3.5" /> {r.t}
            </span>
          ))}
        </div>
        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </motion.div>
  );
}

/* -------------------------------------------------------- Verification */

export function VerifyEmail() {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (!seconds) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);

  const setDigit = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    setCode((c) => c.map((x, idx) => (idx === i ? digit : x)));
    if (digit && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const joined = code.join("");
    if (joined.length < 6) {
      setError("Enter all six digits from the email");
      return;
    }
    setError("");
    setLoading(true);
    await auth.verifyEmail(`verify_${joined}`);
    setVerified(true);
    setLoading(false);
    toast.success("Email verified", "Your account is now fully activated.");
  };

  if (verified)
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <AuthHeader title="Email verified" sub="Welcome aboard — your workspace is ready." />
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-success-100 text-success-600 dark:bg-success-500/12">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[0.9rem] font-bold">Verification complete</p>
              <p className="mt-1 text-[0.82rem] text-slate-500 dark:text-slate-400">Two-factor authentication can now be enabled from Settings → Security.</p>
            </div>
          </div>
          <Button variant="primary" className="mt-6" onClick={() => navigate("/dashboard")}>
            Open dashboard
          </Button>
        </Card>
      </motion.div>
    );

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <AuthHeader title="Enter the 6-digit code" sub="Codes expire after 15 minutes. Check your spam folder if it has not arrived." />
      <Card className="p-6">
        <form onSubmit={submit}>
          <div className="flex justify-between gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                value={digit}
                onChange={(e) => setDigit(i, e.target.value)}
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${i + 1}`}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white text-center font-numeric text-xl font-bold text-slate-900 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/12 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            ))}
          </div>
          {error && <p className="mt-3 text-[0.78rem] font-semibold text-danger-500">{error}</p>}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="mt-6 w-full">
            {loading ? "Verifying…" : "Verify email"}
          </Button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[0.8rem] text-slate-500 dark:text-slate-400">
          <span>Didn't receive the code?</span>
          <Button variant="ghost" size="sm" disabled={seconds > 0} onClick={() => { setSeconds(60); toast.info("Code resent", "A fresh 6-digit code has been queued."); }}>
            {seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
          </Button>
        </div>

        <p className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-3 text-[0.76rem] text-slate-500 dark:border-white/10 dark:text-slate-400">
          <Languages className="h-4 w-4 text-primary-500" /> Demo mode: any 6 digits verify successfully.
        </p>
        <Badge tone="primary" className="mt-4">
          Secure session · JWT + refresh rotation enabled
        </Badge>
      </Card>
    </motion.div>
  );
}
