import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  classroom?: number | null;
  classroom_name?: string;
  is_active?: boolean;
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  is_active?: boolean;
}

interface Parent {
  id: number;
  first_name: string;
  last_name: string;
}

interface Classroom {
  id: number;
  name: string;
  academic_year?: string;
}

interface Attendance {
  id: number;
  child: number;
  child_name: string;
  status: "present" | "absent";
  attendance_date: string;
  classroom_name?: string;
}

interface DailyReport {
  id: number;
  child: number;
  child_name: string;
  report_date: string;
  submitted: boolean;
  classroom_name?: string;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  notice_date: string;
  event_date?: string | null;
  is_active: boolean;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getLocalDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
}

function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateString: string) {
  if (!dateString) return "";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Dashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);

  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = getLocalDate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          childrenResponse,
          teachersResponse,
          parentsResponse,
          classesResponse,
          attendanceResponse,
          reportsResponse,
          noticesResponse,
        ] = await Promise.all([
          api.get("/children/"),
          api.get("/teachers/"),
          api.get("/parents/"),
          api.get("/classes/"),
          api.get(`/attendance/?date=${today}`),
          api.get(`/daily-reports/?date=${today}`),
          api.get("/notices/"),
        ]);

        const childrenData =
          childrenResponse.data.results ?? childrenResponse.data;

        const teachersData =
          teachersResponse.data.results ?? teachersResponse.data;

        const parentsData =
          parentsResponse.data.results ?? parentsResponse.data;

        const classesData =
          classesResponse.data.results ?? classesResponse.data;

        const attendanceData =
          attendanceResponse.data.results ?? attendanceResponse.data;

        const reportsData =
          reportsResponse.data.results ?? reportsResponse.data;

        const noticesData =
          noticesResponse.data.results ?? noticesResponse.data;

        setChildren(childrenData);
        setTeachers(teachersData);
        setParents(parentsData);
        setClasses(classesData);
        setAttendance(attendanceData);
        setDailyReports(reportsData);
        setNotices(noticesData);
      } catch (error) {
        console.error("Failed to load dashboard:", error);

        setError(
          "We couldn't load the dashboard information. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [today]);

  /*
   * =====================================================
   * SUMMARY CALCULATIONS
   * =====================================================
   */

  const totalUsers = useMemo(() => {
    return children.length + teachers.length + parents.length;
  }, [children, teachers, parents]);

  const presentChildren = useMemo(() => {
    return attendance.filter((item) => item.status === "present");
  }, [attendance]);

  const absentChildren = useMemo(() => {
    return attendance.filter((item) => item.status === "absent");
  }, [attendance]);

  const submittedReports = useMemo(() => {
    return dailyReports.filter((report) => report.submitted);
  }, [dailyReports]);

  /*
   * A child who is present today but does not have
   * a daily report yet.
   */
  const pendingReportChildren = useMemo(() => {
    const reportChildIds = new Set(dailyReports.map((report) => report.child));

    return presentChildren.filter(
      (record) => !reportChildIds.has(record.child),
    );
  }, [dailyReports, presentChildren]);

  /*
   * Attendance percentage based on records marked today.
   */
  const attendanceRate = useMemo(() => {
    if (attendance.length === 0) return 0;

    return Math.round((presentChildren.length / attendance.length) * 100);
  }, [attendance, presentChildren]);

  /*
   * Report completion percentage among children
   * who were present today.
   */
  const reportCompletionRate = useMemo(() => {
    if (presentChildren.length === 0) return 0;

    const completed = presentChildren.filter((attendanceRecord) =>
      dailyReports.some(
        (report) => report.child === attendanceRecord.child && report.submitted,
      ),
    );

    return Math.round((completed.length / presentChildren.length) * 100);
  }, [presentChildren, dailyReports]);

  /*
   * Active notices only.
   */
  const activeNotices = useMemo(() => {
    return notices.filter((notice) => notice.is_active).slice(0, 4);
  }, [notices]);

  /*
   * Count children in each classroom.
   */
  const classroomStats = useMemo(() => {
    return classes.map((classroom) => {
      const count = children.filter(
        (child) =>
          child.classroom === classroom.id ||
          child.classroom_name === classroom.name,
      ).length;

      return {
        ...classroom,
        childCount: count,
      };
    });
  }, [classes, children]);

  /*
   * =====================================================
   * LOADING STATE
   * =====================================================
   */

  if (loading) {
    return (
      // <div className="min-h-screen bg-[#fff8fb] p-5 md:p-7 xl:p-8">
      //   < className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-44 rounded-[2rem] bg-white" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-36 rounded-3xl bg-white" />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 h-96 rounded-3xl bg-white" />
          <div className="h-96 rounded-3xl bg-white" />
        </div>

        <div className="h-72 rounded-3xl bg-white" />
      </div>
    );
  }

  /*
   * =====================================================
   * DASHBOARD
   * =====================================================
   */

  return (
    <div className="w-full space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* =================================================
            ADMIN HEADER
            DO NOT CHANGE
        ================================================= */}

        <section className="relative overflow-hidden rounded-[2rem] bg-white border border-pink-100/80 shadow-[0_12px_40px_rgba(53,35,67,0.06)]">
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-pink-100/60 blur-3xl pointer-events-none" />

          <div className="absolute -bottom-24 right-48 w-56 h-56 rounded-full bg-purple-100/50 blur-3xl pointer-events-none" />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 items-center justify-center text-white text-xl font-bold shadow-lg shadow-pink-200">
                  A
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      Admin Dashboard
                    </span>

                    <span className="inline-flex px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold">
                      Administrator
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#30435b]">
                    {getGreeting()}, Administrator 👋
                  </h1>

                  <p className="mt-2 text-sm md:text-base text-gray-500 max-w-2xl">
                    Here's an overview of Lotus CMS and your school today.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#fff8fb] border border-pink-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm">
                  📅
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    Today
                  </p>

                  <p className="text-sm font-bold text-[#30435b]">
                    {formatToday()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            MAIN STATISTICS
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <Link
            to="/admin/children"
            className="group bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(53,35,67,0.08)] transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Total Children
                </p>

                <p className="mt-3 text-4xl font-bold text-[#30435b]">
                  {children.length}
                </p>

                <p className="mt-2 text-sm text-gray-400">Enrolled students</p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                👧
              </div>
            </div>

            <div className="mt-5 flex items-center gap-1 text-xs font-bold text-pink-500">
              Manage children
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>

          <Link
            to="/admin/teachers"
            className="group bg-white rounded-3xl border border-purple-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(53,35,67,0.08)] transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Total Teachers
                </p>

                <p className="mt-3 text-4xl font-bold text-[#30435b]">
                  {teachers.length}
                </p>

                <p className="mt-2 text-sm text-gray-400">Teaching staff</p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                👩‍🏫
              </div>
            </div>

            <div className="mt-5 flex items-center gap-1 text-xs font-bold text-purple-500">
              Manage teachers
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>

          <Link
            to="/admin/parents"
            className="group bg-white rounded-3xl border border-blue-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(53,35,67,0.08)] transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Total Parents
                </p>

                <p className="mt-3 text-4xl font-bold text-[#30435b]">
                  {parents.length}
                </p>

                <p className="mt-2 text-sm text-gray-400">Parent accounts</p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                👨‍👩‍👧
              </div>
            </div>

            <div className="mt-5 flex items-center gap-1 text-xs font-bold text-blue-500">
              Manage parents
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>

          <Link
            to="/admin/classes"
            className="group bg-white rounded-3xl border border-green-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(53,35,67,0.08)] transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Total Classes
                </p>

                <p className="mt-3 text-4xl font-bold text-[#30435b]">
                  {classes.length}
                </p>

                <p className="mt-2 text-sm text-gray-400">Active classrooms</p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-2xl group-hover:scale-105 transition">
                🏫
              </div>
            </div>

            <div className="mt-5 flex items-center gap-1 text-xs font-bold text-green-500">
              Manage classes
              <span className="group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>
        </section>

        {/* =================================================
            TODAY'S SCHOOL STATUS
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Attendance */}
          <Link
            to="/admin/reports"
            className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5 hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Today's Attendance
                </p>

                <p className="mt-2 text-3xl font-bold text-[#30435b]">
                  {attendance.length}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {attendance.length === 0
                    ? "Not marked yet"
                    : `${attendanceRate}% present`}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-xl">
                📋
              </div>
            </div>

            {attendance.length > 0 && (
              <div className="mt-4">
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>

                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-green-600 font-semibold">
                    {presentChildren.length} Present
                  </span>

                  <span className="text-red-500 font-semibold">
                    {absentChildren.length} Absent
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Present */}
          <div className="bg-white rounded-3xl border border-green-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Present Today
                </p>

                <p className="mt-2 text-3xl font-bold text-[#30435b]">
                  {presentChildren.length}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Children marked present
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-xl">
                ✓
              </div>
            </div>
          </div>

          {/* Absent */}
          <div className="bg-white rounded-3xl border border-red-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Absent Today
                </p>

                <p className="mt-2 text-3xl font-bold text-[#30435b]">
                  {absentChildren.length}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Children marked absent
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-xl">
                —
              </div>
            </div>
          </div>

          {/* Reports */}
          <Link
            to="/admin/reports"
            className="bg-white rounded-3xl border border-purple-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5 hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Daily Reports
                </p>

                <p className="mt-2 text-3xl font-bold text-[#30435b]">
                  {submittedReports.length}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {presentChildren.length === 0
                    ? "No present children"
                    : `${reportCompletionRate}% completed`}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-xl">
                📝
              </div>
            </div>

            {presentChildren.length > 0 && (
              <div className="mt-4">
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-500"
                    style={{
                      width: `${reportCompletionRate}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </Link>
        </section>

        {/* =================================================
            ATTENTION REQUIRED + CLASSROOMS
        ================================================= */}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Attention Required */}
          <div className="xl:col-span-2 bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#30435b]">
                  Today's Attention
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Items that may need administrative attention
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
                {pendingReportChildren.length} pending
              </span>
            </div>

            {pendingReportChildren.length === 0 &&
            absentChildren.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-green-50 flex items-center justify-center text-2xl mb-4">
                  ✓
                </div>

                <p className="font-semibold text-[#30435b]">
                  Everything looks good
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  No attendance or report issues require attention right now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingReportChildren.slice(0, 5).map((record) => (
                  <div
                    key={`pending-${record.child}`}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        📝
                      </div>

                      <div>
                        <p className="font-semibold text-[#30435b]">
                          {record.child_name}
                        </p>

                        <p className="text-xs text-gray-400 mt-0.5">
                          Present but daily report not completed
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/admin/reports"
                      className="text-xs font-bold text-purple-500 hover:text-purple-700"
                    >
                      View reports
                    </Link>
                  </div>
                ))}

                {absentChildren.slice(0, 5).map((record) => (
                  <div
                    key={`absent-${record.child}`}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        —
                      </div>

                      <div>
                        <p className="font-semibold text-[#30435b]">
                          {record.child_name}
                        </p>

                        <p className="text-xs text-gray-400 mt-0.5">
                          Marked absent today
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-red-500">
                      Absent
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Classroom Overview */}
          <div className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#30435b]">Classrooms</h2>

                <p className="text-sm text-gray-400 mt-1">Children by class</p>
              </div>

              <Link
                to="/admin/classes"
                className="text-sm font-bold text-pink-500"
              >
                View →
              </Link>
            </div>

            {classroomStats.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-3xl mb-3">🏫</div>

                <p className="font-semibold text-[#30435b]">No classrooms</p>

                <p className="text-sm text-gray-400 mt-1">
                  Create a classroom to begin.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {classroomStats.slice(0, 6).map((classroom) => (
                  <div
                    key={classroom.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-xs font-bold text-pink-600">
                        {classroom.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-sm text-[#30435b]">
                          {classroom.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {classroom.academic_year || "Current class"}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-bold text-[#30435b]">
                      {classroom.childCount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            RECENT CHILDREN
        ================================================= */}

        <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#30435b]">Children</h2>

              <p className="text-sm text-gray-400 mt-1">
                Students currently registered in Lotus CMS
              </p>
            </div>

            <Link
              to="/admin/children"
              className="text-sm font-bold text-pink-500 hover:text-pink-600"
            >
              Manage all →
            </Link>
          </div>

          {children.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-3xl mb-3">👧</div>

              <p className="font-semibold text-[#30435b]">No children found</p>

              <p className="text-sm text-gray-400 mt-1">
                Add children to begin managing your school.
              </p>

              <Link
                to="/admin/children"
                className="inline-flex mt-5 px-4 py-2.5 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-600 transition"
              >
                Add Child
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
              {children.slice(0, 6).map((child) => (
                <div
                  key={child.id}
                  className="bg-white p-5 flex items-center gap-4 hover:bg-pink-50/30 transition"
                >
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-sm font-bold text-pink-600">
                    {getInitials(child.first_name, child.last_name)}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-[#30435b] truncate">
                      {child.first_name} {child.last_name}
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {child.classroom_name || "No classroom assigned"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            RECENT NOTICES
        ================================================= */}

        <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#30435b]">
                Recent Notices
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Latest school announcements
              </p>
            </div>

            <Link
              to="/admin/notices"
              className="text-sm font-bold text-pink-500 hover:text-pink-600"
            >
              Manage notices →
            </Link>
          </div>

          {activeNotices.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-50 flex items-center justify-center text-2xl mb-4">
                📢
              </div>

              <p className="font-semibold text-[#30435b]">No active notices</p>

              <p className="text-sm text-gray-400 mt-1">
                Create a notice when you have an announcement to share.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="px-6 py-4 flex items-start gap-4 hover:bg-pink-50/30 transition"
                >
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-pink-50 flex items-center justify-center">
                    📢
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h3 className="font-semibold text-[#30435b]">
                        {notice.title}
                      </h3>

                      <span className="text-xs text-gray-400">
                        {formatShortDate(notice.notice_date)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {notice.content}
                    </p>

                    {notice.event_date && (
                      <p className="text-xs font-semibold text-purple-500 mt-2">
                        Event: {formatShortDate(notice.event_date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            SCHOOL OVERVIEW
        ================================================= */}

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* People overview */}
          <div className="xl:col-span-2 bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#30435b]">
                  School Overview
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Current system totals
                </p>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-xl">
                🏫
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/admin/children"
                className="rounded-2xl bg-pink-50 p-5 hover:bg-pink-100 transition"
              >
                <p className="text-sm font-semibold text-gray-500">Children</p>

                <p className="mt-2 text-3xl font-bold text-[#30435b]">
                  {children.length}
                </p>
              </Link>

              <Link
                to="/admin/teachers"
                className="rounded-2xl bg-purple-50 p-5 hover:bg-purple-100 transition"
              >
                <p className="text-sm font-semibold text-gray-500">Teachers</p>

                <p className="mt-2 text-3xl font-bold text-[#30435b]">
                  {teachers.length}
                </p>
              </Link>

              <Link
                to="/admin/parents"
                className="rounded-2xl bg-blue-50 p-5 hover:bg-blue-100 transition"
              >
                <p className="text-sm font-semibold text-gray-500">Parents</p>

                <p className="mt-2 text-3xl font-bold text-[#30435b]">
                  {parents.length}
                </p>
              </Link>
            </div>
          </div>

          {/* Total people */}
          <div className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
            <p className="text-sm font-semibold text-gray-500">
              Total Registered People
            </p>

            <div className="flex items-end gap-2 mt-4">
              <span className="text-5xl font-bold text-[#30435b]">
                {totalUsers}
              </span>

              <span className="text-sm text-gray-400 mb-2">
                accounts & records
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Children</span>

                <span className="font-bold text-[#30435b]">
                  {children.length}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Teachers</span>

                <span className="font-bold text-[#30435b]">
                  {teachers.length}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Parents</span>

                <span className="font-bold text-[#30435b]">
                  {parents.length}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#30435b]">
                Quick Actions
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Common administrative tasks
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-xl">
              ✨
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/children"
              className="group rounded-2xl border border-pink-100 bg-pink-50/50 p-5 hover:bg-pink-50 hover:-translate-y-0.5 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm mb-4">
                👧
              </div>

              <p className="font-bold text-[#30435b]">Add Child</p>

              <p className="text-sm text-gray-400 mt-1">
                Register a new student
              </p>

              <span className="inline-block mt-4 text-sm font-bold text-pink-500 group-hover:translate-x-1 transition">
                Get started →
              </span>
            </Link>

            <Link
              to="/admin/teachers"
              className="group rounded-2xl border border-purple-100 bg-purple-50/50 p-5 hover:bg-purple-50 hover:-translate-y-0.5 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm mb-4">
                👩‍🏫
              </div>

              <p className="font-bold text-[#30435b]">Add Teacher</p>

              <p className="text-sm text-gray-400 mt-1">
                Create a teacher account
              </p>

              <span className="inline-block mt-4 text-sm font-bold text-purple-500 group-hover:translate-x-1 transition">
                Get started →
              </span>
            </Link>

            <Link
              to="/admin/parents"
              className="group rounded-2xl border border-blue-100 bg-blue-50/50 p-5 hover:bg-blue-50 hover:-translate-y-0.5 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm mb-4">
                👨‍👩‍👧
              </div>

              <p className="font-bold text-[#30435b]">Add Parent</p>

              <p className="text-sm text-gray-400 mt-1">
                Create a parent account
              </p>

              <span className="inline-block mt-4 text-sm font-bold text-blue-500 group-hover:translate-x-1 transition">
                Get started →
              </span>
            </Link>

            <Link
              to="/admin/classes"
              className="group rounded-2xl border border-green-100 bg-green-50/50 p-5 hover:bg-green-50 hover:-translate-y-0.5 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm mb-4">
                🏫
              </div>

              <p className="font-bold text-[#30435b]">Create Class</p>

              <p className="text-sm text-gray-400 mt-1">
                Set up a new classroom
              </p>

              <span className="inline-block mt-4 text-sm font-bold text-green-500 group-hover:translate-x-1 transition">
                Get started →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
