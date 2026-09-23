import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import type { Role, User } from "@/lib/db";
import { ROLE_MATRIX, can, type Permission } from "@/lib/api";

/* ------------------------------------------------------------ queries */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, gcTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false },
  },
});

export const qk = {
  dashboard: ["dashboard"] as const,
  attendance: (days: number) => ["attendance", days] as const,
  revenue: ["revenue"] as const,
  growth: ["growth"] as const,
  subjects: ["subjects"] as const,
  examStats: ["exam-stats"] as const,
  teacherPerf: ["teacher-perf"] as const,
  students: (params: unknown) => ["students", params] as const,
  student: (id: string) => ["student", id] as const,
  teachers: (params: unknown) => ["teachers", params] as const,
  teacher: (id: string) => ["teacher", id] as const,
  invoices: (params: unknown) => ["invoices", params] as const,
  invoice: (id: string) => ["invoice", id] as const,
  assignments: (params: unknown) => ["assignments", params] as const,
  submissions: (id: string) => ["submissions", id] as const,
  attendanceToday: ["attendance-today"] as const,
  exams: ["exams"] as const,
  exam: (id: string) => ["exam", id] as const,
  books: (params: unknown) => ["books", params] as const,
  issues: (params: unknown) => ["issues", params] as const,
  hostel: (params: unknown) => ["hostel", params] as const,
  events: ["events"] as const,
  notices: ["notices"] as const,
  threads: ["threads"] as const,
  ai: ["ai-insights"] as const,
  risk: ["ai-risk"] as const,
  settings: ["settings"] as const,
  payroll: ["payroll"] as const,
  leaves: ["leaves"] as const,
};

/* --------------------------------------------------------------- auth */

type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  remember: boolean;
  language: "en" | "ur";
  login: (payload: { user: User; token: string; refreshToken: string; remember?: boolean }) => void;
  logout: () => void;
  setLanguage: (l: "en" | "ur") => void;
  role: () => Role | null;
  has: (permission: Permission) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      remember: false,
      language: "en",
      login: ({ user, token, refreshToken, remember }) => set({ user, token, refreshToken, remember: !!remember }),
      logout: () => set({ user: null, token: null, refreshToken: null }),
      setLanguage: (language) => set({ language }),
      role: () => get().user?.role ?? null,
      has: (permission) => {
        const role = get().user?.role;
        return role ? can(role, permission) : false;
      },
    }),
    { name: "smartschool.auth.v1", partialize: (s) => ({ user: s.user, token: s.token, refreshToken: s.refreshToken, remember: s.remember, language: s.language }) },
  ),
);

export const useSession = () => {
  const { user, has, logout } = useAuthStore();
  return useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      roleLabel: user ? ROLE_MATRIX[user.role].label : "",
      permissions: user ? ROLE_MATRIX[user.role].permissions : [],
      can: has,
      logout,
    }),
    [user, has, logout],
  );
};

/* -------------------------------------------------------------- theme */

type ThemeState = { theme: "light" | "dark"; sidebarCollapsed: boolean; setTheme: (t: "light" | "dark") => void; toggleTheme: () => void; toggleSidebar: () => void; setSidebar: (v: boolean) => void };

export const useUIStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      sidebarCollapsed: false,
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebar: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    {
      name: "smartschool.ui.v1",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);

export function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0F172A" : "#0F5FFF");
}

/* ------------------------------------------------------------- toasts */

export type Toast = { id: string; title: string; message?: string; tone: "success" | "error" | "info" | "warning"; duration?: number };

type ToastState = { toasts: Toast[]; push: (t: Omit<Toast, "id">) => void; dismiss: (id: string) => void };
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    window.setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), t.duration ?? 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().push({ title, message, tone: "success" }),
  error: (title: string, message?: string) => useToastStore.getState().push({ title, message, tone: "error" }),
  info: (title: string, message?: string) => useToastStore.getState().push({ title, message, tone: "info" }),
  warning: (title: string, message?: string) => useToastStore.getState().push({ title, message, tone: "warning" }),
};

/* ---------------------------------------------------------- ui shell */

