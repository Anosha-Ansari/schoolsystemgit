import type { ReactNode } from "react";
import type { Role } from "@/lib/db";

/** Metric tiles for the System Health screen. */
export const SYSTEM_METRICS: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  icon: "activity" | "users" | "database" | "server";
  tone: "primary" | "success" | "warn" | "danger" | "analytics";
  delta?: number;
  hint?: string;
}[] = [
  { label: "Avg. API latency", value: 142, suffix: " ms", icon: "activity", tone: "success", delta: -8.4, hint: "P95 within budget" },
  { label: "Online sessions", value: 412, icon: "users", tone: "primary", delta: 6.1, hint: "Realtime sockets" },
  { label: "Database size", value: 12.6, decimals: 1, suffix: " GB", icon: "database", tone: "analytics", delta: 3.2 },
  { label: "Uptime (30d)", value: 99.98, decimals: 2, suffix: "%", icon: "server", tone: "success", hint: "1 degraded worker" },
];

/** Permission matrix rows for the Roles & Permissions screen. */
export const ROLE_MATRIX_ROWS: { module: string; description: string }[] = [
  { module: "Dashboard", description: "Role-scoped KPIs and analytics" },
  { module: "Students", description: "Records, documents, attendance and fees" },
  { module: "Teachers", description: "Directory, payroll and appraisals" },
  { module: "Attendance", description: "Marking, QR scanning and reports" },
  { module: "Exams", description: "Scheduling, marks entry and publishing" },
  { module: "Fees", description: "Challans, collections and revenue" },
  { module: "Library", description: "Catalogue and circulation" },
  { module: "Transport", description: "Routes, vehicles and drivers" },
  { module: "Hostel", description: "Rooms, beds and mess plans" },
  { module: "Notices", description: "Announcements and read receipts" },
  { module: "Messages", description: "Realtime threaded messaging" },
  { module: "Reports", description: "Report builder and exports" },
  { module: "AI Insights", description: "Predictive analytics and risk cohorts" },
  { module: "Users", description: "Account provisioning and roles" },
  { module: "Settings", description: "Tenant configuration" },
  { module: "Audit", description: "Immutable activity trail" },
];

export const STUDENTS_DEMO: { id: string; name: string; roleLabel: string }[] = [];

export type RoleSummary = { role: Role; label: string; description: string; permissions: string[] | "*" };

export const PORTAL_BADGES: ReactNode[] = [];
