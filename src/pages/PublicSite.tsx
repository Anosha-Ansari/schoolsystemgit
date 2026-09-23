import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  FlaskConical,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Star,
  Trophy,
  Users,
  Utensils,
} from "lucide-react";
import { Avatar, Badge, Button, Card, EmptyState, Field, Input, ProgressBar, Select, Textarea } from "@/components/ui";
import { toast } from "@/lib/store";
import { teachers, SUBJECTS, GRADE_LEVELS, schoolEvents, type Role } from "@/lib/db";
import { cn } from "@/utils/cn";

const img = (id: number, w = 1200) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=${w <= 700 ? 2 : 1}&w=${w}`;

function PublicHero({ image, kicker, title, sub, children }: { image: number; kicker: string; title: string; sub: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200 dark:border-white/8">
      <img src={img(image, 1600)} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950/92 via-primary-900/78 to-analytics-700/55" />
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white">{kicker}</span>
          <h1 className="mt-6 font-display text-[2.2rem] leading-[1.08] font-extrabold text-white sm:text-[3rem]">{title}</h1>
          <p className="mt-5 max-w-2xl text-[0.96rem] leading-relaxed text-white/78">{sub}</p>
          {children && <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>}
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- About */

export function PublicAbout() {
  const values = [
    { icon: <BookOpen className="h-5 w-5" />, t: "Concept-first teaching", d: "Understanding over memorisation, verified through weekly low-stakes assessment." },
    { icon: <Users className="h-5 w-5" />, t: "Small, balanced sections", d: "Maximum 32 students per section with balanced ability distribution." },
    { icon: <BadgeCheck className="h-5 w-5" />, t: "Transparent reporting", d: "Parents see the same live data leadership uses — no surprises at PTM." },
    { icon: <Trophy className="h-5 w-5" />, t: "Character & sport", d: "Every student joins a house, a sport and one co-curricular club." },
  ];
  return (
    <div>
      <PublicHero
        image={35551059}
        kicker="About School"
        title="Twenty-seven years of building confident learners"
        sub="Beaconhouse Smart Campus is a co-educational institution in Karachi serving Grade 1 to Grade 12 across 50+ sections, with an integrated digital campus and a results record of 98% board success."
      >
        <Link to="/admissions" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-[0.86rem] font-bold text-primary-700">
          Admission Now <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/faculty" className="glass inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[0.86rem] font-bold text-white">
          Meet the faculty
        </Link>
      </PublicHero>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-[1.8rem] font-extrabold sm:text-[2.2rem]">Our mission, stated plainly</h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-slate-600 dark:text-slate-400">
              To give every student a rigorous, compassionate education — supported by technology that removes administrative friction
              from teaching. We measure ourselves on three things: learning growth, attendance consistency, and how safe and seen our
              students feel at school.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {values.map((v) => (
                <Card key={v.t} hover className="p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/12 dark:text-primary-300">{v.icon}</span>
                  <p className="mt-4 text-[0.95rem] font-bold">{v.t}</p>
                  <p className="mt-1.5 text-[0.82rem] text-slate-500 dark:text-slate-400">{v.d}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <img src={img(9159039, 900)} alt="Students studying in the campus library" className="w-full rounded-3xl border border-slate-200 object-cover shadow-lift dark:border-white/10" />
            <Card className="p-6">
              <h3 className="text-[1rem] font-bold">Recognition & accreditation</h3>
              <ul className="mt-4 space-y-3">
                {["Affiliated with the Federal Board of Intermediate & Secondary Education", "ISO 27001-aligned information security practices", "Registered science & computer laboratory programme", "Recognised sports academy affiliation (cricket, futsal, athletics)"].map((l) => (
                  <li key={l} className="flex gap-2.5 text-[0.84rem] text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-500" /> {l}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50/70 py-16 dark:border-white/8 dark:bg-white/3">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {[
            { k: "1998", v: "Founded in PECHS, Karachi" },
            { k: "5,000+", v: "Students on roll" },
            { k: "300+", v: "Faculty & support staff" },
            { k: "50+", v: "Class sections" },
          ].map((s) => (
            <Card key={s.v} className="p-6 text-center">
              <p className="font-numeric text-2xl font-extrabold text-primary-600 dark:text-primary-300">{s.k}</p>
              <p className="mt-1.5 text-[0.8rem] text-slate-500 dark:text-slate-400">{s.v}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

/* --------------------------------------------------------- Admissions */

export function PublicAdmissions() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ student: "", dob: "", grade: GRADE_LEVELS[0], guardian: "", phone: "", email: "", previous: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<string | null>(null);
  const steps = ["Student details", "Guardian & contact", "Documents & review"];

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (form.student.trim().length < 3) e.student = "Enter the student's full name";
      if (!form.dob) e.dob = "Date of birth is required";
    }
    if (step === 1) {
      if (form.guardian.trim().length < 3) e.guardian = "Guardian name is required";
      if (!/^[+0-9\s()-]{9,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    const ref = `ADM-${Math.random().toString(36).slice(2, 6).toUpperCase()}${new Date().getFullYear().toString().slice(-2)}`;
    setSubmitted(ref);
    toast.success("Application submitted", `Reference ${ref} — our admissions office will call within 2 working days.`);
  };

  return (
    <div>
      <PublicHero
        image={37758607}
        kicker="Admissions Open · Session 2026–27"
        title="Three steps. One term ahead of the rest."
        sub="Applications are open for Grade 1 to Grade 12. Submit online, upload documents, and track your child's admission status through the parent portal."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="p-6 sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100 text-success-600 dark:bg-success-500/12">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h2 className="mt-5 text-xl font-extrabold">Application received</h2>
                <p className="mt-2 text-[0.86rem] text-slate-500 dark:text-slate-400">
                  Reference <span className="font-numeric font-bold text-primary-600">{submitted}</span> · {form.student} · {form.grade}
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Button variant="primary" onClick={() => { setSubmitted(null); setStep(0); }}>Submit another application</Button>
                  <Link to="/gallery">
                    <Button variant="outline">Take a campus tour</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold">Admission application</h2>
                    <p className="mt-1 text-[0.84rem] text-slate-500 dark:text-slate-400">Step {step + 1} of 3 · {steps[step]}</p>
                  </div>
                  <Badge tone="primary">No application fee</Badge>
                </div>

                <div className="mt-6 flex gap-2">
                  {steps.map((s, i) => (
                    <span key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-primary-500" : "bg-slate-200 dark:bg-white/10")} />
                  ))}
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  {step === 0 && (
                    <>
                      <Field label="Student full name" required error={errors.student} className="sm:col-span-2">
                        <Input value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} placeholder="e.g. Ahmed Raza Khan" />
                      </Field>
                      <Field label="Date of birth" required error={errors.dob}>
                        <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                      </Field>
                      <Field label="Applying for grade">
                        <Select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                          {GRADE_LEVELS.map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Previous school (if any)" className="sm:col-span-2">
                        <Input value={form.previous} onChange={(e) => setForm({ ...form, previous: e.target.value })} placeholder="School name and last grade completed" />
                      </Field>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <Field label="Guardian name" required error={errors.guardian}>
                        <Input value={form.guardian} onChange={(e) => setForm({ ...form, guardian: e.target.value })} placeholder="Parent or guardian" />
                      </Field>
                      <Field label="Mobile number" required error={errors.phone}>
                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 1234567" inputMode="tel" />
                      </Field>
                      <Field label="Email address" error={errors.email} hint="Admission confirmation is emailed here." className="sm:col-span-2">
                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="guardian@email.com" />
                      </Field>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/4">
                        <h3 className="text-[0.9rem] font-bold">Review your application</h3>
                        <dl className="mt-3 grid gap-2 text-[0.84rem] sm:grid-cols-2">
                          {[
                            ["Student", form.student || "—"],
                            ["Grade", form.grade],
                            ["Date of birth", form.dob || "—"],
                            ["Guardian", form.guardian || "—"],
                            ["Phone", form.phone || "—"],
                            ["Email", form.email || "—"],
                            ["Previous school", form.previous || "—"],
                          ].map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-1.5 dark:border-white/8">
                              <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
                              <dd className="font-semibold text-slate-800 dark:text-slate-100">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      <Field label="Anything we should know?" className="sm:col-span-2" hint="Medical needs, siblings in school, transport requirement.">
                        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes for the admissions office" />
                      </Field>
                      <div className="sm:col-span-2 rounded-2xl border border-dashed border-slate-300 p-5 text-[0.82rem] text-slate-500 dark:border-white/12 dark:text-slate-400">
                        <p className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                          <Download className="h-4 w-4 text-primary-500" /> Documents to bring to the interview
                        </p>
                        <p className="mt-2">Birth certificate / B-Form, last transcript or report card, guardian CNIC copy and two photographs.</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {step > 0 && (
                    <Button variant="ghost" onClick={() => setStep(step - 1)}>
                      Back
                    </Button>
                  )}
                  <Button variant="primary" onClick={next} iconRight={<ArrowRight className="h-4 w-4" />}>
                    {step === 2 ? "Submit application" : "Continue"}
                  </Button>
                  <p className="text-[0.78rem] text-slate-400">Applications are reviewed within two working days.</p>
                </div>
              </>
            )}
          </Card>

          <div className="space-y-5">
            <Card className="p-6">
              <h3 className="text-[1rem] font-bold">Admission timeline</h3>
              <ol className="mt-4 space-y-4">
                {[
                  { t: "Online application", d: "Open now for session 2026–27" },
                  { t: "Assessment & interview", d: "Scheduled within 7 days of submission" },
                  { t: "Offer & fee challan", d: "Issued within 48 hours of assessment" },
                  { t: "Confirmation & orientation", d: "Section allocation and booklist handover" },
                ].map((s, i) => (
                  <li key={s.t} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 font-numeric text-[0.72rem] font-bold text-primary-600 dark:bg-primary-500/12 dark:text-primary-300">{i + 1}</span>
                    <span>
                      <span className="block text-[0.88rem] font-semibold text-slate-800 dark:text-slate-100">{s.t}</span>
                      <span className="block text-[0.78rem] text-slate-500 dark:text-slate-400">{s.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
            <Card className="p-6">
              <h3 className="text-[1rem] font-bold">Fee structure (indicative)</h3>
              <div className="mt-4 space-y-3">
                {[
                  { k: "Grade 1–5", v: "Rs 9,800 / month" },
                  { k: "Grade 6–8", v: "Rs 11,400 / month" },
                  { k: "Grade 9–10", v: "Rs 13,200 / month" },
                  { k: "Grade 11–12", v: "Rs 15,600 / month" },
                  { k: "Transport (optional)", v: "Rs 4,500 – 7,500" },
                  { k: "Hostel (optional)", v: "Rs 12,000 – 24,000" },
                ].map((f) => (
                  <div key={f.k} className="flex items-center justify-between border-b border-slate-100 pb-2 text-[0.84rem] last:border-0 dark:border-white/8">
                    <span className="text-slate-600 dark:text-slate-300">{f.k}</span>
                    <span className="font-numeric font-bold text-slate-900 dark:text-white">{f.v}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[0.76rem] text-slate-400">Merit scholarships up to 40% available for 90%+ board results. Sibling discount of Rs 1,500 per additional child.</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------- Academics */

export function PublicAcademics() {
  const [tab, setTab] = useState<"curriculum" | "assessment" | "support">("curriculum");
  return (
    <div>
      <PublicHero
        image={35551044}
        kicker="Academics"
        title="A curriculum that builds thinking, not just scoring"
        sub="Four stages from primary to intermediate, 14 core subjects, lab-based sciences, coding from Grade 6 and continuous assessment instead of exam-only judgement."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "curriculum" as const, label: "Curriculum & Subjects" },
              { id: "assessment" as const, label: "Assessment Model" },
              { id: "support" as const, label: "Learning Support" },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={cn("pill-tab border border-slate-200 dark:border-white/10", tab === t.id && "pill-tab-active border-transparent")}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "curriculum" && (
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="grid gap-3 sm:grid-cols-2">
                {SUBJECTS.map((s) => (
                  <Card key={s} hover className="flex items-center gap-3 p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-[0.7rem] font-bold text-primary-600 dark:bg-primary-500/12 dark:text-primary-300">{s.slice(0, 2).toUpperCase()}</span>
                    <span className="text-[0.86rem] font-semibold text-slate-700 dark:text-slate-200">{s}</span>
                  </Card>
                ))}
              </div>
              <div className="space-y-5">
                {[
                  { t: "Primary (Grade 1–5)", d: "Phonics-led literacy, number sense, Urdu & Islamiyat, general knowledge, art, music and structured play." },
                  { t: "Middle (Grade 6–8)", d: "Integrated science, mathematics, Urdu & English literature, Pakistan Studies, computer science, health & physical education." },
                  { t: "Matriculation (Grade 9–10)", d: "Board-aligned sciences or general group, weekly practical labs, past-paper drills and monthly parent reporting." },
                  { t: "Intermediate (Grade 11–12)", d: "Pre-engineering, pre-medical and commerce streams, plus career counselling, internship placement and university guidance." },
                ].map((c) => (
                  <Card key={c.t} className="p-5">
                    <h3 className="text-[0.96rem] font-bold">{c.t}</h3>
                    <p className="mt-2 text-[0.84rem] leading-relaxed text-slate-500 dark:text-slate-400">{c.d}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "assessment" && (
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Card className="p-6">
                <h3 className="text-[1.05rem] font-bold">Weighted assessment model</h3>
                <div className="mt-6 space-y-5">
                  {[
                    { k: "Terminal examinations", v: 60, tone: "primary" as const },
                    { k: "Assignments & projects", v: 25, tone: "analytics" as const },
                    { k: "Attendance & participation", v: 15, tone: "success" as const },
                  ].map((a) => (
                    <div key={a.k}>
                      <div className="mb-2 flex items-center justify-between text-[0.84rem]">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{a.k}</span>
                        <span className="font-numeric font-bold text-slate-900 dark:text-white">{a.v}%</span>
                      </div>
                      <ProgressBar value={a.v} tone={a.tone} />
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-[0.8rem] text-slate-500 dark:text-slate-400">
                  Grades are computed automatically on the ERP: A+ (90%+), A (80%), B (70%), C (60%), D (50%), E (40%) and F below 40%.
                  Positions are recalculated across the section after every published result.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-[1.05rem] font-bold">Reporting cycle</h3>
                <ul className="mt-5 space-y-4">
                  {[
                    { t: "Weekly", d: "Class test scores and assignment status visible to parents in the portal." },
                    { t: "Monthly", d: "Subject-wise progress card with attendance summary and teacher remarks." },
                    { t: "Terminal", d: "Formal report card, position in section, and PTM slot booking." },
                    { t: "Annual", d: "Full-year transcript, promotion decision and scholarship review." },
                  ].map((r) => (
                    <li key={r.t} className="flex gap-3">
                      <Badge tone="primary">{r.t}</Badge>
                      <span className="text-[0.84rem] leading-relaxed text-slate-600 dark:text-slate-300">{r.d}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {tab === "support" && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: <BookOpen className="h-5 w-5" />, t: "Remedial programme", d: "Grade-level catch-up sessions for students below 50% in any core subject, tracked in the ERP." },
                { icon: <FlaskConical className="h-5 w-5" />, t: "STEM enrichment", d: "Robotics club, science fair pipeline and olympiad preparation for high performers." },
                { icon: <Utensils className="h-5 w-5" />, t: "Health & nutrition", d: "Canteen meal plans with allergy flags stored against every student record." },
                { icon: <Award className="h-5 w-5" />, t: "Scholarships", d: "Merit awards up to 40% and need-based support reviewed each session." },
                { icon: <Clock className="h-5 w-5" />, t: "Counselling cell", d: "Two full-time counsellors, anti-bullying policy and confidential reporting channels." },
                { icon: <Building2 className="h-5 w-5" />, t: "Transition guidance", d: "University and career counselling from Grade 10 onwards with alumni mentorship." },
              ].map((s) => (
                <Card key={s.t} hover className="p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-300">{s.icon}</span>
                  <p className="mt-4 text-[0.94rem] font-bold">{s.t}</p>
                  <p className="mt-1.5 text-[0.82rem] leading-relaxed text-slate-500 dark:text-slate-400">{s.d}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ Faculty */

export function PublicFaculty() {
  const [dept, setDept] = useState("All");
  const depts = ["All", ...Array.from(new Set(teachers.map((t) => t.department)))];
  const list = (dept === "All" ? teachers : teachers.filter((t) => t.department === dept)).slice(0, 12);

  return (
    <div>
      <PublicHero
        image={8199134}
        kicker="Faculty"
        title="300+ educators. One shared standard."
        sub="Every teacher at the campus is observed, mentored and rated through the ERP — with subject-wise performance analytics visible to leadership."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-[1.7rem] font-extrabold">Faculty directory</h2>
            <Select value={dept} onChange={(e) => setDept(e.target.value)} className="w-52">
              {depts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 8) * 0.05 }}>
                <Card hover className="h-full p-5 text-center">
                  <Avatar name={t.name} size={64} className="mx-auto" />
                  <p className="mt-4 text-[0.94rem] font-bold text-slate-800 dark:text-slate-100">{t.name}</p>
                  <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">{t.designation}</p>
                  <p className="mt-2 text-[0.78rem] text-slate-500 dark:text-slate-400">{t.department} · {t.experience} yrs</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {t.subjects.map((s) => (
                      <Badge key={s} tone="muted">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.78rem] font-semibold text-slate-600 dark:text-slate-300">
                    <Star className="h-3.5 w-3.5 fill-secondary-400 text-secondary-400" /> {t.rating} rating
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="mt-12 p-6">
            <h3 className="text-[1rem] font-bold">Department strength</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from(new Set(teachers.map((t) => t.department))).map((d) => {
                const count = teachers.filter((t) => t.department === d).length;
                return (
                  <div key={d} className="rounded-2xl border border-slate-200 p-4 text-center dark:border-white/10">
                    <p className="font-numeric text-xl font-extrabold text-slate-900 dark:text-white">{count}</p>
                    <p className="mt-1 text-[0.74rem] text-slate-500 dark:text-slate-400">{d}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------- Events */

export function PublicEvents() {
  const upcoming = schoolEvents.filter((e) => e.status === "Upcoming");
  const past = schoolEvents.filter((e) => e.status === "Completed");
  return (
    <div>
      <PublicHero image={37758607} kicker="School Events" title="The campus calendar, in public" sub="Sports days, science fairs, parent meetings, excursions and cultural programmes — with registration counts and galleries updated live." />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="font-display text-[1.7rem] font-extrabold">Upcoming events</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {upcoming.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card hover className="flex h-full flex-col p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={e.category === "Sports" ? "success" : e.category === "Academic" ? "primary" : e.category === "Meeting" ? "analytics" : "warn"}>{e.category}</Badge>
                    <span className="flex items-center gap-1.5 text-[0.78rem] font-semibold text-slate-500 dark:text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" /> {e.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-[0.78rem] text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5" /> {e.venue}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[1.06rem] font-bold">{e.title}</h3>
                  <p className="mt-2 flex-1 text-[0.85rem] leading-relaxed text-slate-500 dark:text-slate-400">{e.description}</p>
                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-white/8">
                    <div className="flex items-center justify-between text-[0.78rem] text-slate-500 dark:text-slate-400">
                      <span>Registered {e.registered} / {e.expected}</span>
                      <span className="font-numeric font-bold text-slate-800 dark:text-slate-100">{Math.round((e.registered / e.expected) * 100)}%</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={Math.round((e.registered / e.expected) * 100)} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[0.76rem] text-slate-400">Organiser: {e.organiser}</span>
                      <Link to="/contact">
                        <Button variant="outline" size="sm">
                          Register interest
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <h2 className="mt-16 font-display text-[1.7rem] font-extrabold">Completed events</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {past.map((e) => (
              <Card key={e.id} className="p-5">
                <Badge tone="muted">{e.category}</Badge>
                <p className="mt-3 text-[0.9rem] font-bold text-slate-800 dark:text-slate-100">{e.title}</p>
                <p className="mt-1.5 text-[0.76rem] text-slate-500 dark:text-slate-400">{e.date} · {e.venue}</p>
                <p className="mt-2 text-[0.78rem] text-slate-500 dark:text-slate-400">{e.registered} participants</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ Gallery */

export function PublicGallery() {
  const items = [
    { id: 35551059, t: "Interactive classroom", c: "Academics" },
    { id: 35550999, t: "Digital library", c: "Facilities" },
    { id: 35551044, t: "Biology lab", c: "Labs" },
    { id: 37758607, t: "Senior classroom", c: "Academics" },
    { id: 18650478, t: "Reading programme", c: "Primary" },
    { id: 6209562, t: "Assignment lab", c: "Academics" },
    { id: 37758739, t: "Examination hall", c: "Examinations" },
    { id: 9159039, t: "Library study wing", c: "Facilities" },
    { id: 8199134, t: "Seminar discussion", c: "Academics" },
    { id: 35551010, t: "Geography resources", c: "Labs" },
  ];
  const cats = ["All", ...Array.from(new Set(items.map((i) => i.c)))];
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const list = cat === "All" ? items : items.filter((i) => i.c === cat);

  return (
    <div>
      <PublicHero image={35550999} kicker="Gallery" title="Inside the campus" sub="Classrooms, laboratories, libraries, examination halls and event photography — updated every term." />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={cn("pill-tab border border-slate-200 dark:border-white/10", cat === c && "pill-tab-active border-transparent")}>
                {c}
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {list.map((g, i) => (
              <motion.button
                key={g.id}
                onClick={() => setOpen(i)}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 8) * 0.05 }}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 text-left dark:border-white/10"
              >
                <img src={img(g.id, 700)} alt={g.t} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                <span className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                <span className="absolute inset-x-3 bottom-3">
                  <span className="block text-[0.84rem] font-bold text-white">{g.t}</span>
                  <span className="mt-0.5 block text-[0.7rem] uppercase tracking-wide text-white/70">{g.c}</span>
                </span>
              </motion.button>
            ))}
          </div>

          {list.length === 0 && <EmptyState title="No media in this category" message="Select another category to view campus photography." className="mt-10" />}
        </div>

        {open !== null && list[open] && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/92 p-4" onClick={() => setOpen(null)}>
            <figure className="max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <img src={img(list[open].id, 1600)} alt={list[open].t} className="max-h-[78svh] w-full rounded-2xl object-contain" />
              <figcaption className="mt-4 flex items-center justify-between gap-4">
                <span className="font-display font-bold text-white">{list[open].t}</span>
                <span className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setOpen((o) => (o === null ? null : (o - 1 + list.length) % list.length))}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setOpen((o) => (o === null ? null : (o + 1) % list.length))}>
                    Next
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setOpen(null)}>
                    Close
                  </Button>
                </span>
              </figcaption>
            </figure>
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ Contact */

export function PublicContact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "Admissions enquiry", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.name.trim().length < 3) err.name = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email address";
    if (form.phone && !/^[+0-9\s()-]{9,}$/.test(form.phone)) err.phone = "Enter a valid phone number";
    if (form.message.trim().length < 10) err.message = "Please write at least 10 characters";
    setErrors(err);
    if (Object.keys(err).length) return;
    setSent(true);
    toast.success("Message sent", "Our front office will respond within one working day.");
  };

  return (
    <div>
      <PublicHero image={35551059} kicker="Contact Us" title="Talk to the campus office" sub="Admissions, transport, hostel, examinations or fee queries — reach the right desk directly, or send a message and we will route it for you." />

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            {[
              { icon: <Phone className="h-5 w-5" />, t: "Front office", v: "+92 21 3456 7890", href: "tel:+922134567890" },
              { icon: <Mail className="h-5 w-5" />, t: "Admissions email", v: "admissions@smartschool.pk", href: "mailto:admissions@smartschool.pk" },
              { icon: <MapPin className="h-5 w-5" />, t: "Campus address", v: "Plot 45, Block 6, PECHS, Karachi", href: "https://maps.google.com/?q=PECHS+Block+6+Karachi" },
              { icon: <Clock className="h-5 w-5" />, t: "Office hours", v: "Mon–Sat · 8:00 AM – 4:30 PM" },
            ].map((c) => (
              <Card key={c.t} hover className="flex items-start gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/12 dark:text-primary-300">{c.icon}</span>
                <span>
                  <span className="block text-[0.72rem] font-bold uppercase tracking-wide text-slate-400">{c.t}</span>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="mt-1 block text-[0.92rem] font-semibold text-slate-800 hover:text-primary-600 dark:text-slate-100">
                      {c.v}
                    </a>
                  ) : (
                    <span className="mt-1 block text-[0.92rem] font-semibold text-slate-800 dark:text-slate-100">{c.v}</span>
                  )}
                </span>
              </Card>
            ))}

            <div className="flex gap-2">
              {[<Globe key="f" className="h-4 w-4" />, <Share2 key="i" className="h-4 w-4" />, <MessageCircle key="t" className="h-4 w-4" />].map((icon, i) => (
                <a key={i} href="https://facebook.com" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-primary-400 hover:text-primary-600 dark:border-white/10 dark:text-slate-300">
                  {icon}
                </a>
              ))}
            </div>

            <Card className="overflow-hidden">
              <iframe title="Campus location map" src="https://maps.google.com/maps?q=PECHS%20Block%206%20Karachi&t=&z=14&ie=UTF8&iwloc=&output=embed" loading="lazy" className="h-64 w-full" style={{ border: 0 }} />
            </Card>
          </div>

          <Card className="p-6 sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-100 text-success-600 dark:bg-success-500/12">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h2 className="mt-5 text-xl font-extrabold">Message received</h2>
                <p className="mt-2 max-w-sm text-[0.86rem] text-slate-500 dark:text-slate-400">
                  Thank you {form.name.split(" ")[0]} — our office has logged your query under “{form.subject}” and will reply to {form.email}.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2 className="text-xl font-extrabold">Send us a message</h2>
                <p className="mt-1.5 text-[0.84rem] text-slate-500 dark:text-slate-400">We reply within one working day — usually much sooner.</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Your name" required error={errors.name}>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                  </Field>
                  <Field label="Email" required error={errors.email}>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                  </Field>
                  <Field label="Phone" error={errors.phone}>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 1234567" inputMode="tel" />
                  </Field>
                  <Field label="Subject">
                    <Select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                      {["Admissions enquiry", "Fee & finance", "Transport", "Hostel", "Examinations", "Complaint / feedback", "Careers"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Message" required error={errors.message} className="sm:col-span-2">
                    <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="How can we help?" />
                  </Field>
                </div>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button type="submit" variant="primary" iconRight={<ArrowRight className="h-4 w-4" />}>
                    Send message
                  </Button>
                  <a href="mailto:admissions@smartschool.pk">
                    <Button variant="outline" icon={<Mail className="h-4 w-4" />}>
                      Email directly
                    </Button>
                  </a>
                </div>
              </form>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

export const facultyRoles: Role[] = ["teacher"];
