// import { useEffect, useState } from "react";
// import api from "../../services/api";

// interface Child {
//   id: number;
//   first_name: string;
//   last_name: string;
//   date_of_birth: string;
//   roll_number: string;
//   classroom: number | null;
//   is_active: boolean;
// }

// interface DailyReport {
//   id: number;
//   child: number;
//   child_name: string;
//   report_date: string;
//   attendance_present: boolean;
//   mood: string;
//   participation: string;
//   submitted: boolean;
// }

// interface Notice {
//   id: number;
//   title: string;
//   content: string;
//   notice_date: string;
//   event_date: string | null;
//   is_active: boolean;
// }

// export default function ParentDashboard() {
//   const [children, setChildren] = useState<Child[]>([]);
//   const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
//   const [todayReports, setTodayReports] = useState<DailyReport[]>([]);
//   const [notices, setNotices] = useState<Notice[]>([]);
//   const [loading, setLoading] = useState(true);

//   const today = new Date().toISOString().split("T")[0];

//   useEffect(() => {
//     const loadDashboard = async () => {
//       try {
//         const [childrenResponse, reportsResponse, noticesResponse] =
//           await Promise.all([
//             api.get("/children/"),
//             api.get(`/daily-reports/?date=${today}`),
//             api.get("/notices/"),
//           ]);

//         const childrenData: Child[] = childrenResponse.data;
//         const reportsData: DailyReport[] = reportsResponse.data;

//         setChildren(childrenData);
//         setTodayReports(reportsData);
//         setNotices(noticesResponse.data.slice(0, 3));

//         if (childrenData.length > 0) {
//           setSelectedChildId(childrenData[0].id);
//         }
//       } catch (error) {
//         console.error("Failed to load parent dashboard:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, [today]);

//   const selectedChild =
//     children.find((child) => child.id === selectedChildId) || null;

//   const todayReport =
//     todayReports.find((report) => report.child === selectedChildId) || null;

//   if (loading) {
//     return (
//       <div className="p-8">
//         <p className="text-gray-500">Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">Parent Dashboard</h1>

//         <p className="text-gray-500 mt-1">
//           Welcome to your Lotus parent portal.
//         </p>
//       </div>

//       {/* Child Selector */}
//       {children.length > 0 ? (
//         <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <h2 className="text-lg font-bold text-gray-800">My Children</h2>

//               <p className="text-sm text-gray-500 mt-1">
//                 Select a child to view today's information.
//               </p>
//             </div>

//             {children.length > 1 && (
//               <select
//                 value={selectedChildId ?? ""}
//                 onChange={(e) => setSelectedChildId(Number(e.target.value))}
//                 className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-pink-500"
//               >
//                 {children.map((child) => (
//                   <option key={child.id} value={child.id}>
//                     {child.first_name} {child.last_name}
//                   </option>
//                 ))}
//               </select>
//             )}
//           </div>

//           {selectedChild && (
//             <div className="flex items-center gap-5 mt-6">
//               <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-2xl">
//                 👧
//               </div>

//               <div>
//                 <h2 className="text-xl font-bold text-gray-800">
//                   {selectedChild.first_name} {selectedChild.last_name}
//                 </h2>

//                 <p className="text-gray-500 mt-1">
//                   Roll No: {selectedChild.roll_number || "Not assigned"}
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="bg-white rounded-2xl border border-pink-100 p-6 mb-6">
//           <p className="text-gray-500">
//             No child has been assigned to your account yet.
//           </p>
//         </div>
//       )}

//       {/* Today's Overview */}
//       {selectedChild && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
//           <div className="bg-white rounded-2xl border border-pink-100 p-6">
//             <p className="text-sm text-gray-500">Today's Attendance</p>

//             <p className="text-2xl font-bold text-gray-800 mt-2">
//               {todayReport
//                 ? todayReport.attendance_present
//                   ? "Present"
//                   : "Absent"
//                 : "Not Recorded"}
//             </p>
//           </div>

//           <div className="bg-white rounded-2xl border border-pink-100 p-6">
//             <p className="text-sm text-gray-500">Today's Mood</p>

