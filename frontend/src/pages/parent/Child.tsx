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

// interface Classroom {
//   id: number;
//   name: string;
//   academic_year: string;
// }

// export default function ParentChild() {
//   const [children, setChildren] = useState<Child[]>([]);
//   const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

//   const [classroom, setClassroom] = useState<Classroom | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadChildren = async () => {
//       try {
//         const response = await api.get("/children/");
//         const childData: Child[] = response.data;

//         setChildren(childData);

//         if (childData.length > 0) {
//           setSelectedChildId(childData[0].id);
//         }
//       } catch (error) {
//         console.error("Failed to load children:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadChildren();
//   }, []);

//   useEffect(() => {
//     const loadClassroom = async () => {
//       if (!selectedChildId) {
//         setClassroom(null);
//         return;
//       }

//       const selectedChild = children.find(
//         (child) => child.id === selectedChildId,
//       );

//       if (!selectedChild?.classroom) {
//         setClassroom(null);
//         return;
//       }

//       try {
//         const response = await api.get(`/classes/${selectedChild.classroom}/`);

//         setClassroom(response.data);
//       } catch (error) {
//         console.error("Failed to load classroom:", error);
//         setClassroom(null);
//       }
//     };

//     loadClassroom();
//   }, [selectedChildId, children]);

//   if (loading) {
//     return (
//       <div className="p-8">
//         <p className="text-gray-500">Loading child information...</p>
//       </div>
//     );
//   }

//   if (children.length === 0) {
//     return (
//       <div className="p-8">
//         <h1 className="text-3xl font-bold text-gray-800">My Child</h1>

//         <div className="bg-white rounded-2xl border border-pink-100 p-6 mt-6">
//           <p className="text-gray-500">
//             No child has been assigned to your account yet.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const child = children.find((item) => item.id === selectedChildId);

//   if (!child) {
//     return null;
//   }

//   return (
//     <div className="p-8">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">My Child</h1>

//         <p className="text-gray-500 mt-1">
//           View your child's school information.
//         </p>
//       </div>

//       {/* Child Selector */}
//       {children.length > 1 && (
//         <div className="bg-white rounded-2xl border border-pink-100 p-5 mb-8">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Select Child
//           </label>

//           <select
//             value={selectedChildId ?? ""}
//             onChange={(e) => setSelectedChildId(Number(e.target.value))}
//             className="w-full md:w-80 border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
//           >
//             {children.map((item) => (
//               <option key={item.id} value={item.id}>
//                 {item.first_name} {item.last_name}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Child Profile */}
//       <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8">
//         <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
//           <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-3xl">
//             👧
//           </div>

//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">
//               {child.first_name} {child.last_name}
//             </h2>

//             <p className="text-gray-500 mt-1">
//               {child.is_active ? "Active Student" : "Inactive Student"}
//             </p>
//           </div>
//         </div>

//         {/* Information */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//           <div>
//             <p className="text-sm text-gray-500">Date of Birth</p>

//             <p className="font-semibold text-gray-800 mt-1">
//               {child.date_of_birth || "Not available"}
//             </p>
//           </div>

//           <div>
//             <p className="text-sm text-gray-500">Roll Number</p>

//             <p className="font-semibold text-gray-800 mt-1">
//               {child.roll_number || "Not assigned"}
//             </p>
//           </div>

//           <div>
//             <p className="text-sm text-gray-500">Class</p>

//             <p className="font-semibold text-gray-800 mt-1">
//               {classroom?.name || "Not assigned"}
//             </p>
//           </div>

//           <div>
//             <p className="text-sm text-gray-500">Academic Year</p>

//             <p className="font-semibold text-gray-800 mt-1">
//               {classroom?.academic_year || "Not available"}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  classroom?: number | null;
  classroom_name?: string;
  roll_number?: number | null;
  is_active?: boolean;
};

type AttendanceRecord = {
  id: number;
  child: number;
  attendance_date: string;
  status: "present" | "absent";
};

type DailyReport = {
  id: number;
  child: number;
  report_date: string;
  mood?: string;
  participation?: string;
  submitted: boolean;
};

function getLocalDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .split("T")[0];
}

