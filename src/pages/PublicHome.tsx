import { useEffect, useState } from "react";
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
  Cpu,
  FlaskConical,
  GraduationCap,
  Library,
  LineChart,
  MessageSquare,
  Phone,
  PlayCircle,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";
import { Avatar, Badge, Button, Card } from "@/components/ui";
import { useCountUp } from "@/lib/store";

/* ------------------------------------------------------------ content */

const heroVideo = "https://videos.pexels.com/video-files/19858732/19858732-hd_1920_1080_60fps.mp4";
const heroPoster = "https://images.pexels.com/videos/19858732/aerial-building-building-avec-drone-building-by-drone-19858732.jpeg?auto=compress&cs=tinysrgb&w=1600";
const img = (id: number, w = 1200) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=${w <= 700 ? 2 : 1}&w=${w}`;

const stats = [
  { label: "Active Students", value: 5000, suffix: "+", icon: <Users className="h-5 w-5" /> },
  { label: "Faculty & Staff", value: 300, suffix: "+", icon: <GraduationCap className="h-5 w-5" /> },
  { label: "Class Sections", value: 50, suffix: "+", icon: <Building2 className="h-5 w-5" /> },
  { label: "Success Rate", value: 98, suffix: "%", icon: <Trophy className="h-5 w-5" /> },
];

const features = [
  { icon: <Users className="h-5 w-5" />, title: "Student Information System", text: "Complete 360° student records — admissions, guardians, documents, houses, transport and hostel allocation." },
  { icon: <CheckCircle2 className="h-5 w-5" />, title: "Smart Attendance", text: "QR, biometric-ready, bulk marking and manual registers with heatmaps, analytics and automatic SMS to guardians." },
  { icon: <Award className="h-5 w-5" />, title: "Examinations & Results", text: "Scheduling, hall allocation, invigilation, marks entry with auto-grading, position lists and one-click publishing." },
  { icon: <Wallet className="h-5 w-5" />, title: "Fee & Finance", text: "Batch challan generation, online payments, receipts, ageing buckets, payroll and revenue analytics." },
  { icon: <MessageSquare className="h-5 w-5" />, title: "Realtime Communication", text: "Socket.io messaging between admin, teachers, students and parents with seen status and typing indicators." },
  { icon: <Sparkles className="h-5 w-5" />, title: "AI Insight Engine", text: "Dropout-risk detection, attendance anomaly scans, fee forecasting and performance recommendations." },
];

const programs = [
  { id: 35551059, title: "Primary School", grades: "Grade 1 – 5", text: "Activity-based learning with phonics, numeracy labs, art, music and structured play.", tone: "primary" as const },
  { id: 35551044, title: "Middle School", grades: "Grade 6 – 8", text: "Concept-first sciences, coding fundamentals, debate, robotics club and inter-house sport.", tone: "analytics" as const },
  { id: 37758739, title: "Matriculation", grades: "Grade 9 – 10", text: "Board-focused preparation with weekly assessments, practical labs and past-paper drills.", tone: "success" as const },
  { id: 8199134, title: "Intermediate", grades: "Grade 11 – 12", text: "Pre-engineering, pre-medical and commerce streams with career counselling and university guidance.", tone: "warn" as const },
];

const facilities = [
  { id: 35550999, title: "Digital Library", text: "42,000 titles, 120 terminals and a silent study wing.", icon: <Library className="h-5 w-5" /> },
  { id: 35551044, title: "Science Labs", text: "Separate physics, chemistry and biology labs with digital apparatus.", icon: <FlaskConical className="h-5 w-5" /> },
  { id: 6209562, title: "Computer Labs", text: "Three labs, 140 workstations, fibre internet and robotics kit stations.", icon: <Cpu className="h-5 w-5" /> },
  { id: 18650478, title: "Learning Resource Centre", text: "Remedial support rooms, counselling cell and reading intervention.", icon: <BookOpen className="h-5 w-5" /> },
  { id: 9159039, title: "Auditorium & Studios", text: "900-seat auditorium, music room, art studio and media lab.", icon: <Star className="h-5 w-5" /> },
  { id: 7683855, title: "Sports Complex", text: "Cricket ground, futsal court, gymnasium and indoor games hall.", icon: <Trophy className="h-5 w-5" /> },
];

const testimonials = [
  { name: "Dr. Shahid Mahmood", role: "Principal", text: "Attendance disputes dropped by 92% within a term. Parents see the same data we do — that transparency changed our culture.", seed: "green" },
  { name: "Ayesha Rehman", role: "Administration Head", text: "Fee challans for 1,100 students used to take four days. It is now a single batch operation with automatic SMS follow-up.", seed: "blue" },
  { name: "Sir Kamran Aslam", role: "Senior Physics Teacher", text: "Marks entry, grade calculation and position lists happen in one screen. I get my evenings back.", seed: "violet" },
  { name: "Nighat Fatima", role: "Parent, Grade 10", text: "I can check attendance, results and fee history from my phone without calling the school once.", seed: "amber" },
];

const news = [
  { date: "12 Feb", title: "Registration open for the Annual Science & Robotics Fair", tag: "Academic" },
  { date: "08 Feb", title: "Pre-Board examination schedule published for Grade 10 & 12", tag: "Examination" },
  { date: "02 Feb", title: "Inter-house cricket final: Green House lifts the trophy", tag: "Sports" },
  { date: "28 Jan", title: "Merit scholarship applications invited for session 2026", tag: "Admissions" },
];

/* --------------------------------------------------------------- page */

function TypingHeadline({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length];
    const speed = deleting ? 40 : 85;
    const t = window.setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length) window.setTimeout(() => setDeleting(true), 1400);
      } else {
        setText(current.slice(0, Math.max(0, text.length - 1)));
        if (text.length === 0) {
          setDeleting(false);
          setIndex((i) => i + 1);
        }
      }
    }, speed);
    return () => window.clearTimeout(t);
  }, [text, deleting, index, words]);

  return (
    <span className="text-gradient">
      {text}
      <span className="ml-0.5 inline-block h-[1em] w-[3px] animate-pulse bg-primary-500 align-middle" />
    </span>
  );
}

function AnimatedStat({ value, suffix, label, icon, delay }: { value: number; suffix: string; label: string; icon: React.ReactNode; delay: number }) {
  const animated = useCountUp(value, 1600);
  return (
    <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay, duration: 0.5 }} className="glass rounded-2xl p-5 text-center sm:text-left">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-primary-600 sm:mx-0 dark:bg-white/10 dark:text-primary-300">{icon}</span>
      <p className="mt-4 font-numeric text-[1.9rem] leading-none font-extrabold text-slate-900 dark:text-white">
        {animated.toLocaleString("en-US")}
        <span className="text-primary-500">{suffix}</span>
      </p>
      <p className="mt-1.5 text-[0.74rem] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    </motion.div>
  );
}

export default function PublicHome() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <div>
      {/* ------------------------------------------------------------ HERO */}
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          src={heroVideo}
          poster={heroPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setVideoReady(true)}
          aria-label="Aerial drone view of the school campus"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950/92 via-primary-900/80 to-analytics-600/55" />
        <div className="bg-grid absolute inset-0 -z-10 opacity-[0.14]" />
        <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-primary-500/30 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-analytics-500/25 blur-3xl animate-blob" />

        {!videoReady && <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-primary-900 to-analytics-700" />}

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pt-32 pb-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-40">
          <div>
            <motion.span initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-success-400 animate-ping-slow" />
                <span className="h-2 w-2 rounded-full bg-success-400" />
              </span>
              Admissions open · Session 2026–27
            </motion.span>

            <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-6 font-display text-[2.4rem] leading-[1.06] font-extrabold text-white sm:text-[3.4rem] lg:text-[4rem]">
              The school that runs on <TypingHeadline words={["intelligence", "clarity", "realtime data", "trust"]} />
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-white/80">
              SmartSchool ERP unifies admissions, academics, attendance, examinations, results, finance, operations and communication —
              with AI-driven insight for every role, from the principal's office to the parent's phone.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/admissions" className="group glass inline-flex items-center gap-2.5 rounded-2xl bg-white/95 px-6 py-3.5 text-[0.86rem] font-bold text-slate-900 transition hover:bg-white">
                Admission Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/academics" className="glass inline-flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-[0.86rem] font-bold text-white transition hover:bg-white/15">
                <PlayCircle className="h-4 w-4" /> Explore Features
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-2 py-3.5 text-[0.86rem] font-bold text-white/85 underline decoration-white/30 underline-offset-4 transition hover:text-white">
                Staff & Parent Login
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-[0.78rem] font-semibold text-white/70">
              {[
                { icon: <BadgeCheck className="h-4 w-4 text-success-400" />, label: "ISO 27001 aligned security" },
                { icon: <ShieldCheck className="h-4 w-4 text-primary-300" />, label: "Role-based access control" },
                { icon: <LineChart className="h-4 w-4 text-secondary-400" />, label: "Realtime analytics" },
              ].map((t) => (
                <span key={t.label} className="flex items-center gap-2">
                  {t.icon}
                  {t.label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Floating dashboard preview */}
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.3, duration: 0.7 }} className="relative">
            <div className="glass-strong rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-secondary-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success-400" />
                </div>
                <Badge tone="success" dot>
                  Live
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { k: "Attendance", v: "94.2%", t: "text-success-500" },
                  { k: "Collected", v: "Rs 8.4M", t: "text-primary-500" },
                  { k: "Avg. Score", v: "78.6%", t: "text-analytics-500" },
                  { k: "At risk", v: "17", t: "text-danger-500" },
                ].map((k) => (
                  <div key={k.k} className="rounded-2xl border border-white/15 bg-white/8 p-3.5">
                    <p className="text-[0.66rem] font-bold uppercase tracking-wide text-white/60">{k.k}</p>
                    <p className={`mt-1 font-numeric text-[1.25rem] font-extrabold ${k.t}`}>{k.v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/15 bg-white/8 p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-wide text-white/60">Attendance trend · 30 days</p>
                <div className="mt-3 flex h-20 items-end gap-1.5">
                  {[62, 70, 66, 78, 74, 82, 88, 84, 90, 86, 92, 88, 94, 90, 96].map((h, i) => (
                    <span key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-primary-500/40 to-secondary-400" style={{ height: `${h}%`, animation: `barGrow 0.9s ${i * 0.05}s cubic-bezier(0.22,1,0.36,1) both`, transformOrigin: "bottom" }} />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/8 p-3.5">
                <Sparkles className="h-5 w-5 text-secondary-400" />
                <p className="text-[0.76rem] leading-snug text-white/85">AI: 17 students at dropout risk — mentor assignment recommended for Grade 9-B.</p>
              </div>
            </div>

            <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="glass-strong absolute -bottom-6 -left-6 hidden rounded-2xl px-4 py-3 sm:block">
              <p className="text-[0.68rem] font-bold uppercase tracking-wide text-white/60">Fee collection</p>
              <p className="font-numeric text-lg font-extrabold text-success-400">+12.4% MoM</p>
            </motion.div>
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} className="glass-strong absolute -top-5 right-2 hidden rounded-2xl px-4 py-3 sm:block">
              <p className="text-[0.68rem] font-bold uppercase tracking-wide text-white/60">Socket.io</p>
              <p className="flex items-center gap-2 font-numeric text-[0.9rem] font-extrabold text-primary-300">
                <span className="h-2 w-2 rounded-full bg-success-400" /> 412 online
              </p>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent dark:from-ink" />
      </section>

      {/* -------------------------------------------------------- STATISTICS */}
      <section className="relative border-b border-slate-200 bg-white py-16 dark:border-white/8 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <AnimatedStat key={s.label} value={s.value} suffix={s.suffix} label={s.label} icon={s.icon} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ ABOUT */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <img src={img(35550999, 1100)} alt="SmartSchool digital library with students studying" className="w-full rounded-3xl border border-slate-200 object-cover shadow-lift dark:border-white/10" />
            <div className="glass-strong absolute -right-4 -bottom-6 hidden w-56 rounded-2xl p-4 sm:block">
              <p className="text-[0.68rem] font-bold uppercase tracking-wide text-slate-400">Established</p>
              <p className="font-numeric text-2xl font-extrabold text-slate-900 dark:text-white">1998</p>
              <p className="mt-1 text-[0.74rem] text-slate-500 dark:text-slate-400">Serving 5,000+ students across 50 sections in Karachi.</p>
            </div>
            <div className="glass absolute -top-4 -left-4 hidden rounded-2xl px-4 py-3 sm:block">
              <p className="flex items-center gap-2 font-numeric text-[0.9rem] font-extrabold text-slate-900 dark:text-white">
                <Star className="h-4 w-4 text-secondary-400" /> 4.9 / 5 parent rating
              </p>
            </div>
          </motion.div>

          <div>
            <Badge tone="primary">School Overview</Badge>
            <h2 className="mt-5 font-display text-[2rem] leading-tight font-extrabold sm:text-[2.5rem]">A campus built around measurable learning outcomes</h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-slate-600 dark:text-slate-400">
              Beaconhouse Smart Campus runs 50+ sections with 300 faculty members, a digital library, six laboratories, three computer labs and an
              integrated sports complex. Every academic, financial and operational process is managed on SmartSchool ERP — so leadership
              decisions are made on live data rather than end-of-term guesswork.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                { k: "98%", v: "Board success rate" },
                { k: "1:22", v: "Teacher to student ratio" },
                { k: "42k", v: "Library titles" },
                { k: "120+", v: "Co-curricular programmes" },
              ].map((s) => (
                <div key={s.v} className="card-saas p-4">
                  <p className="font-numeric text-xl font-extrabold text-primary-600 dark:text-primary-300">{s.k}</p>
                  <p className="mt-1 text-[0.78rem] text-slate-500 dark:text-slate-400">{s.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => (window.location.hash = "#/about")} iconRight={<ArrowRight className="h-4 w-4" />}>
                About the school
              </Button>
              <Button variant="outline" onClick={() => (window.location.hash = "#/faculty")}>
                Meet the faculty
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ WHY CHOOSE US */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-20 dark:border-white/8 dark:bg-white/3 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="analytics">Why Choose Us</Badge>
            <h2 className="mt-5 font-display text-[2rem] leading-tight font-extrabold sm:text-[2.5rem]">Everything the school needs in one platform</h2>
            <p className="mt-4 text-[0.95rem] text-slate-600 dark:text-slate-400">
              Eight modules, seven role-based dashboards and 150+ functional features — designed by educators and engineers together.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Card hover className="group h-full p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/15 to-analytics-500/10 text-primary-600 transition group-hover:scale-110 dark:text-primary-300">{f.icon}</span>
                  <h3 className="mt-5 text-[1.02rem] font-bold">{f.title}</h3>
                  <p className="mt-2.5 text-[0.85rem] leading-relaxed text-slate-500 dark:text-slate-400">{f.text}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- ACADEMIC PROGRAMS */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Badge tone="primary">Academic Programs</Badge>
              <h2 className="mt-5 font-display text-[2rem] leading-tight font-extrabold sm:text-[2.5rem]">Four stages, one continuous pathway</h2>
            </div>
            <Button variant="outline" onClick={() => (window.location.hash = "#/academics")} iconRight={<ArrowRight className="h-4 w-4" />}>
              View curriculum
            </Button>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card hover className="h-full overflow-hidden">
                  <img src={img(p.id, 700)} alt={p.title} loading="lazy" className="h-40 w-full object-cover transition duration-700 hover:scale-105" />
                  <div className="p-5">
                    <Badge tone={p.tone}>{p.grades}</Badge>
                    <h3 className="mt-3 text-[1rem] font-bold">{p.title}</h3>
                    <p className="mt-2 text-[0.82rem] leading-relaxed text-slate-500 dark:text-slate-400">{p.text}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ FACILITIES */}
      <section className="border-y border-slate-200 bg-white py-20 dark:border-white/8 dark:bg-slate-900/40 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="success">Campus Facilities</Badge>
            <h2 className="mt-5 font-display text-[2rem] leading-tight font-extrabold sm:text-[2.5rem]">Infrastructure that supports every learner</h2>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Card hover className="group flex h-full items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-primary-500 group-hover:text-white dark:bg-white/8 dark:text-slate-300">{f.icon}</span>
                  <span>
                    <span className="block text-[0.95rem] font-bold text-slate-800 dark:text-slate-100">{f.title}</span>
                    <span className="mt-1.5 block text-[0.82rem] leading-relaxed text-slate-500 dark:text-slate-400">{f.text}</span>
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- EVENTS */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Badge tone="warn">Events Showcase</Badge>
              <h2 className="mt-5 font-display text-[2rem] leading-tight font-extrabold sm:text-[2.4rem]">Moments that define the school year</h2>
              <div className="mt-8 space-y-4">
                {[
                  { id: 37758607, title: "Annual Sports Day", meta: "24 events · 1,800 attendees", date: "9 Mar" },
                  { id: 35551059, title: "Science & Robotics Fair", meta: "384 registrations", date: "21 Mar" },
                  { id: 8199134, title: "Parent–Teacher Meeting", meta: "Slot-based · 812 parents", date: "4 Mar" },
                ].map((e, i) => (
                  <motion.div key={e.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <Card hover className="flex items-center gap-4 p-3">
                      <img src={img(e.id, 400)} alt={e.title} loading="lazy" className="h-20 w-24 shrink-0 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-primary-500" />
                          <span className="text-[0.72rem] font-bold uppercase tracking-wide text-primary-600 dark:text-primary-300">{e.date}</span>
                        </div>
                        <p className="mt-1 truncate text-[0.92rem] font-bold text-slate-800 dark:text-slate-100">{e.title}</p>
                        <p className="text-[0.76rem] text-slate-500 dark:text-slate-400">{e.meta}</p>
                      </div>
                      <Link to="/events" className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-[0.72rem] font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-600 dark:border-white/10 dark:text-slate-300">
                        Details
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ------------------------------------------------- NEWS */}
            <div>
              <Badge tone="primary">Latest News</Badge>
              <h2 className="mt-5 font-display text-[1.6rem] leading-tight font-extrabold">From the notice board</h2>
              <div className="mt-7 space-y-3">
                {news.map((n, i) => (
                  <motion.div key={n.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                    <Card hover className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-[0.86rem] font-semibold leading-snug text-slate-700 dark:text-slate-200">{n.title}</p>
                        <Badge tone="muted">{n.tag}</Badge>
                      </div>
                      <p className="mt-2 text-[0.72rem] font-bold uppercase tracking-wide text-slate-400">{n.date} 2026</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- TESTIMONIALS */}
      <section className="border-y border-slate-200 bg-slate-50/70 py-20 dark:border-white/8 dark:bg-white/3 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="analytics">Testimonials</Badge>
            <h2 className="mt-5 font-display text-[2rem] leading-tight font-extrabold sm:text-[2.5rem]">Trusted by the people who run the school</h2>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Card className="h-full p-6">
                  <Quote className="h-7 w-7 text-primary-500/40" />
                  <p className="mt-4 text-[0.9rem] leading-relaxed text-slate-600 dark:text-slate-300">“{t.text}”</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-white/8">
                    <Avatar name={t.name} size={40} />
                    <div>
                      <p className="text-[0.88rem] font-bold text-slate-800 dark:text-slate-100">{t.name}</p>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-slate-400">{t.role}</p>
                    </div>
                    <span className="ml-auto flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-secondary-400 text-secondary-400" />
                      ))}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-analytics-600" />
        <div className="bg-dots absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-8">
          <h2 className="mx-auto max-w-3xl font-display text-[2rem] leading-tight font-extrabold text-white sm:text-[2.6rem]">
            Ready to run your school on live data?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[0.98rem] text-white/80">
            Admissions for session 2026–27 are open. Explore the platform with a role-based demo account, or talk to our team about
            deploying SmartSchool ERP at your campus.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/admissions" className="inline-flex items-center gap-2.5 rounded-2xl bg-white px-6 py-3.5 text-[0.88rem] font-bold text-primary-700 transition hover:bg-white/90">
              Apply for Admission <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="glass inline-flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-[0.88rem] font-bold text-white transition hover:bg-white/15">
              <Users className="h-4 w-4" /> Try a demo account
            </Link>
            <a href="tel:+922134567890" className="inline-flex items-center gap-2 px-2 py-3.5 text-[0.88rem] font-bold text-white/90 underline decoration-white/30 underline-offset-4">
              <Phone className="h-4 w-4" /> +92 21 3456 7890
            </a>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: <Utensils className="h-5 w-5" />, t: "Canteen & Mess", d: "Diet plans, allergy flags and hostel meal counts." },
              { icon: <Building2 className="h-5 w-5" />, t: "Multi-campus ready", d: "Tenant isolation with shared academic policies." },
              { icon: <ShieldCheck className="h-5 w-5" />, t: "Audit & compliance", d: "Immutable audit log for every sensitive action." },
            ].map((f) => (
              <div key={f.t} className="glass rounded-2xl p-5 text-left">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">{f.icon}</span>
                <p className="mt-3 text-[0.92rem] font-bold text-white">{f.t}</p>
                <p className="mt-1 text-[0.78rem] text-white/70">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
