import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { getCurrentUser, type CurrentUser } from "../../services/authService";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  classroom?: number | null;
  classroom_name?: string;
  roll_number?: number | null;
  is_active?: boolean;
};

type AttendanceRecord = {
  id: number;
  child: number;
  child_name: string;
  classroom_name?: string;
  attendance_date: string;
  status: "present" | "absent";
};

type DailyReport = {
  id: number;
  child: number;
  child_name: string;
  classroom_name?: string;
  report_date: string;
  mood?: string;
  participation?: string;
  submitted: boolean;
};

type Notice = {
  id: number;
  title: string;
  content: string;
  notice_date: string;
  event_date?: string | null;
  is_active?: boolean;
};

type ChildStatus = Child & {
  attendance?: "present" | "absent";
  report?: DailyReport;
};

function getLocalDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .split("T")[0];
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getNoticeIcon(index: number) {
  const icons = ["📢", "🏃", "👨‍👩‍👧", "🎨", "🌸"];

  return icons[index % icons.length];
}

export default function TeacherDashboard() {
  const today = getLocalDate();

  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedChild, setSelectedChild] = useState<ChildStatus | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // =====================================================
  // CURRENT USER
  // =====================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();

        console.log("CURRENT USER:", user);

        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    };

    loadUser();
  }, []);

  const teacherName =
    [currentUser?.first_name, currentUser?.last_name]
      .filter(Boolean)
      .join(" ") || "Teacher";

  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          childrenResponse,
          attendanceResponse,
          reportsResponse,
          noticesResponse,
        ] = await Promise.all([
          api.get("/children/"),
          api.get(`/attendance/?date=${today}`),
          api.get(`/daily-reports/?date=${today}`),
          api.get("/notices/"),
        ]);

        const childrenData =
          childrenResponse.data.results ?? childrenResponse.data;

        const attendanceData =
          attendanceResponse.data.results ?? attendanceResponse.data;

        const reportsData =
          reportsResponse.data.results ?? reportsResponse.data;

        const noticesData =
          noticesResponse.data.results ?? noticesResponse.data;

        setChildren(childrenData);
        setAttendance(attendanceData);
        setReports(reportsData);
        setNotices(noticesData);
      } catch (err) {
        console.error("Failed to load teacher dashboard:", err);

        setError(
          "We couldn't load today's classroom information. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [today]);

  // =====================================================
  // CHILD STATUS
  // =====================================================

  const childStatuses = useMemo<ChildStatus[]>(() => {
    return children.map((child) => {
      const attendanceRecord = attendance.find(
        (record) => record.child === child.id,
      );

      const report = reports.find((report) => report.child === child.id);

      return {
        ...child,
        attendance: attendanceRecord?.status,
        report,
      };
    });
  }, [children, attendance, reports]);

  const presentChildren = childStatuses.filter(
    (child) => child.attendance === "present",
  );

  const absentChildren = childStatuses.filter(
    (child) => child.attendance === "absent",
  );

  const reportsDone = presentChildren.filter(
    (child) => child.report?.submitted,
  );

  const pendingReports = presentChildren.filter(
    (child) => !child.report?.submitted,
  );

  const attendanceMarked = childStatuses.filter((child) => child.attendance);

  const attendancePending = children.length - attendanceMarked.length;

  const reportPercentage =
    presentChildren.length === 0
      ? 0
      : Math.round((reportsDone.length / presentChildren.length) * 100);

  const classroomName =
    children.find((child) => child.classroom_name)?.classroom_name ||
    "My Classroom";

  const activeNotices = notices
    .filter((notice) => notice.is_active !== false)
    .slice(0, 3);

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8fb] p-6 md:p-8">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-40 bg-white rounded-3xl" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-36 bg-white rounded-3xl" />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 h-96 bg-white rounded-3xl" />
            <div className="h-96 bg-white rounded-3xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-white rounded-3xl" />
            <div className="h-64 bg-white rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-[#fff8fb] p-5 md:p-7 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* =====================================================
            DASHBOARD HEADER
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] bg-white border border-pink-100/80 shadow-[0_12px_40px_rgba(53,35,67,0.06)]">
          {/* Decorative background */}
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-pink-100/60 blur-3xl pointer-events-none" />

          <div className="absolute -bottom-24 right-48 w-56 h-56 rounded-full bg-purple-100/50 blur-3xl pointer-events-none" />

          {/* Header content */}
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left: Welcome */}
              <div className="flex items-start gap-4">
                {/* Teacher avatar */}
                <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 items-center justify-center text-white text-xl font-bold shadow-lg shadow-pink-200">
                  {currentUser?.first_name?.charAt(0).toUpperCase() || "T"}
                </div>

                <div>
                  {/* Labels */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      Teacher Dashboard
                    </span>

                    {currentUser?.role === "teacher" && (
                      <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold">
                        Teacher
                      </span>
                    )}
                  </div>

                  {/* Greeting */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#30435b]">
                    Good day, {currentUser?.first_name || teacherName} 👋
                  </h1>

                  <p className="mt-2 text-sm md:text-base text-gray-500 max-w-xl">
                    Here's what is happening in{" "}
                    <span className="font-semibold text-[#30435b]">
                      {classroomName}
                    </span>{" "}
                    today.
                  </p>
                </div>
              </div>

              {/* Right: Date */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#fff8fb] border border-pink-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm">
                  📅
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    Today
                  </p>

                  <p className="text-sm font-bold text-[#30435b]">
                    {formatDate(today)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            STAT CARDS
        ===================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* My Children */}
          <div className="group bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6 hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  My Children
                </p>

                <p className="mt-3 text-4xl font-bold text-[#30435b]">
                  {children.length}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  Assigned to your classroom
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl">
                👧
              </div>
            </div>
          </div>

          {/* Present */}
          <div className="group bg-white rounded-3xl border border-green-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6 hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Present Today
                </p>

                <p className="mt-3 text-4xl font-bold text-[#30435b]">
                  {presentChildren.length}
                </p>

                <p className="mt-2 text-sm text-green-600 font-medium">
                  {attendancePending > 0
                    ? `${attendancePending} not marked`
                    : "Attendance complete"}
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">
                ✓
              </div>
            </div>
          </div>

          {/* Reports */}
          <div className="group bg-white rounded-3xl border border-purple-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6 hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Reports Done
                </p>

                <p className="mt-3 text-4xl font-bold text-[#30435b]">
                  {reportsDone.length}

                  <span className="text-xl text-gray-400 font-semibold">
                    {" "}
                    / {presentChildren.length}
                  </span>
                </p>

                <p className="mt-2 text-sm text-purple-600 font-medium">
                  For present children
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">
                📝
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="group bg-white rounded-3xl border border-amber-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6 hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Pending Reports
                </p>

                <p className="mt-3 text-4xl font-bold text-[#30435b]">
                  {pendingReports.length}
                </p>

                <p className="mt-2 text-sm text-amber-600 font-medium">
                  {pendingReports.length > 0
                    ? "Need your attention"
                    : "Everything is complete"}
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
                !
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            CHILDREN + TODAY'S TASKS
        ===================================================== */}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Children */}
          <div className="xl:col-span-2 bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#30435b]">
                  My Children
                  <span className="text-gray-400 font-medium">
                    {" "}
                    — {classroomName}
                  </span>
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Today’s attendance and report status
                </p>
              </div>

              <Link
                to="/teacher/children"
                className="text-sm font-bold text-pink-500 hover:text-pink-600"
              >
                View all →
              </Link>
            </div>

            {children.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-4xl mb-3">👧</div>

                <p className="font-semibold text-[#30435b]">
                  No children assigned
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Your assigned children will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#fffafd] border-b border-gray-100">
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                          Child
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                          Attendance
                        </th>

                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                          Report
                        </th>

                        <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-400">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {childStatuses.slice(0, 6).map((child) => (
                        <tr
                          key={child.id}
                          className="hover:bg-pink-50/30 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-sm font-bold text-pink-600">
                                {getInitials(child.first_name, child.last_name)}
                              </div>

                              <div>
                                <p className="font-semibold text-[#30435b]">
                                  {child.first_name} {child.last_name}
                                </p>

                                {child.roll_number && (
                                  <p className="text-xs text-gray-400">
                                    Roll No. {child.roll_number}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {!child.attendance ? (
                              <span className="inline-flex px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                Not marked
                              </span>
                            ) : child.attendance === "present" ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                                <span>✓</span>
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                Absent
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {child.attendance === "absent" ? (
                              <span className="inline-flex px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                Not required
                              </span>
                            ) : child.report?.submitted ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                                <span>✓</span>
                                Completed
                              </span>
                            ) : child.attendance === "present" ? (
                              <span className="inline-flex px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 text-xs font-bold">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setSelectedChild(child)}
                              className="text-sm font-bold text-pink-500 hover:text-pink-700"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden divide-y divide-gray-100">
                  {childStatuses.slice(0, 6).map((child) => (
                    <div key={child.id} className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-sm font-bold text-pink-600">
                            {getInitials(child.first_name, child.last_name)}
                          </div>

                          <div>
                            <p className="font-semibold text-[#30435b]">
                              {child.first_name} {child.last_name}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedChild(child)}
                          className="text-sm font-bold text-pink-500"
                        >
                          View
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            child.attendance === "present"
                              ? "bg-green-50 text-green-700"
                              : child.attendance === "absent"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {child.attendance === "present"
                            ? "✓ Present"
                            : child.attendance === "absent"
                              ? "Absent"
                              : "Attendance not marked"}
                        </span>

                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            child.report?.submitted
                              ? "bg-green-50 text-green-700"
                              : child.attendance === "absent"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {child.attendance === "absent"
                            ? "Report not required"
                            : child.report?.submitted
                              ? "Report completed"
                              : "Report pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {children.length > 6 && (
                  <div className="px-6 py-4 border-t border-gray-100 text-center">
                    <Link
                      to="/teacher/children"
                      className="text-sm font-bold text-pink-500"
                    >
                      View all {children.length} children →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Today's Tasks */}
          <div className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#30435b]">
                  Today’s Tasks
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Keep your classroom up to date
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                ✨
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Attendance */}
              <div className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-green-50 flex items-center justify-center text-lg">
                  ✓
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#30435b]">Attendance</p>

                  <p className="text-sm text-gray-400 mt-0.5">
                    {attendancePending === 0
                      ? "All children marked"
                      : `${attendancePending} children not marked`}
                  </p>
                </div>

                {attendancePending === 0 ? (
                  <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                    Done
                  </span>
                ) : (
                  <Link
                    to="/teacher/attendance"
                    className="text-sm font-bold text-pink-500"
                  >
                    Start
                  </Link>
                )}
              </div>

              {/* Reports */}
              <div className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-purple-50 flex items-center justify-center text-lg">
                  📝
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#30435b]">Daily Reports</p>

                  <p className="text-sm text-gray-400 mt-0.5">
                    {pendingReports.length === 0
                      ? "All present children completed"
                      : `${pendingReports.length} report${
                          pendingReports.length === 1 ? "" : "s"
                        } pending`}
                  </p>
                </div>

                {pendingReports.length === 0 ? (
                  <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                    Done
                  </span>
                ) : (
                  <Link
                    to="/teacher/reports"
                    className="text-sm font-bold text-pink-500"
                  >
                    Start
                  </Link>
                )}
              </div>

              {/* Notices */}
              <div className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-50 flex items-center justify-center text-lg">
                  📢
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#30435b]">Notices</p>

                  <p className="text-sm text-gray-400 mt-0.5">
                    {activeNotices.length} recent notice
                    {activeNotices.length === 1 ? "" : "s"}
                  </p>
                </div>

                <Link
                  to="/teacher/notices"
                  className="text-sm font-bold text-pink-500"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            REPORT COMPLETION + CLASS SNAPSHOT
        ===================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Completion */}
          <div className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#30435b]">
                  Report Completion
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Today’s daily reports
                </p>
              </div>

              <Link
                to="/teacher/reports"
                className="text-sm font-bold text-pink-500"
              >
                View all →
              </Link>
            </div>

            <div className="flex items-end justify-between gap-4 mb-3">
              <div>
                <p className="text-3xl font-bold text-[#30435b]">
                  {reportsDone.length}

                  <span className="text-lg text-gray-400">
                    {" "}
                    of {presentChildren.length}
                  </span>
                </p>

                <p className="text-sm text-gray-400 mt-1">present children</p>
              </div>

              <p className="text-2xl font-bold text-pink-500">
                {reportPercentage}%
              </p>
            </div>

            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-700"
                style={{
                  width: `${reportPercentage}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />

                <span className="text-sm text-gray-500">
                  {reportsDone.length} completed
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />

                <span className="text-sm text-gray-500">
                  {pendingReports.length} pending
                </span>
              </div>
            </div>

            {pendingReports.length > 0 && (
              <Link
                to="/teacher/reports"
                className="mt-6 w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-pink-50 text-pink-600 font-bold text-sm hover:bg-pink-100 transition"
              >
                Complete pending reports →
              </Link>
            )}
          </div>

          {/* Class Snapshot */}
          <div className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#30435b]">
                  Today’s Snapshot
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Quick classroom overview
                </p>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-xl">
                📊
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-sm text-green-700 font-semibold">Present</p>

                <p className="text-2xl font-bold text-green-800 mt-1">
                  {presentChildren.length}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500 font-semibold">Absent</p>

                <p className="text-2xl font-bold text-gray-700 mt-1">
                  {absentChildren.length}
                </p>
              </div>

              <div className="rounded-2xl bg-purple-50 p-4">
                <p className="text-sm text-purple-700 font-semibold">
                  Reports Done
                </p>

                <p className="text-2xl font-bold text-purple-800 mt-1">
                  {reportsDone.length}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-sm text-amber-700 font-semibold">
                  Reports Left
                </p>

                <p className="text-2xl font-bold text-amber-800 mt-1">
                  {pendingReports.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RECENT NOTICES
        ===================================================== */}

        <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#30435b]">
                Recent Notices
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Important school updates
              </p>
            </div>

            <Link
              to="/teacher/notices"
              className="text-sm font-bold text-pink-500"
            >
              View all →
            </Link>
          </div>

          {activeNotices.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-3xl mb-2">📭</div>

              <p className="font-semibold text-[#30435b]">No recent notices</p>

              <p className="text-sm text-gray-400 mt-1">
                New school announcements will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeNotices.map((notice, index) => (
                <Link
                  key={notice.id}
                  to="/teacher/notices"
                  className="flex items-center gap-4 px-6 py-5 hover:bg-pink-50/30 transition"
                >
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-pink-50 flex items-center justify-center text-xl">
                    {getNoticeIcon(index)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#30435b]">{notice.title}</p>

                    <p className="text-sm text-gray-400 mt-1 truncate">
                      {notice.content}
                    </p>
                  </div>

                  <div className="hidden sm:block text-xs text-gray-400">
                    {notice.notice_date}
                  </div>

                  <span className="text-pink-500 text-lg">→</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          CHILD DETAILS MODAL
      ===================================================== */}

      {selectedChild && (
        <div
          className="fixed inset-0 z-50 bg-[#263238]/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedChild(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-7 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-lg font-bold">
                    {getInitials(
                      selectedChild.first_name,
                      selectedChild.last_name,
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedChild.first_name} {selectedChild.last_name}
                    </h2>

                    <p className="text-white/80 text-sm mt-1">
                      {selectedChild.classroom_name || "Assigned Classroom"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedChild(null)}
                  className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 transition text-xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Attendance
                  </p>

                  <p className="font-bold text-[#30435b] mt-2">
                    {selectedChild.attendance === "present"
                      ? "Present"
                      : selectedChild.attendance === "absent"
                        ? "Absent"
                        : "Not marked"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Daily Report
                  </p>

                  <p className="font-bold text-[#30435b] mt-2">
                    {selectedChild.attendance === "absent"
                      ? "Not required"
                      : selectedChild.report?.submitted
                        ? "Completed"
                        : "Pending"}
                  </p>
                </div>
              </div>

              {selectedChild.report && (
                <div className="rounded-2xl bg-pink-50/70 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-pink-500">
                    Today’s Report
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-400">Mood</p>

                      <p className="font-semibold text-[#30435b] mt-1 capitalize">
                        {selectedChild.report.mood || "Not recorded"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Participation</p>

                      <p className="font-semibold text-[#30435b] mt-1 capitalize">
                        {selectedChild.report.participation || "Not recorded"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Link
                  to="/teacher/reports"
                  className="flex-1 text-center px-4 py-3 rounded-xl bg-pink-500 text-white font-bold hover:bg-pink-600 transition"
                >
                  View Reports
                </Link>

                <button
                  onClick={() => setSelectedChild(null)}
                  className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
