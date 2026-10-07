import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/auth/Login";

//Home
import Home from "./pages/Home";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import Children from "./pages/admin/Children";
import Teachers from "./pages/admin/Teachers";
import Parents from "./pages/admin/Parents";
import Classes from "./pages/admin/Classes";
import DailyReports from "./pages/admin/DailyReports";
import AdminNotices from "./pages/admin/Notices";
import Activities from "./pages/admin/Activities";
import Insights from "./pages/admin/Insights";

// Teacher
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherDailyReport from "./pages/teacher/DailyReport";
import TeacherReports from "./pages/teacher/Reports";
import TeacherNotices from "./pages/teacher/Notices";
import TeacherChildren from "./pages/teacher/Children";
import Attendance from "./pages/teacher/Attendance";


// Parent
import ParentDashboard from "./pages/parent/Dashboard";
import ParentChild from "./pages/parent/Child";
import ParentReports from "./pages/parent/Reports";
import ParentAttendance from "./pages/parent/Attendance";
import ParentNotices from "./pages/parent/Notices";
  
// Layouts
import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import ParentLayout from "./layouts/ParentLayout";

// Protection
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== */}
        {/* PUBLIC */}
        {/* ==================== */}
        

        <Route path="/login" element={<Login />} />

        {/* ==================== */}
        {/* ADMIN */}
        {/* ==================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />

          <Route path="children" element={<Children />} />

          <Route path="teachers" element={<Teachers />} />

          <Route path="parents" element={<Parents />} />

          <Route path="classes" element={<Classes />} />

          <Route path="reports" element={<DailyReports />} />

          <Route path="notices" element={<AdminNotices />} />

          <Route path="activities" element={<Activities />} />

          <Route path="insights" element={<Insights />} />
        </Route>

        {/* ==================== */}
        {/* TEACHER */}
        {/* ==================== */}

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          {/* /teacher */}
          <Route index element={<TeacherDashboard />} />

          {/* /teacher/reports */}
          <Route path="reports" element={<TeacherReports />} />

          {/* /teacher/reports/:childId */}
          <Route path="reports/:childId" element={<TeacherDailyReport />} />

          {/* /teacher/notices */}
          <Route path="notices" element={<TeacherNotices />} />

          {/* /teacher/children */}
          <Route path="children" element={<TeacherChildren />} />

          <Route path="attendance" element={<Attendance />} />

        </Route>

        {/* ==================== */}
        {/* PARENT */}
        {/* ==================== */}

        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ParentDashboard />} />
          <Route path="child" element={<ParentChild />} />
          <Route path="reports" element={<ParentReports />} />
          <Route path="attendance" element={<ParentAttendance />} />
          <Route path="notices" element={<ParentNotices />} />
        </Route>

        {/* ==================== */}
        {/* DEFAULT */}
        {/* ==================== */}

        <Route path="/" element={<Home />} />

        {/* ==================== */}
        {/* UNKNOWN ROUTES */}
        {/* ==================== */}

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
