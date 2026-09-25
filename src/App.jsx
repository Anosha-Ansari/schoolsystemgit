import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AcademicProvider } from "./context/AcademicContext";
import { StudentsProvider } from "./context/StudentsContext";
import { TeachersProvider } from "./context/TeachersContext";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Attendance from "./pages/Attendance";
import Examinations from "./pages/Examinations";
import FeeManagement from "./pages/FeeManagement";
import Reports from "./pages/Reports";
import NoticeBoard from "./pages/NoticeBoard";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";

import RegisterStudent from "./pages/students/RegisterStudent";
import StudentList from "./pages/students/StudentList";
import TransferStudents from "./pages/students/TransferStudents";
import RegisterTeacher from "./pages/teachers/RegisterTeacher";
import TeacherList from "./pages/teachers/TeacherList";
import AddSection from "./pages/academic/AddSection";
import AddClass from "./pages/academic/AddClass";

function Protected({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

const ADMINS = ["super_admin", "admin"];
const STAFF = ["super_admin", "admin", "teacher"];
const ALL = ["super_admin", "admin", "teacher", "parent", "student"];

function AppRoutes() {
  const { ready } = useAuth();
  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-muted text-sm">Loading…</div>;
  }
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Protected roles={ALL}><Dashboard /></Protected>} />

      <Route path="/students/register" element={<Protected roles={ADMINS}><RegisterStudent /></Protected>} />
      <Route path="/students/list" element={<Protected roles={STAFF}><StudentList /></Protected>} />
      <Route path="/students/transfers" element={<Protected roles={STAFF}><TransferStudents /></Protected>} />

      <Route path="/teachers/register" element={<Protected roles={ADMINS}><RegisterTeacher /></Protected>} />
      <Route path="/teachers/list" element={<Protected roles={ADMINS}><TeacherList /></Protected>} />

      <Route path="/academic/sections" element={<Protected roles={ADMINS}><AddSection /></Protected>} />
      <Route path="/academic/classes" element={<Protected roles={ADMINS}><AddClass /></Protected>} />

      <Route path="/classes" element={<Protected roles={STAFF}><Classes /></Protected>} />
      <Route path="/attendance" element={<Protected roles={ALL}><Attendance /></Protected>} />
      <Route path="/examinations" element={<Protected roles={ALL}><Examinations /></Protected>} />
      <Route path="/fees" element={<Protected roles={["super_admin", "admin", "parent"]}><FeeManagement /></Protected>} />
      <Route path="/reports" element={<Protected roles={ADMINS}><Reports /></Protected>} />
      <Route path="/notices" element={<Protected roles={ALL}><NoticeBoard /></Protected>} />
      <Route path="/messages" element={<Protected roles={ALL}><Messages /></Protected>} />
      <Route path="/settings" element={<Protected roles={ALL}><Settings /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TeachersProvider>
          <AcademicProvider>
            <StudentsProvider>
              <AppRoutes />
            </StudentsProvider>
          </AcademicProvider>
        </TeachersProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
