import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlarmClock,
  BarChart3,
  Bell,
  BookOpen,
  Bus,
  CalendarDays,
  ChevronDown,
  ChevronsLeft,
  ClipboardList,
  Command,
  CreditCard,
  FileBarChart2,
  GraduationCap,
  Home,
  LayoutDashboard,
  Library,
  LogOut,
  Mail,
  MessageSquare,
  Moon,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  UserCog,
  BedDouble,
  FileClock,
  ArrowRight,
  Radio,
  Menu,
  X,
  ScrollText,
  Languages,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { students, teachers, CLASS_NAMES, demoUsers, type Role } from "@/lib/db";
import { ROLE_MATRIX, can, type Permission } from "@/lib/api";
import { queryClient, useAuthStore, useShellStore, useUIStore, toast } from "@/lib/store";
import { Avatar, Badge, Button, IconButton, LockedNotice, Modal, Toaster } from "@/components/ui";

/* ----------------------------------------------------------- nav model */

type NavChild = { label: string; to: string; icon: ReactNode; perm?: Permission };
type NavGroup = { id: string; label: string; items: NavChild[] };

export const NAV: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: "AI Insights", to: "/ai-insights", icon: <Sparkles className="h-4 w-4" />, perm: "ai:read" },
      { label: "Analytics Studio", to: "/analytics", icon: <BarChart3 className="h-4 w-4" />, perm: "reports:read" },
    ],
  },
  {
    id: "academics",
    label: "Academics",
    items: [
      { label: "Students", to: "/students", icon: <Users className="h-4 w-4" />, perm: "students:read" },
      { label: "Teachers & Staff", to: "/teachers", icon: <UserCog className="h-4 w-4" />, perm: "teachers:read" },
      { label: "Classes & Timetable", to: "/classes", icon: <GraduationCap className="h-4 w-4" />, perm: "students:read" },
      { label: "Attendance", to: "/attendance", icon: <ClipboardList className="h-4 w-4" />, perm: "attendance:read" },
      { label: "Examinations", to: "/examinations", icon: <ScrollText className="h-4 w-4" />, perm: "exams:read" },
      { label: "Results", to: "/results", icon: <FileBarChart2 className="h-4 w-4" />, perm: "exams:read" },
      { label: "Assignments", to: "/assignments", icon: <BookOpen className="h-4 w-4" />, perm: "students:read" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { label: "Fee Management", to: "/fees", icon: <CreditCard className="h-4 w-4" />, perm: "fees:read" },
      { label: "Payroll", to: "/payroll", icon: <AlarmClock className="h-4 w-4" />, perm: "teachers:read" },
      { label: "Reports Centre", to: "/reports", icon: <FileBarChart2 className="h-4 w-4" />, perm: "reports:read" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { label: "Library", to: "/library", icon: <Library className="h-4 w-4" />, perm: "library:read" },
      { label: "Transport", to: "/transport", icon: <Bus className="h-4 w-4" />, perm: "transport:read" },
      { label: "Hostel", to: "/hostel", icon: <BedDouble className="h-4 w-4" />, perm: "hostel:read" },
      { label: "Events", to: "/events-admin", icon: <CalendarDays className="h-4 w-4" />, perm: "events:read" },
      { label: "Calendar", to: "/calendar", icon: <CalendarDays className="h-4 w-4" /> },
      { label: "Audit Log", to: "/audit", icon: <FileClock className="h-4 w-4" />, perm: "audit:read" },
    ],
  },
  {
    id: "communication",
    label: "Communication",
    items: [
      { label: "Notice Board", to: "/notices", icon: <Bell className="h-4 w-4" />, perm: "notices:read" },
      { label: "Messages", to: "/messages", icon: <MessageSquare className="h-4 w-4" />, perm: "messages:read" },
      { label: "Parent Portal", to: "/parent", icon: <Home className="h-4 w-4" /> },
      { label: "Student Portal", to: "/my", icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { label: "Roles & Permissions", to: "/roles", icon: <ShieldCheck className="h-4 w-4" />, perm: "users:manage" },
      { label: "Settings", to: "/settings", icon: <Settings className="h-4 w-4" />, perm: "settings:write" },
      { label: "System Health", to: "/system", icon: <Activity className="h-4 w-4" />, perm: "settings:write" },
    ],
  },
];

export const visibleNav = (role: Role) =>
  NAV.map((g) => ({ ...g, items: g.items.filter((i) => !i.perm || can(role, i.perm)) })).filter((g) => g.items.length > 0);

/* -------------------------------------------------------------- Brand */

export function BrandMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span className={cn("relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-analytics-500 text-white shadow-[0_12px_30px_-14px_rgba(15,95,255,0.95)]", className)} style={{ width: size, height: size }}>
      <GraduationCap className="h-[55%] w-[55%]" />
      <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white bg-success-500 dark:border-ink" />
    </span>
  );
}

