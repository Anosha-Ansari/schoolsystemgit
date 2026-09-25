export const ROLES = [
  { id: "super_admin", label: "Super Administrator", color: "#8B5CF6" },
  { id: "admin", label: "Administrator", color: "#2F6FED" },
  { id: "teacher", label: "Teacher", color: "#12B981" },
  { id: "parent", label: "Parent", color: "#F5A524" },
  { id: "student", label: "Student", color: "#EC4899" },
];

export const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label || id;
export const roleColor = (id) => ROLES.find((r) => r.id === id)?.color || "#6B7590";