//             <p className="text-2xl font-bold text-gray-800 mt-2 capitalize">
//               {todayReport?.mood || "Not Recorded"}
//             </p>
//           </div>

//           <div className="bg-white rounded-2xl border border-pink-100 p-6">
//             <p className="text-sm text-gray-500">Report Status</p>

//             <p className="text-2xl font-bold text-gray-800 mt-2">
//               {todayReport
//                 ? todayReport.submitted
//                   ? "Submitted"
//                   : "Draft"
//                 : "Pending"}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Recent Notices */}
//       <div className="bg-white rounded-2xl border border-pink-100 p-6">
//         <div className="mb-5">
//           <h2 className="text-xl font-bold text-gray-800">Recent Notices</h2>

//           <p className="text-sm text-gray-500 mt-1">
//             Important updates from Lotus Montessori
//           </p>
//         </div>

//         {notices.length === 0 ? (
//           <p className="text-gray-500">No notices available.</p>
//         ) : (
//           <div className="space-y-4">
//             {notices.map((notice) => (
//               <div
//                 key={notice.id}
//                 className="border border-pink-100 rounded-xl p-4"
//               >
//                 <h3 className="font-semibold text-gray-800">{notice.title}</h3>

//                 <p className="text-sm text-gray-500 mt-1">
//                   {notice.notice_date}
//                 </p>

//                 <p className="text-gray-600 mt-3 line-clamp-2">
//                   {notice.content}
//                 </p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

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
  date_of_birth?: string;
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
  morning_snack?: string;
  lunch?: string;
  rest_status?: string;
  rest_start?: string | null;
  rest_end?: string | null;
  participation?: string;
  teacher_observation?: string;
  activities?: number[];
  activity_names?: string[];
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

function formatShortDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getNoticeIcon(index: number) {
  const icons = ["📢", "🏃", "👨‍👩‍👧", "🎨", "🌸"];

  return icons[index % icons.length];
}

