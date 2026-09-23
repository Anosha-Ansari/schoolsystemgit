import { Suspense, lazy, useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthLayout, DashboardLayout, ProtectedRoute, PublicLayout } from "@/components/layout";
import { Toaster } from "@/components/ui";
import { queryClient, useUIStore, applyTheme } from "@/lib/store";

/* Public site */
const PublicHome = lazy(() => import("@/pages/PublicHome"));
const PublicSite = () => import("@/pages/PublicSite");

/* Lazy route modules (code-split) */
const PublicAbout = lazy(() => import("@/pages/PublicSite").then((m) => ({ default: m.PublicAbout })));
const PublicAdmissions = lazy(() => import("@/pages/PublicSite").then((m) => ({ default: m.PublicAdmissions })));
const PublicAcademics = lazy(() => import("@/pages/PublicSite").then((m) => ({ default: m.PublicAcademics })));
const PublicFaculty = lazy(() => import("@/pages/PublicSite").then((m) => ({ default: m.PublicFaculty })));
const PublicEvents = lazy(() => import("@/pages/PublicSite").then((m) => ({ default: m.PublicEvents })));
const PublicGallery = lazy(() => import("@/pages/PublicSite").then((m) => ({ default: m.PublicGallery })));
const PublicContact = lazy(() => import("@/pages/PublicSite").then((m) => ({ default: m.PublicContact })));