/* ------------------------------------------------------ Public layout */

const publicLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Admissions", to: "/admissions" },
  { label: "Academics", to: "/academics" },
  { label: "Faculty", to: "/faculty" },
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
];

export function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-surface dark:bg-ink">
      <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled ? "glass-strong py-2" : "py-3.5")}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark />
            <span className="leading-none">
              <span className="block font-display text-[1.02rem] font-extrabold tracking-tight text-slate-900 dark:text-white">SmartSchool ERP</span>
              <span className="mt-0.5 block text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-slate-400">School Management Suite</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {publicLinks.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) => cn("rounded-xl px-3.5 py-2 text-[0.82rem] font-semibold transition", isActive ? "bg-primary-50 text-primary-700 dark:bg-primary-500/14 dark:text-white" : "text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white")}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <IconButton label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </IconButton>
            {user ? (
              <Button variant="primary" size="sm" onClick={() => (window.location.hash = "#/dashboard")}>
                Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => (window.location.hash = "#/login")} className="hidden sm:inline-flex">
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => (window.location.hash = "#/register")}>
                  Get Started
                </Button>
              </>
            )}
            <IconButton label="Toggle navigation" className="xl:hidden" onClick={() => setOpen((v) => !v)}>
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </IconButton>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="glass-strong mx-5 mt-3 overflow-hidden rounded-2xl p-2 xl:hidden">
              {publicLinks.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} className="block rounded-xl px-4 py-3 text-[0.86rem] font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/8">
                    {l.label}
                  </NavLink>
                </li>
              ))}
              <li className="mt-2 flex gap-2 p-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => (window.location.hash = "#/login")}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" className="flex-1" onClick={() => (window.location.hash = "#/register")}>
                  Register
                </Button>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-20">
        <Outlet />
      </main>

      <PublicFooter />
      <Toaster />
    </div>
  );
}