function formatValue(value?: string) {
  if (!value) return "Not recorded";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ParentDashboard() {
  const today = getLocalDate();

  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showChildSelector, setShowChildSelector] = useState(false);

  // =====================================================
  // CURRENT USER
  // =====================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    };

    loadUser();
  }, []);

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

        // =================================================
        // RESTORE SELECTED CHILD
        // =================================================

        const savedChildId = localStorage.getItem("selected_child_id");

        if (
          savedChildId &&
          childrenData.some((child: Child) => child.id === Number(savedChildId))
        ) {
          setSelectedChildId(Number(savedChildId));
        } else if (childrenData.length > 0) {
          setSelectedChildId(childrenData[0].id);

          localStorage.setItem("selected_child_id", String(childrenData[0].id));
        }
      } catch (err) {
        console.error("Failed to load parent dashboard:", err);

        setError(
          "We couldn't load your child's information right now. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [today]);

  // =====================================================
  // SELECTED CHILD
  // =====================================================

  const selectedChild = useMemo(() => {
    return children.find((child) => child.id === selectedChildId) || null;
  }, [children, selectedChildId]);

  const selectedAttendance = useMemo(() => {
    if (!selectedChild) return undefined;

    return attendance.find((record) => record.child === selectedChild.id);
  }, [attendance, selectedChild]);

  const selectedReport = useMemo(() => {
    if (!selectedChild) return undefined;

    return reports.find((report) => report.child === selectedChild.id);
  }, [reports, selectedChild]);

  // =====================================================
  // PARENT NAME
  // =====================================================

  const parentName =
    [currentUser?.first_name, currentUser?.last_name]
      .filter(Boolean)
      .join(" ") || "Parent";

  // =====================================================
  // SELECT CHILD
  // =====================================================

  const handleSelectChild = (child: Child) => {
    setSelectedChildId(child.id);

    localStorage.setItem("selected_child_id", String(child.id));

    setShowChildSelector(false);
  };

  // =====================================================
  // NOTICE DATA
  // =====================================================

  const activeNotices = notices
    .filter((notice) => notice.is_active !== false)
    .slice(0, 4);

  // =====================================================
  // CHILD STATUS
  // =====================================================

  const childStatus = children.map((child) => {
    const childAttendance = attendance.find(
      (record) => record.child === child.id,
    );

    const childReport = reports.find((report) => report.child === child.id);

    return {
      child,
      attendance: childAttendance,
      report: childReport,
    };
  });

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8fb] p-5 md:p-7 xl:p-8">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-44 bg-white rounded-[2rem]" />

          <div className="h-24 bg-white rounded-3xl" />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-36 bg-white rounded-3xl" />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 h-[500px] bg-white rounded-3xl" />
            <div className="h-[500px] bg-white rounded-3xl" />
          </div>

          <div className="h-72 bg-white rounded-3xl" />
        </div>
      </div>
    );
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <div
      className="min-h-screen bg-[#fff8fb] p-5 md:p-7 xl:p-8"
      onClick={() => {
        if (showChildSelector) {
          setShowChildSelector(false);
        }
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="relative overflow-visible rounded-[2rem] bg-white border border-pink-100/80 shadow-[0_12px_40px_rgba(53,35,67,0.06)]">
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-pink-100/60 blur-3xl pointer-events-none" />

          <div className="absolute -bottom-24 right-48 w-56 h-56 rounded-full bg-purple-100/50 blur-3xl pointer-events-none" />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* LEFT */}
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 items-center justify-center text-white text-xl font-bold shadow-lg shadow-pink-200">
                  {currentUser?.first_name?.charAt(0).toUpperCase() || "P"}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      Parent Dashboard
                    </span>

                    {children.length > 1 && (
                      <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold">
                        {children.length} Children
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#30435b]">
                    Welcome, {currentUser?.first_name || parentName} 👋
                  </h1>

                  <p className="mt-2 text-sm md:text-base text-gray-500 max-w-xl">
                    Here's a quick look at your{" "}
                    {children.length === 1 ? "child's" : "children's"} day at
                    Lotus.
                  </p>
                </div>
              </div>

              {/* DATE */}
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
            CHILD SELECTOR
        ===================================================== */}

        {children.length > 0 && (
          <section className="relative">
            <div
              className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                    Viewing
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {children.length > 1
                      ? "Select a child to view their day"
                      : "Your child's information"}
                  </p>
                </div>

                <div className="relative w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowChildSelector((value) => !value)}
                    className="w-full sm:min-w-[320px] flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-[#fff8fb] border border-pink-100 hover:border-pink-200 transition"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-sm font-bold text-pink-600">
                        {selectedChild
                          ? getInitials(
                              selectedChild.first_name,
                              selectedChild.last_name,
                            )
                          : "?"}
                      </div>

                      <div>
                        <p className="font-bold text-[#30435b]">
                          {selectedChild
                            ? `${selectedChild.first_name} ${selectedChild.last_name}`
                            : "Select child"}
                        </p>

                        {selectedChild && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {selectedChild.classroom_name ||
                              "Assigned classroom"}
                            {selectedChild.roll_number
                              ? ` • Roll No. ${selectedChild.roll_number}`
                              : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-gray-400 transition-transform ${
                        showChildSelector ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {showChildSelector && children.length > 1 && (
                    <div className="absolute z-30 mt-2 right-0 w-full sm:min-w-[320px] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                      {children.map((child) => {
                        const active = child.id === selectedChildId;

                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => handleSelectChild(child)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                              active ? "bg-pink-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-xs font-bold text-pink-600">
                              {getInitials(child.first_name, child.last_name)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#30435b]">
                                {child.first_name} {child.last_name}
                              </p>

                              <p className="text-xs text-gray-400 mt-0.5">
                                {child.classroom_name || "Assigned classroom"}
                                {child.roll_number
                                  ? ` • Roll No. ${child.roll_number}`
                                  : ""}
                              </p>
                            </div>

                            {active && (
                              <span className="text-pink-500 font-bold">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            NO CHILDREN
        ===================================================== */}

        {children.length === 0 && (
          <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-50 flex items-center justify-center text-3xl">
              👧
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#30435b]">
              No child information available
            </h2>

            <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
              Your child's information will appear here once the school has
              connected your account to a child.
            </p>
          </section>
        )}

        {/* =====================================================
            SELECTED CHILD OVERVIEW
        ===================================================== */}

        {selectedChild && (
          <>
            {/* Child identity */}
            <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
              <div className="p-6 md:p-7">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-lg font-bold text-pink-600">
                      {getInitials(
                        selectedChild.first_name,
                        selectedChild.last_name,
                      )}
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-pink-500">
                        Your Child
                      </p>

                      <h2 className="text-2xl font-bold text-[#30435b] mt-1">
                        {selectedChild.first_name} {selectedChild.last_name}
                      </h2>

                      <p className="text-sm text-gray-400 mt-1">
                        {selectedChild.classroom_name || "Assigned classroom"}

                        {selectedChild.roll_number
                          ? ` • Roll No. ${selectedChild.roll_number}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/parent/child"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-pink-50 text-pink-600 font-bold text-sm hover:bg-pink-100 transition"
                  >
                    View child details →
                  </Link>
                </div>
              </div>
            </section>

            {/* =================================================
                STATUS CARDS
            ================================================= */}

            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {/* Attendance */}
              <div className="bg-white rounded-3xl border border-green-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Attendance
                    </p>

                    <p className="mt-3 text-2xl font-bold text-[#30435b]">
                      {selectedAttendance?.status === "present"
                        ? "Present"
                        : selectedAttendance?.status === "absent"
                          ? "Absent"
                          : "Not marked"}
                    </p>

                    <p
                      className={`mt-2 text-sm font-medium ${
                        selectedAttendance?.status === "present"
                          ? "text-green-600"
                          : selectedAttendance?.status === "absent"
                            ? "text-gray-500"
                            : "text-amber-600"
                      }`}
                    >
                      {selectedAttendance?.status === "present"
                        ? "At school today"
                        : selectedAttendance?.status === "absent"
                          ? "Not present today"
                          : "Attendance not recorded yet"}
                    </p>
                  </div>

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                      selectedAttendance?.status === "present"
                        ? "bg-green-50"
                        : selectedAttendance?.status === "absent"
                          ? "bg-gray-100"
                          : "bg-amber-50"
                    }`}
                  >
                    {selectedAttendance?.status === "present"
                      ? "✓"
                      : selectedAttendance?.status === "absent"
                        ? "—"
                        : "?"}
                  </div>
                </div>
              </div>

              {/* Mood */}
              <div className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Today's Mood
                    </p>

                    <p className="mt-3 text-2xl font-bold text-[#30435b] capitalize">
                      {selectedReport?.submitted
                        ? formatValue(selectedReport.mood)
                        : "Not recorded"}
                    </p>

                    <p className="mt-2 text-sm text-purple-600 font-medium">
                      {selectedReport?.submitted
                        ? "From today's report"
                        : "Waiting for daily report"}
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl">
                    😊
                  </div>
                </div>
              </div>

              {/* Daily Report */}
              <div className="bg-white rounded-3xl border border-purple-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Daily Report
                    </p>

                    <p className="mt-3 text-2xl font-bold text-[#30435b]">
                      {selectedAttendance?.status === "absent"
                        ? "Not required"
                        : selectedReport?.submitted
                          ? "Available"
                          : "Not available"}
                    </p>

                    <p
                      className={`mt-2 text-sm font-medium ${
                        selectedReport?.submitted
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {selectedAttendance?.status === "absent"
                        ? "Child was absent"
                        : selectedReport?.submitted
                          ? "Today's report is ready"
                          : "Teacher has not submitted it yet"}
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">
                    📝
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                TODAY'S REPORT + CHILDREN OVERVIEW
            ================================================= */}

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Today's Report */}
              <div className="xl:col-span-2 bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#30435b]">
                      Today's Update
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                      {selectedChild.first_name}'s day at Lotus
                    </p>
                  </div>

                  {selectedReport?.submitted && (
                    <Link
                      to="/parent/reports"
                      className="text-sm font-bold text-pink-500 hover:text-pink-600"
                    >
                      View report →
                    </Link>
                  )}
                </div>

                {selectedAttendance?.status === "absent" ? (
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                      🏠
                    </div>

                    <p className="font-bold text-[#30435b] mt-4">
                      {selectedChild.first_name} was absent today
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      A daily report is not required for an absent day.
                    </p>
                  </div>
                ) : !selectedReport?.submitted ? (
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
                      📝
                    </div>

                    <p className="font-bold text-[#30435b] mt-4">
                      Today's report is not available yet
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      The teacher has not completed today's report yet.
                    </p>
                  </div>
                ) : (
                  <div className="p-6">
                    {/* Mood + Participation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-pink-50/70 p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-pink-500">
                          Mood
                        </p>

                        <p className="font-bold text-[#30435b] mt-2 capitalize">
                          {formatValue(selectedReport.mood)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-purple-50/70 p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-purple-500">
                          Participation
                        </p>

                        <p className="font-bold text-[#30435b] mt-2 capitalize">
                          {formatValue(selectedReport.participation)}
                        </p>
                      </div>
                    </div>

                    {/* Meals + Rest */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <div className="rounded-2xl bg-orange-50 p-4">
                        <p className="text-xs font-bold text-orange-500">
                          🍎 Morning Snack
                        </p>

                        <p className="font-semibold text-[#30435b] mt-2 capitalize">
                          {formatValue(selectedReport.morning_snack)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-green-50 p-4">
                        <p className="text-xs font-bold text-green-600">
                          🍱 Lunch
                        </p>

                        <p className="font-semibold text-[#30435b] mt-2 capitalize">
                          {formatValue(selectedReport.lunch)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-blue-50 p-4">
                        <p className="text-xs font-bold text-blue-600">
                          😴 Rest
                        </p>

                        <p className="font-semibold text-[#30435b] mt-2 capitalize">
                          {formatValue(selectedReport.rest_status)}
                        </p>

                        {selectedReport.rest_start &&
                          selectedReport.rest_end && (
                            <p className="text-xs text-gray-400 mt-1">
                              {selectedReport.rest_start} –{" "}
                              {selectedReport.rest_end}
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Activities */}
                    {selectedReport.activity_names &&
                      selectedReport.activity_names.length > 0 && (
                        <div className="mt-5">
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Activities
                          </p>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {selectedReport.activity_names.map((activity) => (
                              <span
                                key={activity}
                                className="px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-xs font-bold"
                              >
                                {activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Observation */}
                    {selectedReport.teacher_observation && (
                      <div className="mt-5 rounded-2xl bg-[#fff8fb] border border-pink-100 p-5">
                        <p className="text-xs font-bold uppercase tracking-wide text-pink-500">
                          Teacher's Observation
                        </p>

                        <p className="text-sm leading-6 text-gray-600 mt-2">
                          {selectedReport.teacher_observation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Other Children */}
              <div className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-[#30435b]">
                    My Children
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">Quick overview</p>
                </div>

                <div className="divide-y divide-gray-100">
                  {childStatus.map(
                    ({ child, attendance: childAttendance, report }) => {
                      const isSelected = child.id === selectedChildId;

                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleSelectChild(child)}
                          className={`w-full text-left p-5 transition ${
                            isSelected ? "bg-pink-50/60" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-xs font-bold text-pink-600">
                              {getInitials(child.first_name, child.last_name)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#30435b] truncate">
                                {child.first_name} {child.last_name}
                              </p>

                              <p className="text-xs text-gray-400 mt-0.5">
                                {child.classroom_name || "Assigned classroom"}
                              </p>
                            </div>

                            {isSelected && (
                              <span className="text-pink-500 font-bold">✓</span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3 ml-14">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                childAttendance?.status === "present"
                                  ? "bg-green-50 text-green-700"
                                  : childAttendance?.status === "absent"
                                    ? "bg-gray-100 text-gray-500"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {childAttendance?.status === "present"
                                ? "✓ Present"
                                : childAttendance?.status === "absent"
                                  ? "Absent"
                                  : "Not marked"}
                            </span>

                            {childAttendance?.status === "absent" ? (
                              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold">
                                Report not required
                              </span>
                            ) : report?.submitted ? (
                              <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold">
                                Report ready
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold">
                                Report pending
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </section>
          </>
        )}

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
              to="/parent/notices"
              className="text-sm font-bold text-pink-500 hover:text-pink-600"
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
                  to="/parent/notices"
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
                    {formatShortDate(notice.notice_date)}
                  </div>

                  <span className="text-pink-500 text-lg">→</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