type ShellState = {
  commandOpen: boolean;
  notifOpen: boolean;
  mobileNavOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  setNotifOpen: (v: boolean) => void;
  setMobileNavOpen: (v: boolean) => void;
  notifications: { id: string; title: string; body: string; at: string; read: boolean; tone: "info" | "warning" | "success" }[];
  markAllRead: () => void;
};

export const useShellStore = create<ShellState>((set) => ({
  commandOpen: false,
  notifOpen: false,
  mobileNavOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setNotifOpen: (notifOpen) => set({ notifOpen }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  notifications: [
    { id: "n1", title: "43 fee challans overdue", body: "February ageing bucket crossed 30 days for 43 students.", at: "12 min ago", read: false, tone: "warning" },
    { id: "n2", title: "Pre-Board schedule published", body: "Grade 10 & 12 papers start in 6 days. Invigilation rosters ready.", at: "1 h ago", read: false, tone: "info" },
    { id: "n3", title: "Backup service degraded", body: "Backup worker latency 640 ms — retry queued automatically.", at: "3 h ago", read: false, tone: "warning" },
    { id: "n4", title: "Mid-term results verified", body: "Physics correction applied, positions recalculated for Grade 10.", at: "5 h ago", read: true, tone: "success" },
    { id: "n5", title: "New admission application", body: "Grade 6-A application received from guardian Zainab Malik.", at: "8 h ago", read: true, tone: "info" },
  ],
  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}));

/* ---------------------------------------------------- chat simulation */

export type ChatMessage = { id: string; from: string; body: string; at: string; seen: boolean; attachment?: string };
export type LocalThread = { id: string; participants: { name: string; role: Role; id: string }[]; subject: string; unread: number; updatedAt: string; messages: ChatMessage[]; typing?: boolean };

type ChatState = {
  threads: LocalThread[];
  activeId: string | null;
  connected: boolean;
  setThreads: (t: LocalThread[]) => void;
  setActive: (id: string | null) => void;
  send: (threadId: string, from: string, body: string, attachment?: string) => void;
  pushInbound: (threadId: string, msg: ChatMessage) => void;
  setTyping: (threadId: string, typing: boolean) => void;
  markSeen: (threadId: string) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  activeId: null,
  connected: true,
  setThreads: (threads) => set({ threads, activeId: get().activeId ?? threads[0]?.id ?? null }),
  setActive: (activeId) => set({ activeId }),
  send: (threadId, from, body, attachment) =>
    set((s) => ({
      threads: s.threads.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, { id: `m${Date.now()}`, from, body, at: "just now", seen: true, attachment }], updatedAt: "just now" } : t)),
    })),
  pushInbound: (threadId, msg) =>
    set((s) => ({
      threads: s.threads.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, msg], unread: s.activeId === threadId ? 0 : t.unread + 1, updatedAt: "just now", typing: false } : t)),
    })),
  setTyping: (threadId, typing) => set((s) => ({ threads: s.threads.map((t) => (t.id === threadId ? { ...t, typing } : t)) })),
  markSeen: (threadId) => set((s) => ({ threads: s.threads.map((t) => (t.id === threadId ? { ...t, unread: 0, messages: t.messages.map((m) => ({ ...m, seen: true })) } : t)) })),
}));

/* -------------------------------------------------------------- hooks */

export function useDebounced<T>(value: T, ms = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore quota errors */
      }
    },
    [key],
  );
  return [value, set] as const;
}

/** Animated counter for KPI cards and stat blocks. */
export function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const frame = useRef(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Number((target * (1 - Math.pow(1 - p, 3))).toFixed(decimals)));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, decimals]);
  return value;
}

/** Live "realtime" ticker used by dashboard widgets (Socket.io feed mock). */
export function useLiveTicker(base: number, variance = 6, intervalMs = 5200) {
  const [value, setValue] = useState(base);
  useEffect(() => {
    const t = window.setInterval(() => {
      setValue((v) => Math.max(0, Number((v + (Math.random() - 0.5) * variance).toFixed(1))));
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [variance, intervalMs]);
  return value;
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · SmartSchool ERP`;
    return () => {
      document.title = "SmartSchool ERP — Enterprise School Management System";
    };
  }, [title]);
}