/* Auth */
const Login = lazy(() => import("@/pages/Auth").then((m) => ({ default: m.Login })));
const Register = lazy(() => import("@/pages/Auth").then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(() => import("@/pages/Auth").then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import("@/pages/Auth").then((m) => ({ default: m.ResetPassword })));
const VerifyEmail = lazy(() => import("@/pages/Auth").then((m) => ({ default: m.VerifyEmail })));

/* Dashboard + modules */
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AnalyticsStudio = lazy(() => import("@/pages/Dashboard").then((m) => ({ default: m.AnalyticsStudio })));
const StudentsList = lazy(() => import("@/pages/Students").then((m) => ({ default: m.StudentsList })));
const StudentForm = lazy(() => import("@/pages/Students").then((m) => ({ default: m.StudentForm })));
const StudentDetail = lazy(() => import("@/pages/Students").then((m) => ({ default: m.StudentDetail })));
const ClassesPage = lazy(() => import("@/pages/Students").then((m) => ({ default: m.ClassesPage })));
const CalendarPage = lazy(() => import("@/pages/Students").then((m) => ({ default: m.CalendarPage })));
const TeachersList = lazy(() => import("@/pages/TeachersOps").then((m) => ({ default: m.TeachersList })));
const TeacherDetail = lazy(() => import("@/pages/TeachersOps").then((m) => ({ default: m.TeacherDetail })));
const PayrollPage = lazy(() => import("@/pages/TeachersOps").then((m) => ({ default: m.PayrollPage })));
const LeavesPage = lazy(() => import("@/pages/TeachersOps").then((m) => ({ default: m.LeavesPage })));
const LibraryPage = lazy(() => import("@/pages/TeachersOps").then((m) => ({ default: m.LibraryPage })));
const LibraryIssuesPage = lazy(() => import("@/pages/TeachersOps").then((m) => ({ default: m.LibraryIssuesPage })));
const TransportPage = lazy(() => import("@/pages/TeachersOps").then((m) => ({ default: m.TransportPage })));
const HostelPage = lazy(() => import("@/pages/TeachersOps").then((m) => ({ default: m.HostelPage })));
const AttendanceHub = lazy(() => import("@/pages/AttendanceExams").then((m) => ({ default: m.AttendanceHub })));
const ExaminationsList = lazy(() => import("@/pages/AttendanceExams").then((m) => ({ default: m.ExaminationsList })));
const ExamCreate = lazy(() => import("@/pages/AttendanceExams").then((m) => ({ default: m.ExamCreate })));
const ExamDetail = lazy(() => import("@/pages/AttendanceExams").then((m) => ({ default: m.ExamDetail })));
const ExamMarksEntry = lazy(() => import("@/pages/AttendanceExams").then((m) => ({ default: m.ExamMarksEntry })));
const ResultsList = lazy(() => import("@/pages/AttendanceExams").then((m) => ({ default: m.ResultsList })));
const ResultsPublish = lazy(() => import("@/pages/AttendanceExams").then((m) => ({ default: m.ResultsPublish })));
const AssignmentsList = lazy(() => import("@/pages/AttendanceExams").then((m) => ({ default: m.AssignmentsList })));
const AssignmentCreate = lazy(() => import("@/pages/AttendanceExams").then((m) => ({ default: m.AssignmentCreate })));
const AssignmentDetail = lazy(() => import("@/pages/AttendanceExams").then((m) => ({ default: m.AssignmentDetail })));
const FeesList = lazy(() => import("@/pages/FinanceComms").then((m) => ({ default: m.FeesList })));
const FeeGenerate = lazy(() => import("@/pages/FinanceComms").then((m) => ({ default: m.FeeGenerate })));
const RevenuePage = lazy(() => import("@/pages/FinanceComms").then((m) => ({ default: m.RevenuePage })));
const OverduePage = lazy(() => import("@/pages/FinanceComms").then((m) => ({ default: m.OverduePage })));
const ReportsCentre = lazy(() => import("@/pages/FinanceComms").then((m) => ({ default: m.ReportsCentre })));
const NoticeBoard = lazy(() => import("@/pages/FinanceComms").then((m) => ({ default: m.NoticeBoard })));
const MessagesPage = lazy(() => import("@/pages/FinanceComms").then((m) => ({ default: m.MessagesPage })));
const AiInsightsPage = lazy(() => import("@/pages/FinanceComms").then((m) => ({ default: m.AiInsightsPage })));
const AuditLogPage = lazy(() => import("@/pages/FinanceComms").then((m) => ({ default: m.AuditLogPage })));
const EventsAdmin = lazy(() => import("@/pages/FinanceComms").then((m) => ({ default: m.EventsAdmin })));
const ParentPortal = lazy(() => import("@/pages/PortalsSettings").then((m) => ({ default: m.ParentPortal })));
const StudentPortal = lazy(() => import("@/pages/PortalsSettings").then((m) => ({ default: m.StudentPortal })));
const SettingsPage = lazy(() => import("@/pages/PortalsSettings").then((m) => ({ default: m.SettingsPage })));
const RolesPage = lazy(() => import("@/pages/PortalsSettings").then((m) => ({ default: m.RolesPage })));
const SystemHealthPage = lazy(() => import("@/pages/PortalsSettings").then((m) => ({ default: m.SystemHealthPage })));
const ProfilePage = lazy(() => import("@/pages/PortalsSettings").then((m) => ({ default: m.ProfilePage })));
const NotFoundPage = lazy(() => import("@/pages/PortalsSettings").then((m) => ({ default: m.NotFoundPage })));

export { PublicSite };

function PageLoader() {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center gap-4">
      <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-analytics-500 text-white">
        <span className="absolute inset-0 animate-ping-slow rounded-2xl bg-primary-500/30" />
        <span className="font-display text-lg font-extrabold">S</span>
      </span>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-400">Loading module…</p>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function ThemeBootstrap() {
  const theme = useUIStore((s) => s.theme);
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ThemeBootstrap />
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<PublicHome />} />
              <Route path="/about" element={<PublicAbout />} />
              <Route path="/admissions" element={<PublicAdmissions />} />
              <Route path="/academics" element={<PublicAcademics />} />
              <Route path="/faculty" element={<PublicFaculty />} />
              <Route path="/events" element={<PublicEvents />} />
              <Route path="/gallery" element={<PublicGallery />} />
              <Route path="/contact" element={<PublicContact />} />
            </Route>

            {/* Authentication */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
            </Route>

            {/* Dashboard application (JWT + RBAC guarded) */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<ProtectedRoute permission="reports:read"><AnalyticsStudio /></ProtectedRoute>} />
              <Route path="/ai-insights" element={<ProtectedRoute permission="ai:read"><AiInsightsPage /></ProtectedRoute>} />

              <Route path="/students" element={<ProtectedRoute permission="students:read"><StudentsList /></ProtectedRoute>} />
              <Route path="/students/new" element={<ProtectedRoute permission="students:write"><StudentForm mode="create" /></ProtectedRoute>} />
              <Route path="/students/:studentId" element={<ProtectedRoute permission="students:read"><StudentDetail /></ProtectedRoute>} />
              <Route path="/students/:studentId/edit" element={<ProtectedRoute permission="students:write"><StudentForm mode="edit" /></ProtectedRoute>} />
              <Route path="/classes" element={<ProtectedRoute permission="students:read"><ClassesPage /></ProtectedRoute>} />
              <Route path="/calendar" element={<CalendarPage />} />

              <Route path="/teachers" element={<ProtectedRoute permission="teachers:read"><TeachersList /></ProtectedRoute>} />
              <Route path="/teachers/:teacherId" element={<ProtectedRoute permission="teachers:read"><TeacherDetail /></ProtectedRoute>} />
              <Route path="/payroll" element={<ProtectedRoute permission="teachers:read"><PayrollPage /></ProtectedRoute>} />
              <Route path="/leaves" element={<ProtectedRoute permission="teachers:read"><LeavesPage /></ProtectedRoute>} />

              <Route path="/attendance" element={<ProtectedRoute permission="attendance:read"><AttendanceHub /></ProtectedRoute>} />
              <Route path="/attendance/mark" element={<ProtectedRoute permission="attendance:write"><AttendanceHub initialTab="manual" /></ProtectedRoute>} />
              <Route path="/attendance/qr" element={<ProtectedRoute permission="attendance:write"><AttendanceHub initialTab="qr" /></ProtectedRoute>} />
              <Route path="/attendance/reports" element={<ProtectedRoute permission="attendance:read"><AttendanceHub initialTab="reports" /></ProtectedRoute>} />
              <Route path="/attendance/heatmap" element={<ProtectedRoute permission="attendance:read"><AttendanceHub initialTab="heatmap" /></ProtectedRoute>} />

              <Route path="/examinations" element={<ProtectedRoute permission="exams:read"><ExaminationsList /></ProtectedRoute>} />
              <Route path="/examinations/new" element={<ProtectedRoute permission="exams:write"><ExamCreate /></ProtectedRoute>} />
              <Route path="/examinations/marks" element={<ProtectedRoute permission="exams:write"><ExamMarksEntry /></ProtectedRoute>} />
              <Route path="/examinations/:examId" element={<ProtectedRoute permission="exams:read"><ExamDetail /></ProtectedRoute>} />

              <Route path="/results" element={<ProtectedRoute permission="exams:read"><ResultsList /></ProtectedRoute>} />
              <Route path="/results/publish" element={<ProtectedRoute permission="results:publish"><ResultsPublish /></ProtectedRoute>} />
              <Route path="/results/:studentId" element={<ProtectedRoute permission="exams:read"><ResultsList /></ProtectedRoute>} />

              <Route path="/assignments" element={<ProtectedRoute permission="students:read"><AssignmentsList /></ProtectedRoute>} />
              <Route path="/assignments/new" element={<ProtectedRoute permission="students:write"><AssignmentCreate /></ProtectedRoute>} />
              <Route path="/assignments/:assignmentId" element={<ProtectedRoute permission="students:read"><AssignmentDetail /></ProtectedRoute>} />

              <Route path="/fees" element={<ProtectedRoute permission="fees:read"><FeesList /></ProtectedRoute>} />
              <Route path="/fees/generate" element={<ProtectedRoute permission="fees:write"><FeeGenerate /></ProtectedRoute>} />
              <Route path="/fees/revenue" element={<ProtectedRoute permission="fees:read"><RevenuePage /></ProtectedRoute>} />
              <Route path="/fees/overdue" element={<ProtectedRoute permission="fees:read"><OverduePage /></ProtectedRoute>} />
              <Route path="/fees/:invoiceId" element={<ProtectedRoute permission="fees:read"><FeesList /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute permission="reports:read"><ReportsCentre /></ProtectedRoute>} />

              <Route path="/library" element={<ProtectedRoute permission="library:read"><LibraryPage /></ProtectedRoute>} />
              <Route path="/library/issues" element={<ProtectedRoute permission="library:read"><LibraryIssuesPage /></ProtectedRoute>} />
              <Route path="/transport" element={<ProtectedRoute permission="transport:read"><TransportPage /></ProtectedRoute>} />
              <Route path="/hostel" element={<ProtectedRoute permission="hostel:read"><HostelPage /></ProtectedRoute>} />
              <Route path="/events-admin" element={<ProtectedRoute permission="events:read"><EventsAdmin /></ProtectedRoute>} />
              <Route path="/audit" element={<ProtectedRoute permission="audit:read"><AuditLogPage /></ProtectedRoute>} />

              <Route path="/notices" element={<ProtectedRoute permission="notices:read"><NoticeBoard /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute permission="messages:read"><MessagesPage /></ProtectedRoute>} />
              <Route path="/parent" element={<ParentPortal />} />
              <Route path="/my" element={<StudentPortal />} />

              <Route path="/roles" element={<ProtectedRoute permission="users:manage"><RolesPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute permission="settings:write"><SettingsPage /></ProtectedRoute>} />
              <Route path="/system" element={<ProtectedRoute permission="settings:write"><SystemHealthPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProfilePage />} />

              <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster />
      </HashRouter>
    </QueryClientProvider>
  );
}