function PublicFooter() {
  const cols = [
    { title: "Platform", links: [{ label: "Dashboard", to: "/dashboard" }, { label: "Academics", to: "/academics" }, { label: "Admissions", to: "/admissions" }, { label: "AI Insights", to: "/ai-insights" }] },
    { title: "School", links: [{ label: "About", to: "/about" }, { label: "Faculty", to: "/faculty" }, { label: "Events", to: "/events" }, { label: "Gallery", to: "/gallery" }] },
    { title: "Access", links: [{ label: "Login", to: "/login" }, { label: "Register", to: "/register" }, { label: "Forgot Password", to: "/forgot-password" }, { label: "Verify Email", to: "/verify-email" }] },
  ];
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-white/8 dark:bg-slate-900/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark />
            <span className="font-display text-[1.05rem] font-extrabold text-slate-900 dark:text-white">SmartSchool ERP</span>
          </div>
          <p className="mt-5 max-w-sm text-[0.85rem] leading-relaxed text-slate-500 dark:text-slate-400">
            An enterprise school management suite covering academics, attendance, examinations, finance, operations, communication and
            AI-driven insight — deployed on Next.js, Node/Express, MongoDB and Socket.io.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="primary">SOC2-ready</Badge>
            <Badge tone="success">99.98% uptime</Badge>
            <Badge tone="analytics">v4.2.0</Badge>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-slate-400">{c.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[0.84rem] text-slate-600 transition hover:text-primary-600 dark:text-slate-300 dark:hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 py-5 dark:border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-[0.75rem] text-slate-400 sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} SmartSchool ERP. Final Year Project — Enterprise School Management System.</p>
          <p className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-success-500" /> Realtime services operational
          </p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------- Auth layout */

export function AuthLayout() {
  const { theme, toggleTheme } = useUIStore();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-slate-900 lg:block">
        <img src="https://images.pexels.com/photos/35551059/pexels-photo-35551059.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1400" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700/85 via-slate-900/85 to-analytics-600/60" />
        <div className="bg-dots absolute inset-0 opacity-25" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark size={46} />
            <span className="font-display text-xl font-extrabold text-white">SmartSchool ERP</span>
          </Link>

          <div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md font-display text-[2.1rem] leading-tight font-extrabold text-white">
              One platform for the entire school operation.
            </motion.h2>
            <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-white/75">
              Admissions, academics, attendance, examinations, results, fees, payroll, library, transport, hostel, messaging and AI
              insight — with role-based access for seven user types.
            </p>
            <div className="mt-9 grid max-w-md grid-cols-2 gap-4">
              {[
                { k: "1,100+", v: "Screens shipped" },
                { k: "150+", v: "Functional features" },
                { k: "7", v: "Role dashboards" },
                { k: "99.98%", v: "Platform uptime" },
              ].map((s) => (
                <div key={s.v} className="glass rounded-2xl px-4 py-3">
                  <p className="font-numeric text-lg font-bold text-white">{s.k}</p>
                  <p className="text-[0.7rem] uppercase tracking-wide text-white/60">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[0.72rem] text-white/45">© {new Date().getFullYear()} SmartSchool ERP · Karachi, Pakistan</p>
        </div>
      </div>

      <div className="relative flex flex-col justify-center bg-surface px-6 py-12 dark:bg-ink sm:px-12">
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <IconButton label="Toggle theme" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </IconButton>
        </div>
        <div className="mx-auto w-full max-w-md">
          <Outlet />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

/* --------------------------------------------------- Dashboard shell */

function SidebarNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "student";
  const groups = useMemo(() => visibleNav(role), [role]);
  const { pathname } = useLocation();

  return (
    <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 pb-6">
      {groups.map((g, gi) => (
        <div key={g.id}>
          {!collapsed && <p className="mb-2 px-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{g.label}</p>}
          {collapsed && gi > 0 && <div className="mx-auto my-3 h-px w-8 bg-slate-200 dark:bg-white/10" />}
          <ul className="space-y-1">
            {g.items.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <NavLink to={item.to} onClick={onNavigate} title={collapsed ? item.label : undefined} className={cn("group nav-item", active && "nav-item-active", collapsed && "justify-center px-2")}>
                    {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-primary-50 dark:bg-primary-500/14" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    <span className={cn("relative z-10 shrink-0", active ? "text-primary-600 dark:text-primary-300" : "text-slate-400 group-hover:text-primary-500")}>{item.icon}</span>
                    {!collapsed && <span className="relative z-10 truncate">{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const language = useAuthStore((s) => s.language);
  const setLanguage = useAuthStore((s) => s.setLanguage);
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useUIStore();
  const { commandOpen, setCommandOpen, notifOpen, setNotifOpen, mobileNavOpen, setMobileNavOpen, notifications, markAllRead } = useShellStore();
  const [userMenu, setUserMenu] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
    setUserMenu(false);
  }, [pathname, setMobileNavOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen]);

  if (!user) return <Navigate to="/login" replace />;
  const unread = notifications.filter((n) => !n.read).length;

  const switchRole = (role: Role) => {
    const target = demoUsers.find((u) => u.role === role);
    if (!target) return;
    useAuthStore.getState().login({ user: target, token: `demo.${btoa(target.role)}.sig`, refreshToken: "demo-refresh", remember: false });
    queryClient.clear();
    toast.info(`Viewing as ${ROLE_MATRIX[role].label}`, "Role-based menus and permissions have been updated.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-ink">
      <motion.aside
        animate={{ width: sidebarCollapsed ? 78 : 268 }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white lg:flex dark:border-white/8 dark:bg-slate-900/70"
      >
        <div className={cn("flex items-center gap-3 px-4 py-4", sidebarCollapsed && "justify-center px-2")}>
          <Link to="/dashboard" className="flex items-center gap-3">
            <BrandMark size={40} />
            {!sidebarCollapsed && (
              <span className="leading-none">
                <span className="block font-display text-[0.98rem] font-extrabold text-slate-900 dark:text-white">SmartSchool</span>
                <span className="mt-0.5 block text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-slate-400">ERP Suite</span>
              </span>
            )}
          </Link>
        </div>

        <div className={cn("mx-3 mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/8 dark:bg-white/4", sidebarCollapsed && "px-2")}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <Avatar name={user.name} size={34} />
              <div className="min-w-0">
                <p className="truncate text-[0.8rem] font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                <p className="truncate text-[0.66rem] font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">{ROLE_MATRIX[user.role].label}</p>
              </div>
            </div>
          ) : (
            <Avatar name={user.name} size={30} className="mx-auto" />
          )}
        </div>

        <SidebarNav collapsed={sidebarCollapsed} />

        <div className="border-t border-slate-200 p-3 dark:border-white/8">
          {!sidebarCollapsed ? (
            <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-4 text-white">
              <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-wide">
                <Sparkles className="h-3.5 w-3.5" /> AI Copilot
              </p>
              <p className="mt-2 text-[0.74rem] leading-relaxed text-white/85">17 students flagged at risk. Review recommended interventions.</p>
              <Link to="/ai-insights" className="mt-3 inline-flex items-center gap-1.5 text-[0.72rem] font-bold underline underline-offset-4">
                Open insights <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <Link to="/ai-insights" className="flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white" title="AI Insights">
              <Sparkles className="h-5 w-5" />
            </Link>
          )}
          <button onClick={toggleSidebar} className="mt-3 hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[0.74rem] font-semibold text-slate-500 transition hover:bg-slate-100 lg:flex dark:text-slate-400 dark:hover:bg-white/6">
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /> Collapse</>}
          </button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="scrim" onClick={() => setMobileNavOpen(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", stiffness: 340, damping: 34 }} className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-slate-200 bg-white dark:border-white/8 dark:bg-slate-900">
              <div className="flex items-center justify-between px-4 py-4">
                <Link to="/dashboard" className="flex items-center gap-3">
                  <BrandMark />
                  <span className="font-display font-extrabold text-slate-900 dark:text-white">SmartSchool</span>
                </Link>
                <IconButton label="Close navigation" onClick={() => setMobileNavOpen(false)}>
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
              <SidebarNav collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-300", sidebarCollapsed ? "lg:pl-[78px]" : "lg:pl-[268px]")}>
        <header className="glass-strong sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 sm:px-6">
          <IconButton label="Open navigation" className="lg:hidden" onClick={() => setMobileNavOpen(true)}>
            <Menu className="h-4 w-4" />
          </IconButton>

          <button
            onClick={() => setCommandOpen(true)}
            className="group flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-[0.82rem] text-slate-400 transition hover:border-primary-300 dark:border-white/10 dark:bg-white/5"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 truncate">Search students, staff, classes, or jump to a module…</span>
            <span className="hidden items-center gap-1 rounded-lg border border-slate-200 px-2 py-0.5 font-numeric text-[0.68rem] font-bold text-slate-400 sm:flex dark:border-white/10">
              <Command className="h-3 w-3" /> K
            </span>
          </button>

          <span className="hidden items-center gap-2 rounded-xl border border-success-500/25 bg-success-100 px-3 py-2 text-[0.7rem] font-bold text-success-600 lg:flex dark:bg-success-500/12 dark:text-success-400">
            <Radio className="h-3.5 w-3.5" /> Socket.io connected
          </span>

          <IconButton
            label="Switch language"
            onClick={() => {
              setLanguage(language === "en" ? "ur" : "en");
              toast.info(language === "en" ? "اردو زبان منتخب کی گئی ہے" : "Language set to English");
            }}
          >
            <span className="flex items-center gap-1">
              <Languages className="h-4 w-4" />
              <span className="text-[0.66rem] font-bold">{language === "en" ? "EN" : "UR"}</span>
            </span>
          </IconButton>

          <IconButton label="Toggle theme" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </IconButton>

          <IconButton label="Notifications" onClick={() => setNotifOpen(true)}>
            <span className="relative">
              <Bell className="h-4 w-4" />
              {unread > 0 && <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 font-numeric text-[0.6rem] font-bold text-white">{unread}</span>}
            </span>
          </IconButton>

          <div className="relative">
            <button onClick={() => setUserMenu((v) => !v)} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 transition hover:border-primary-300 dark:border-white/10 dark:bg-white/5">
              <Avatar name={user.name} size={28} />
              <span className="hidden leading-none sm:block">
                <span className="block text-[0.78rem] font-bold text-slate-800 dark:text-slate-100">{user.name.split(" ").slice(0, 2).join(" ")}</span>
                <span className="mt-0.5 block text-[0.62rem] font-semibold uppercase tracking-wide text-slate-400">{ROLE_MATRIX[user.role].label}</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {userMenu && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="glass-strong absolute right-0 z-50 mt-2 w-72 rounded-2xl p-2">
                  <div className="border-b border-slate-200/70 px-3 py-3 dark:border-white/10">
                    <p className="text-[0.86rem] font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[0.74rem] text-slate-500 dark:text-slate-400">{user.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="primary">{ROLE_MATRIX[user.role].label}</Badge>
                      <Badge tone={user.emailVerified ? "success" : "warn"}>{user.emailVerified ? "Verified" : "Unverified"}</Badge>
                    </div>
                  </div>

                  <div className="px-3 py-2.5">
                    <p className="mb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-400">Demo: switch role</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(ROLE_MATRIX) as Role[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => switchRole(r)}
                          className={cn("rounded-lg px-2 py-1.5 text-left text-[0.68rem] font-semibold transition", user.role === r ? "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/8")}
                        >
                          {ROLE_MATRIX[r].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200/70 pt-1.5 dark:border-white/10">
                    <Link to="/settings" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/8">
                      <Settings className="h-4 w-4" /> Account settings
                    </Link>
                    <Link to="/messages" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/8">
                      <Mail className="h-4 w-4" /> Inbox
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        toast.info("Signed out", "Your session token has been revoked.");
                        navigate("/login");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[0.82rem] font-medium text-danger-500 transition hover:bg-danger-100/60 dark:hover:bg-danger-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <motion.main key={pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </motion.main>

        <footer className="border-t border-slate-200 px-6 py-4 text-[0.72rem] text-slate-400 dark:border-white/8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>SmartSchool ERP v4.2.0 · Tenant BCS-KHI-01 · ap-south-1</p>
            <p className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-success-500" /> All services operational · backup service degraded
            </p>
          </div>
        </footer>
      </div>

      <NotifDrawer open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notifications} markAllRead={markAllRead} />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <Toaster />
    </div>
  );
}

function NotifDrawer({ open, onClose, notifications, markAllRead }: { open: boolean; onClose: () => void; notifications: { id: string; title: string; body: string; at: string; read: boolean; tone: string }[]; markAllRead: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="scrim" onClick={onClose} />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 340, damping: 36 }} className="glass-strong absolute top-0 right-0 flex h-full w-full max-w-md flex-col">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
              <div>
                <h3 className="text-[1rem] font-bold">Notifications</h3>
                <p className="text-[0.74rem] text-slate-500 dark:text-slate-400">Realtime events from across the campus</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={markAllRead}>
                  Mark all read
                </Button>
                <IconButton label="Close notifications" onClick={onClose}>
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {notifications.map((n) => (
                <div key={n.id} className={cn("rounded-2xl border p-4 transition", n.read ? "border-slate-200 bg-white dark:border-white/8 dark:bg-white/3" : "border-primary-200 bg-primary-50/70 dark:border-primary-500/25 dark:bg-primary-500/8")}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[0.86rem] font-bold text-slate-800 dark:text-slate-100">{n.title}</p>
                    <Badge tone={n.tone === "warning" ? "warn" : n.tone === "success" ? "success" : "primary"}>{n.at}</Badge>
                  </div>
                  <p className="mt-2 text-[0.8rem] text-slate-500 dark:text-slate-400">{n.body}</p>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const pages = useMemo(() => (user ? visibleNav(user.role).flatMap((g) => g.items.map((i) => ({ label: i.label, to: i.to, group: g.label }))) : []), [user]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pageHits = pages.filter((p) => p.label.toLowerCase().includes(q)).map((p) => ({ id: p.to, label: p.label, hint: p.group, to: p.to, kind: "Module" }));
    if (!q) return pageHits.slice(0, 6);
    const studentHits = students
      .filter((s) => s.name.toLowerCase().includes(q) || s.rollNo.includes(q))
      .slice(0, 5)
      .map((s) => ({ id: s.id, label: s.name, hint: `${s.className}-${s.section} · ${s.rollNo}`, to: `/students/${s.id}`, kind: "Student" }));
    const teacherHits = teachers
      .filter((t) => t.name.toLowerCase().includes(q) || t.department.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({ id: t.id, label: t.name, hint: `${t.designation} · ${t.department}`, to: `/teachers/${t.id}`, kind: "Staff" }));
    const classHits = CLASS_NAMES.filter((c) => c.toLowerCase().includes(q)).slice(0, 3).map((c) => ({ id: c, label: c, hint: "Class section", to: `/classes?section=${encodeURIComponent(c)}`, kind: "Class" }));
    return [...pageHits, ...studentHits, ...teacherHits, ...classHits].slice(0, 12);
  }, [query, pages]);

  useEffect(() => setIndex(0), [query]);
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(results.length - 1, i + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter" && results[index]) {
        navigate(results[index].to);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, index, navigate, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="Global search" subtitle="Search modules, students, staff and classes" size="lg" icon={<Search className="h-5 w-5" />}>
      <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a name, roll number, module or class…" className="input-saas text-base" />
      <div className="mt-4 max-h-80 space-y-1.5 overflow-y-auto">
        {results.map((r, i) => (
          <button
            key={r.id + r.kind}
            onMouseEnter={() => setIndex(i)}
            onClick={() => {
              navigate(r.to);
              onClose();
            }}
            className={cn("flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition", i === index ? "bg-primary-50 dark:bg-primary-500/15" : "hover:bg-slate-100 dark:hover:bg-white/6")}
          >
            <span className="min-w-0">
              <span className="block truncate text-[0.86rem] font-semibold text-slate-800 dark:text-slate-100">{r.label}</span>
              <span className="block truncate text-[0.72rem] text-slate-400">{r.hint}</span>
            </span>
            <Badge tone={r.kind === "Student" ? "primary" : r.kind === "Staff" ? "analytics" : "muted"}>{r.kind}</Badge>
          </button>
        ))}
        {results.length === 0 && <p className="px-3 py-8 text-center text-[0.84rem] text-slate-400">No matches for "{query}". Try a student name, roll number or a module like "fees".</p>}
      </div>
      <p className="mt-4 flex flex-wrap items-center gap-3 text-[0.72rem] text-slate-400">
        <span className="flex items-center gap-1">
          <Command className="h-3 w-3" /> K to open
        </span>
        <span>↑ ↓ to navigate</span>
        <span>↵ to open</span>
        <span>esc to close</span>
      </p>
    </Modal>
  );
}

export function ProtectedRoute({ permission, roles, children }: { permission?: Permission; roles?: Role[]; children?: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <LockedNotice title="This area is not available for your role" message={`${ROLE_MATRIX[user.role].label} accounts cannot open this module. Switch to an authorised role from the account menu.`} />;
  if (permission && !can(user.role, permission))
    return <LockedNotice message={`Your role (${ROLE_MATRIX[user.role].label}) does not include the "${permission}" permission. Ask a Super Admin to elevate access.`} />;
  return <>{children ?? <Outlet />}</>;
}

export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export { ROLE_MATRIX };
export type { Role };