import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarCheck,
  FileText, Wallet, BarChart3, Megaphone, MessageSquare, Settings, Layers,
} from "lucide-react";

const ALL = ["super_admin", "admin", "teacher", "parent", "student"];

export const NAV_CONFIG = [
  { type: "link", to: "/", icon: LayoutDashboard, label: "Dashboard", roles: ALL, end: true },
  {
    type: "group", icon: Users, label: "Students", roles: ["super_admin", "admin", "teacher"],
    children: [
      { to: "/students/register", label: "Register Student", roles: ["super_admin", "admin"] },
      { to: "/students/list", label: "Student List", roles: ["super_admin", "admin", "teacher"] },
      { to: "/students/transfers", label: "Transfer Students", roles: ["super_admin", "admin", "teacher"] },
    ],
  },
  {
    type: "group", icon: GraduationCap, label: "Teachers", roles: ["super_admin", "admin"],
    children: [
      { to: "/teachers/register", label: "Register Teacher", roles: ["super_admin", "admin"] },
      { to: "/teachers/list", label: "Teacher List", roles: ["super_admin", "admin"] },
    ],
  },
  {
    type: "group", icon: Layers, label: "Academic Setup", roles: ["super_admin", "admin"],
    children: [
      { to: "/academic/sections", label: "Add Section", roles: ["super_admin", "admin"] },
      { to: "/academic/classes", label: "Add Class", roles: ["super_admin", "admin"] },
    ],
  },
  { type: "link", to: "/classes", icon: BookOpen, label: "Classes", roles: ["super_admin", "admin", "teacher"] },
  { type: "link", to: "/attendance", icon: CalendarCheck, label: "Attendance", roles: ALL },
  { type: "link", to: "/examinations", icon: FileText, label: "Examinations", roles: ALL },
  { type: "link", to: "/fees", icon: Wallet, label: "Fee Management", roles: ["super_admin", "admin", "parent"] },
  { type: "link", to: "/reports", icon: BarChart3, label: "Reports", roles: ["super_admin", "admin"] },
  { type: "link", to: "/notices", icon: Megaphone, label: "Notice Board", roles: ALL },
  { type: "link", to: "/messages", icon: MessageSquare, label: "Messages", roles: ALL },
  { type: "link", to: "/settings", icon: Settings, label: "Settings", roles: ALL },
];

export function navForRole(role) {
  return NAV_CONFIG
    .filter((item) => item.roles.includes(role))
    .map((item) =>
      item.type === "group"
        ? { ...item, children: item.children.filter((c) => c.roles.includes(role)) }
        : item
    )
    .filter((item) => item.type === "link" || item.children.length > 0);
}