function formatDate(dateString?: string) {
  if (!dateString) return "Not available";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function calculateAge(dateOfBirth?: string) {
  if (!dateOfBirth) return null;

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function formatValue(value?: string) {
  if (!value) return "Not recorded";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ParentChild() {
  const today = getLocalDate();

  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);

  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [childrenResponse, attendanceResponse, reportsResponse] =
          await Promise.all([
            api.get("/children/"),
            api.get(`/attendance/?date=${today}`),
            api.get(`/daily-reports/?date=${today}`),
          ]);

        const childrenData =
          childrenResponse.data.results ?? childrenResponse.data;

        const attendanceData =
          attendanceResponse.data.results ?? attendanceResponse.data;

        const reportsData =
          reportsResponse.data.results ?? reportsResponse.data;

        setChildren(childrenData);
        setAttendance(attendanceData);
        setReports(reportsData);

        // Restore previously selected child
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
        console.error("Failed to load child information:", err);

        setError(
          "We couldn't load your child's information. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [today]);

  // =====================================================
  // SELECTED CHILD
  // =====================================================

  const selectedChild = useMemo(() => {
    return children.find((child) => child.id === selectedChildId);
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
  // SELECT CHILD
  // =====================================================

  const selectChild = (child: Child) => {
    setSelectedChildId(child.id);

    localStorage.setItem("selected_child_id", String(child.id));
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8fb] p-5 md:p-7 xl:p-8">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-40 bg-white rounded-[2rem]" />

          <div className="h-24 bg-white rounded-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-white rounded-3xl" />
            <div className="h-80 bg-white rounded-3xl" />
          </div>

          <div className="h-72 bg-white rounded-3xl" />
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#fff8fb] p-5 md:p-7 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] bg-white border border-pink-100/80 shadow-[0_12px_40px_rgba(53,35,67,0.06)]">
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-pink-100/60 blur-3xl pointer-events-none" />

          <div className="absolute -bottom-24 right-48 w-56 h-56 rounded-full bg-purple-100/50 blur-3xl pointer-events-none" />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 items-center justify-center text-white text-xl shadow-lg shadow-pink-200">
                  👧
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      My Child
                    </span>

                    {children.length > 1 && (
                      <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold">
                        {children.length} Children
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#30435b]">
                    Your Child
                  </h1>

                  <p className="mt-2 text-sm md:text-base text-gray-500">
                    View your child's information and today's school status.
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
            CHILD SWITCHER
        ===================================================== */}

        {children.length > 1 && (
          <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                  My Children
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Select a child to view their information.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {children.map((child) => {
                const active = child.id === selectedChildId;

                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => selectChild(child)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition ${
                      active
                        ? "bg-pink-50 border-pink-200 shadow-sm"
                        : "bg-white border-gray-100 hover:bg-gray-50 hover:border-pink-100"
                    }`}
                  >
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

                    {active && (
                      <span className="w-7 h-7 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* =====================================================
            NO CHILD
        ===================================================== */}

        {!selectedChild && (
          <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-pink-50 flex items-center justify-center text-3xl">
              👧
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#30435b]">
              No child information available
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Please contact the school if your child's information should be
              linked to this account.
            </p>
          </section>
        )}

        {/* =====================================================
            CHILD DETAILS
        ===================================================== */}

        {selectedChild && (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Profile */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
                <div className="relative bg-gradient-to-r from-pink-500 to-purple-500 px-6 md:px-8 py-8 text-white overflow-hidden">
                  <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-white/10" />

                  <div className="relative flex items-center gap-5">
                    <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold shadow-lg">
                      {getInitials(
                        selectedChild.first_name,
                        selectedChild.last_name,
                      )}
                    </div>

                    <div>
                      <p className="text-white/70 text-xs uppercase tracking-widest font-bold">
                        Child Profile
                      </p>

                      <h2 className="text-2xl md:text-3xl font-bold mt-1">
                        {selectedChild.first_name} {selectedChild.last_name}
                      </h2>

                      <p className="text-white/80 text-sm mt-1">
                        {selectedChild.classroom_name || "Assigned classroom"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-[#fff8fb] border border-pink-100 p-5">
                      <p className="text-xs uppercase tracking-wide font-bold text-gray-400">
                        Full Name
                      </p>

                      <p className="font-bold text-[#30435b] mt-2">
                        {selectedChild.first_name} {selectedChild.last_name}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fff8fb] border border-pink-100 p-5">
                      <p className="text-xs uppercase tracking-wide font-bold text-gray-400">
                        Classroom
                      </p>

                      <p className="font-bold text-[#30435b] mt-2">
                        {selectedChild.classroom_name || "Not assigned"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fff8fb] border border-pink-100 p-5">
                      <p className="text-xs uppercase tracking-wide font-bold text-gray-400">
                        Roll Number
                      </p>

                      <p className="font-bold text-[#30435b] mt-2">
                        {selectedChild.roll_number ?? "Not assigned"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fff8fb] border border-pink-100 p-5">
                      <p className="text-xs uppercase tracking-wide font-bold text-gray-400">
                        Date of Birth
                      </p>

                      <p className="font-bold text-[#30435b] mt-2">
                        {formatDate(selectedChild.date_of_birth)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fff8fb] border border-pink-100 p-5">
                      <p className="text-xs uppercase tracking-wide font-bold text-gray-400">
                        Age
                      </p>

                      <p className="font-bold text-[#30435b] mt-2">
                        {calculateAge(selectedChild.date_of_birth) !== null
                          ? `${calculateAge(selectedChild.date_of_birth)} years`
                          : "Not available"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#fff8fb] border border-pink-100 p-5">
                      <p className="text-xs uppercase tracking-wide font-bold text-gray-400">
                        Status
                      </p>

                      <p className="font-bold text-green-600 mt-2">
                        {selectedChild.is_active === false
                          ? "Inactive"
                          : "Active"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Status */}
              <div className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-[#30435b]">
                    Today's Status
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(today)}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="rounded-2xl bg-green-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                        {selectedAttendance?.status === "present"
                          ? "✓"
                          : selectedAttendance?.status === "absent"
                            ? "—"
                            : "?"}
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Attendance
                        </p>

                        <p className="font-bold text-[#30435b] mt-1">
                          {selectedAttendance?.status === "present"
                            ? "Present"
                            : selectedAttendance?.status === "absent"
                              ? "Absent"
                              : "Not marked"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-purple-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                        📝
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Daily Report
                        </p>

                        <p className="font-bold text-[#30435b] mt-1">
                          {selectedAttendance?.status === "absent"
                            ? "Not required"
                            : selectedReport?.submitted
                              ? "Available"
                              : "Not available yet"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Link
                      to="/parent/attendance"
                      className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-pink-500 text-white font-bold text-sm hover:bg-pink-600 transition"
                    >
                      View Attendance
                    </Link>

                    <Link
                      to="/parent/reports"
                      className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-pink-50 text-pink-600 font-bold text-sm hover:bg-pink-100 transition"
                    >
                      View Daily Reports
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                TODAY'S REPORT SUMMARY
            ================================================= */}

            <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#30435b]">
                    Today's Report
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    A quick summary of your child's day
                  </p>
                </div>

                <Link
                  to="/parent/reports"
                  className="text-sm font-bold text-pink-500 hover:text-pink-600"
                >
                  View full report →
                </Link>
              </div>

              {selectedAttendance?.status === "absent" ? (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                    🏠
                  </div>

                  <p className="font-bold text-[#30435b] mt-4">
                    No daily report for today
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    {selectedChild.first_name} was absent today.
                  </p>
                </div>
              ) : !selectedReport?.submitted ? (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
                    📝
                  </div>

                  <p className="font-bold text-[#30435b] mt-4">
                    Report not available yet
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    The daily report will appear here once the teacher submits
                    it.
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-pink-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-pink-500">
                        Mood
                      </p>

                      <p className="font-bold text-[#30435b] mt-2 capitalize">
                        {formatValue(selectedReport.mood)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-purple-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-purple-500">
                        Participation
                      </p>

                      <p className="font-bold text-[#30435b] mt-2 capitalize">
                        {formatValue(selectedReport.participation)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
