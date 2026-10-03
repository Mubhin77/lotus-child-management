// import { useEffect, useState } from "react";
// import api from "../../services/api";

// interface Child {
//   id: number;
//   first_name: string;
//   last_name: string;
// }

// interface DailyReport {
//   id: number;
//   child: number;
//   report_date: string;
//   attendance_present: boolean;
//   arrival_time: string | null;
//   departure_time: string | null;
//   submitted: boolean;
// }

// export default function ParentAttendance() {
//   const [children, setChildren] = useState<Child[]>([]);
//   const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

//   const [reports, setReports] = useState<DailyReport[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadAttendance = async () => {
//       try {
//         const [childrenResponse, reportsResponse] = await Promise.all([
//           api.get("/children/"),
//           api.get("/daily-reports/"),
//         ]);

//         const childData: Child[] = childrenResponse.data;
//         const reportData: DailyReport[] = reportsResponse.data;

//         setChildren(childData);
//         setReports(reportData);

//         if (childData.length > 0) {
//           setSelectedChildId(childData[0].id);
//         }
//       } catch (error) {
//         console.error("Failed to load attendance:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadAttendance();
//   }, []);

//   if (loading) {
//     return (
//       <div className="p-8">
//         <p className="text-gray-500">
//           Loading attendance...
//         </p>
//       </div>
//     );
//   }

//   if (children.length === 0) {
//     return (
//       <div className="p-8">
//         <h1 className="text-3xl font-bold text-gray-800">
//           Attendance
//         </h1>

//         <div className="bg-white rounded-2xl border border-pink-100 p-8 mt-6">
//           <p className="text-gray-500">
//             No child has been assigned to your account yet.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const selectedChild = children.find(
//     (child) => child.id === selectedChildId
//   );

//   const childReports = reports.filter(
//     (report) => report.child === selectedChildId
//   );

//   const presentDays = childReports.filter(
//     (report) => report.attendance_present
//   ).length;

//   const absentDays = childReports.filter(
//     (report) => !report.attendance_present
//   ).length;

//   return (
//     <div className="p-8">

//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">
//           Attendance
//         </h1>

//         <p className="text-gray-500 mt-1">
//           View your child's attendance records.
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
//             onChange={(e) =>
//               setSelectedChildId(Number(e.target.value))
//             }
//             className="w-full md:w-80 border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
//           >
//             {children.map((child) => (
//               <option key={child.id} value={child.id}>
//                 {child.first_name} {child.last_name}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Selected Child */}
//       {selectedChild && (
//         <div className="mb-6">
//           <h2 className="text-xl font-semibold text-gray-800">
//             {selectedChild.first_name} {selectedChild.last_name}
//           </h2>

//           <p className="text-gray-500 text-sm mt-1">
//             Attendance records
//           </p>
//         </div>
//       )}

//       {/* Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

//         <div className="bg-white rounded-2xl border border-pink-100 p-6">
//           <p className="text-sm text-gray-500">
//             Present Days
//           </p>

//           <p className="text-3xl font-bold text-green-600 mt-2">
//             {presentDays}
//           </p>
//         </div>

//         <div className="bg-white rounded-2xl border border-pink-100 p-6">
//           <p className="text-sm text-gray-500">
//             Absent Days
//           </p>

//           <p className="text-3xl font-bold text-red-600 mt-2">
//             {absentDays}
//           </p>
//         </div>

//       </div>

//       {/* Attendance Table */}
//       <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">

//         {childReports.length === 0 ? (
//           <div className="p-8 text-center">
//             <p className="text-gray-500">
//               No attendance records are available for this child yet.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">

//             <table className="w-full">

//               <thead className="bg-pink-50 border-b border-pink-100">
//                 <tr>

//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Date
//                   </th>

//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Status
//                   </th>

//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Arrival
//                   </th>

//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Departure
//                   </th>

//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-100">

//                 {childReports.map((report) => (

//                   <tr
//                     key={report.id}
//                     className="hover:bg-pink-50/50 transition"
//                   >

//                     <td className="px-6 py-4 text-gray-800">
//                       {report.report_date}
//                     </td>

//                     <td className="px-6 py-4">

//                       <span
//                         className={`px-3 py-1 rounded-full text-sm font-medium ${
//                           report.attendance_present
//                             ? "bg-green-100 text-green-700"
//                             : "bg-red-100 text-red-700"
//                         }`}
//                       >
//                         {report.attendance_present
//                           ? "Present"
//                           : "Absent"}
//                       </span>

