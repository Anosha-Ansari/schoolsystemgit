/** Re-exports of domain types used by module screens. */
export type { Book, BookIssue, HostelRoom, PayRoll, Route, Teacher } from "@/lib/db";

export const daysAgoLabel = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};