//                     </td>

//                     <td className="px-6 py-4 text-gray-600">
//                       {report.arrival_time || "-"}
//                     </td>

//                     <td className="px-6 py-4 text-gray-600">
//                       {report.departure_time || "-"}
//                     </td>

//                   </tr>

//                 ))}

//               </tbody>

//             </table>

//           </div>
//         )}

//       </div>

//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  classroom_name?: string;
};

type AttendanceRecord = {
  id: number;
  child: number;
  child_name: string;
  attendance_date: string;
  status: "present" | "absent";
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getMonthName(month: number) {
  return new Date(2026, month, 1).toLocaleDateString("en-US", {
    month: "long",
  });
}

export default function ParentAttendance() {
  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD CHILDREN
  // =====================================================

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/children/");

        const childrenData = response.data.results ?? response.data;

        setChildren(childrenData);

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
        console.error("Failed to load children:", err);

        setError("We couldn't load your children's information.");
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, []);

  // =====================================================
  // LOAD ATTENDANCE
  // =====================================================

  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedChildId) return;

      try {
        setError("");

        const response = await api.get(`/attendance/?child=${selectedChildId}`);

        const attendanceData = response.data.results ?? response.data;

        setAttendance(attendanceData);
      } catch (err) {
        console.error("Failed to load attendance:", err);

        setError("We couldn't load attendance records.");
      }
    };

    loadAttendance();
  }, [selectedChildId]);

  // =====================================================
  // SELECTED CHILD
  // =====================================================

  const selectedChild = useMemo(() => {
    return children.find((child) => child.id === selectedChildId);
  }, [children, selectedChildId]);

  const selectChild = (child: Child) => {
    setSelectedChildId(child.id);

    localStorage.setItem("selected_child_id", String(child.id));
  };

  // =====================================================
  // MONTH FILTER
  // =====================================================

  const monthlyAttendance = useMemo(() => {
    return attendance
      .filter((record) => {
        const date = new Date(`${record.attendance_date}T00:00:00`);

        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      })
      .sort(
        (a, b) =>
          new Date(`${b.attendance_date}T00:00:00`).getTime() -
          new Date(`${a.attendance_date}T00:00:00`).getTime(),
      );
  }, [attendance, selectedMonth, selectedYear]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const presentCount = monthlyAttendance.filter(
    (record) => record.status === "present",
  ).length;

  const absentCount = monthlyAttendance.filter(
    (record) => record.status === "absent",
  ).length;

  const totalMarked = presentCount + absentCount;

  const attendancePercentage =
    totalMarked === 0 ? 0 : Math.round((presentCount / totalMarked) * 100);

  // =====================================================
  // MONTH NAVIGATION
  // =====================================================

  const previousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((year) => year - 1);
    } else {
      setSelectedMonth((month) => month - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((year) => year + 1);
    } else {
      setSelectedMonth((month) => month + 1);
    }
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="h-32 bg-white rounded-3xl" />
            <div className="h-32 bg-white rounded-3xl" />
            <div className="h-32 bg-white rounded-3xl" />
          </div>

          <div className="h-96 bg-white rounded-3xl" />
        </div>
      </div>
    );
  }

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
                  📅
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      Attendance
                    </span>

                    {children.length > 1 && (
                      <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold">
                        {children.length} Children
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#30435b]">
                    Attendance
                  </h1>

                  <p className="mt-2 text-sm md:text-base text-gray-500">
                    Keep track of your child's school attendance.
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

        {children.length === 0 ? (
          <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-10 text-center">
            <div className="text-4xl">👧</div>

            <h2 className="mt-4 text-xl font-bold text-[#30435b]">
              No children linked to your account
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Please contact the school if this appears to be incorrect.
            </p>
          </section>
        ) : (
          <>
            {/* =================================================
                CHILD SELECTOR
            ================================================= */}

            {children.length > 1 && (
              <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                      Viewing Attendance For
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Select a child to switch their attendance history.
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
                            : "border-gray-100 hover:bg-gray-50 hover:border-pink-100"
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

            {/* =================================================
                SELECTED CHILD
            ================================================= */}

            {selectedChild && (
              <>
                <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
                  <div className="px-6 py-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-sm font-bold text-pink-600">
                      {getInitials(
                        selectedChild.first_name,
                        selectedChild.last_name,
                      )}
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                        Selected Child
                      </p>

                      <h2 className="text-xl font-bold text-[#30435b] mt-1">
                        {selectedChild.first_name} {selectedChild.last_name}
                      </h2>

                      <p className="text-sm text-gray-400 mt-0.5">
                        {selectedChild.classroom_name || "Assigned classroom"}
                      </p>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    MONTH NAVIGATION
                ================================================= */}

                <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                        Attendance History
                      </p>

                      <h2 className="text-xl font-bold text-[#30435b] mt-1">
                        {getMonthName(selectedMonth)} {selectedYear}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={previousMonth}
                        className="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-100 transition"
                      >
                        ←
                      </button>

                      <button
                        onClick={() => {
                          setSelectedMonth(new Date().getMonth());
                          setSelectedYear(new Date().getFullYear());
                        }}
                        className="px-4 h-10 rounded-xl bg-pink-50 text-pink-600 text-sm font-bold hover:bg-pink-100 transition"
                      >
                        Today
                      </button>

                      <button
                        onClick={nextMonth}
                        className="w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-100 transition"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-white rounded-3xl border border-green-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-500">
                          Present
                        </p>

                        <p className="mt-3 text-4xl font-bold text-[#30435b]">
                          {presentCount}
                        </p>

                        <p className="mt-2 text-sm text-green-600 font-medium">
                          Days present
                        </p>
                      </div>

                      <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">
                        ✓
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-500">
                          Absent
                        </p>

                        <p className="mt-3 text-4xl font-bold text-[#30435b]">
                          {absentCount}
                        </p>

                        <p className="mt-2 text-sm text-gray-500 font-medium">
                          Days absent
                        </p>
                      </div>

                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">
                        —
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-purple-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-500">
                          Attendance Rate
                        </p>

                        <p className="mt-3 text-4xl font-bold text-[#30435b]">
                          {attendancePercentage}%
                        </p>

                        <p className="mt-2 text-sm text-purple-600 font-medium">
                          {totalMarked} marked days
                        </p>
                      </div>

                      <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">
                        📊
                      </div>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    ATTENDANCE PROGRESS
                ================================================= */}

                <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <h2 className="text-lg font-bold text-[#30435b]">
                        Monthly Attendance
                      </h2>

                      <p className="text-sm text-gray-400 mt-1">
                        Attendance rate for {getMonthName(selectedMonth)}
                      </p>
                    </div>

                    <span className="text-xl font-bold text-pink-500">
                      {attendancePercentage}%
                    </span>
                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-700"
                      style={{
                        width: `${attendancePercentage}%`,
                      }}
                    />
                  </div>
                </section>

                {/* =================================================
                    ATTENDANCE TABLE
                ================================================= */}

                <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-[#30435b]">
                      Daily Records
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                      Attendance recorded by the school.
                    </p>
                  </div>

                  {monthlyAttendance.length === 0 ? (
                    <div className="p-10 text-center">
                      <div className="text-4xl mb-3">📅</div>

                      <p className="font-semibold text-[#30435b]">
                        No attendance records
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        No attendance has been recorded for this month yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#fffafd] border-b border-gray-100">
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                                Date
                              </th>

                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                                Day
                              </th>

                              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">
                                Status
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100">
                            {monthlyAttendance.map((record) => {
                              const date = new Date(
                                `${record.attendance_date}T00:00:00`,
                              );

                              return (
                                <tr
                                  key={record.id}
                                  className="hover:bg-pink-50/30 transition"
                                >
                                  <td className="px-6 py-4">
                                    <p className="font-semibold text-[#30435b]">
                                      {formatDate(record.attendance_date)}
                                    </p>
                                  </td>

                                  <td className="px-6 py-4 text-sm text-gray-500">
                                    {date.toLocaleDateString("en-US", {
                                      weekday: "long",
                                    })}
                                  </td>

                                  <td className="px-6 py-4 text-right">
                                    {record.status === "present" ? (
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
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile */}
                      <div className="md:hidden divide-y divide-gray-100">
                        {monthlyAttendance.map((record) => (
                          <div
                            key={record.id}
                            className="p-5 flex items-center justify-between gap-4"
                          >
                            <div>
                              <p className="font-semibold text-[#30435b]">
                                {formatDate(record.attendance_date)}
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  `${record.attendance_date}T00:00:00`,
                                ).toLocaleDateString("en-US", {
                                  weekday: "long",
                                })}
                              </p>
                            </div>

                            {record.status === "present" ? (
                              <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                                ✓ Present
                              </span>
                            ) : (
                              <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                Absent
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
