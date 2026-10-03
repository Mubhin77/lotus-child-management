// import { useEffect, useState } from "react";
// import api from "../../services/api";

// interface Child {
//   id: number;
//   first_name: string;
//   last_name: string;
//   roll_number: string;
// }

// interface DailyReport {
//   id: number;
//   child: number;
//   child_name: string;
//   teacher_name: string;
//   classroom_name: string;
//   report_date: string;

//   attendance_present: boolean;
//   arrival_time: string | null;
//   departure_time: string | null;

//   mood: string;
//   morning_snack: string;
//   lunch: string;

//   rest_status: string;
//   rest_start: string | null;
//   rest_end: string | null;

//   participation: string;
//   teacher_observation: string;

//   activities: number[];
//   activity_names: string[];

//   submitted: boolean;
// }

// export default function ParentReports() {
//   const [children, setChildren] = useState<Child[]>([]);
//   const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

//   const [reports, setReports] = useState<DailyReport[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [selectedReport, setSelectedReport] =
//     useState<DailyReport | null>(null);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [childrenResponse, reportsResponse] = await Promise.all([
//           api.get("/children/"),
//           api.get("/daily-reports/"),
//         ]);

//         const childrenData: Child[] = childrenResponse.data;
//         const reportsData: DailyReport[] = reportsResponse.data;

//         setChildren(childrenData);
//         setReports(reportsData);

//         if (childrenData.length > 0) {
//           setSelectedChildId(childrenData[0].id);
//         }
//       } catch (error) {
//         console.error("Failed to load daily reports:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const selectedChild =
//     children.find((child) => child.id === selectedChildId) || null;

//   const filteredReports = reports.filter(
//     (report) => report.child === selectedChildId
//   );

//   if (loading) {
//     return (
//       <div className="p-8">
//         <p className="text-gray-500">Loading daily reports...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">
//           Daily Reports
//         </h1>

//         <p className="text-gray-500 mt-1">
//           View your child's daily activities and observations.
//         </p>
//       </div>

//       {/* Child Selector */}
//       {children.length > 0 && (
//         <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <h2 className="text-lg font-bold text-gray-800">
//                 Select Child
//               </h2>

//               <p className="text-sm text-gray-500 mt-1">
//                 Choose a child to view their daily reports.
//               </p>
//             </div>

//             {children.length > 1 && (
//               <select
//                 value={selectedChildId ?? ""}
//                 onChange={(e) =>
//                   setSelectedChildId(Number(e.target.value))
//                 }
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
//             <div className="mt-5 flex items-center gap-4">
//               <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-xl">
//                 👧
//               </div>

//               <div>
//                 <p className="font-semibold text-gray-800">
//                   {selectedChild.first_name} {selectedChild.last_name}
//                 </p>

//                 <p className="text-sm text-gray-500">
//                   Roll No: {selectedChild.roll_number || "Not assigned"}
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Reports */}
//       <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
//         {children.length === 0 ? (
//           <div className="p-8 text-center">
//             <p className="text-gray-500">
//               No child has been assigned to your account yet.
//             </p>
//           </div>
//         ) : filteredReports.length === 0 ? (
//           <div className="p-8 text-center">
//             <p className="text-gray-500">
//               No daily reports are available for{" "}
//               {selectedChild?.first_name || "this child"} yet.
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
//                     Attendance
//                   </th>

//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Mood
//                   </th>

//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Participation
//                   </th>

//                   <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
//                     Action
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-100">
//                 {filteredReports.map((report) => (
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

//                     <td className="px-6 py-4 text-gray-700 capitalize">
//                       {report.mood || "Not recorded"}
//                     </td>

//                     <td className="px-6 py-4 text-gray-700 capitalize">
//                       {report.participation || "Not recorded"}
//                     </td>

//                     <td className="px-6 py-4 text-right">
//                       <button
//                         onClick={() => setSelectedReport(report)}
//                         className="px-4 py-2 rounded-lg bg-pink-100 text-pink-700 font-medium hover:bg-pink-200 transition"
//                       >
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Report Details Modal */}
//       {selectedReport && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

//             {/* Modal Header */}
//             <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-800">
//                   Daily Report
//                 </h2>

//                 <p className="text-sm text-gray-500 mt-1">
//                   {selectedReport.child_name} ·{" "}
//                   {selectedReport.report_date}
//                 </p>
//               </div>

//               <button
//                 onClick={() => setSelectedReport(null)}
//                 className="text-gray-400 hover:text-gray-700 text-2xl"
//               >
//                 ×
//               </button>
//             </div>

//             {/* Modal Content */}
//             <div className="p-6 space-y-6">

//               {/* Child / Teacher */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <p className="text-sm text-gray-500">Child</p>

//                   <p className="font-semibold text-gray-800 mt-1">
//                     {selectedReport.child_name}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-sm text-gray-500">Teacher</p>

//                   <p className="font-semibold text-gray-800 mt-1">
//                     {selectedReport.teacher_name}
//                   </p>
//                 </div>
//               </div>

//               {/* Attendance */}
//               <div className="border-t pt-5">
//                 <h3 className="font-semibold text-gray-800 mb-4">
//                   Attendance
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//                   <div>
//                     <p className="text-sm text-gray-500">Status</p>

//                     <p className="font-semibold mt-1">
//                       {selectedReport.attendance_present
//                         ? "Present"
//                         : "Absent"}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm text-gray-500">Arrival</p>

//                     <p className="font-semibold mt-1">
//                       {selectedReport.arrival_time ||
//                         "Not recorded"}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm text-gray-500">Departure</p>

//                     <p className="font-semibold mt-1">
//                       {selectedReport.departure_time ||
//                         "Not recorded"}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Mood & Participation */}
//               <div className="border-t pt-5">
//                 <h3 className="font-semibold text-gray-800 mb-4">
//                   Child's Day
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   <div>
//                     <p className="text-sm text-gray-500">Mood</p>

//                     <p className="font-semibold mt-1 capitalize">
//                       {selectedReport.mood || "Not recorded"}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm text-gray-500">
//                       Participation
//                     </p>

//                     <p className="font-semibold mt-1 capitalize">
//                       {selectedReport.participation ||
//                         "Not recorded"}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Meals */}
//               <div className="border-t pt-5">
//                 <h3 className="font-semibold text-gray-800 mb-4">
//                   Meals
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   <div>
//                     <p className="text-sm text-gray-500">
//                       Morning Snack
//                     </p>

//                     <p className="font-semibold mt-1 capitalize">
//                       {selectedReport.morning_snack ||
//                         "Not recorded"}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm text-gray-500">
//                       Lunch
//                     </p>

//                     <p className="font-semibold mt-1 capitalize">
//                       {selectedReport.lunch ||
//                         "Not recorded"}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Rest */}
//               <div className="border-t pt-5">
//                 <h3 className="font-semibold text-gray-800 mb-4">
//                   Rest / Sleep
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//                   <div>
//                     <p className="text-sm text-gray-500">Status</p>

//                     <p className="font-semibold mt-1 capitalize">
//                       {selectedReport.rest_status ||
//                         "Not recorded"}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm text-gray-500">Start</p>

//                     <p className="font-semibold mt-1">
//                       {selectedReport.rest_start ||
//                         "Not recorded"}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-sm text-gray-500">End</p>

//                     <p className="font-semibold mt-1">
//                       {selectedReport.rest_end ||
//                         "Not recorded"}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Activities */}
//               <div className="border-t pt-5">
//                 <h3 className="font-semibold text-gray-800 mb-4">
//                   Activities
//                 </h3>

//                 {selectedReport.activity_names.length === 0 ? (
//                   <p className="text-gray-500">
//                     No activities recorded.
//                   </p>
//                 ) : (
//                   <div className="flex flex-wrap gap-2">
//                     {selectedReport.activity_names.map(
//                       (activity) => (
//                         <span
//                           key={activity}
//                           className="px-3 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm"
//                         >
//                           {activity}
//                         </span>
//                       )
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Teacher Observation */}
//               <div className="border-t pt-5">
//                 <h3 className="font-semibold text-gray-800 mb-4">
//                   Teacher's Observation
//                 </h3>

//                 <div className="bg-gray-50 rounded-xl p-4 text-gray-700">
//                   {selectedReport.teacher_observation ||
//                     "No observation recorded."}
//                 </div>
//               </div>
//             </div>

//             {/* Close */}
//             <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
//               <button
//                 onClick={() => setSelectedReport(null)}
//                 className="px-5 py-2.5 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition"
//               >
//                 Close
//               </button>
//             </div>

//           </div>
//         </div>
//       )}
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

type DailyReport = {
  id: number;
  child: number;
  child_name: string;
  teacher_name?: string;
  classroom_name?: string;
  report_date: string;

  mood: string;
  morning_snack: string;
  lunch: string;

  rest_status: string;
  rest_start?: string | null;
  rest_end?: string | null;

  participation: string;
  teacher_observation: string;

  activities: number[];
  activity_names: string[];

  submitted: boolean;
};

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatValue(value?: string) {
  if (!value) return "Not recorded";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getMoodEmoji(mood?: string) {
  switch (mood) {
    case "happy":
      return "😊";
    case "good":
      return "🙂";
    case "normal":
      return "😐";
    case "tired":
      return "😴";
    default:
      return "🌸";
  }
}

export default function ParentReports() {
  const [children, setChildren] = useState<Child[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);

  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);

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

        const data = response.data.results ?? response.data;

        setChildren(data);

        const savedChildId = localStorage.getItem("selected_child_id");

        if (
          savedChildId &&
          data.some((child: Child) => child.id === Number(savedChildId))
        ) {
          setSelectedChildId(Number(savedChildId));
        } else if (data.length > 0) {
          setSelectedChildId(data[0].id);

          localStorage.setItem("selected_child_id", String(data[0].id));
        }
      } catch (err) {
        console.error(err);

        setError("We couldn't load your children's information.");
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, []);

  // =====================================================
  // LOAD REPORTS
  // =====================================================

  useEffect(() => {
    const loadReports = async () => {
      if (!selectedChildId) return;

      try {
        setReportsLoading(true);
        setError("");

        const response = await api.get(
          `/daily-reports/?child=${selectedChildId}`,
        );

        const data = response.data.results ?? response.data;

        setReports(data);

        setSelectedReport(null);
      } catch (err) {
        console.error(err);

        setError("We couldn't load the daily reports.");
      } finally {
        setReportsLoading(false);
      }
    };

    loadReports();
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
  // REPORT SUMMARY
  // =====================================================

  const submittedReports = reports.filter((report) => report.submitted);

  const latestReport = submittedReports.length > 0 ? submittedReports[0] : null;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8fb] p-5 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-40 bg-white rounded-[2rem]" />
          <div className="h-24 bg-white rounded-3xl" />
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
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 items-center justify-center text-white text-xl shadow-lg shadow-pink-200">
                📝
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    Daily Reports
                  </span>

                  {children.length > 1 && (
                    <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold">
                      {children.length} Children
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#30435b]">
                  Daily Reports
                </h1>

                <p className="mt-2 text-sm md:text-base text-gray-500">
                  See how your child spent their day at school.
                </p>
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
          <section className="bg-white rounded-3xl border border-pink-100 p-10 text-center">
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
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                    Viewing Reports For
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Select a child to view their daily reports.
                  </p>
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

            {selectedChild && (
              <>
                {/* =================================================
                    CHILD HEADER
                ================================================= */}

                <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5">
                  <div className="flex items-center gap-4">
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
                    SUMMARY
                ================================================= */}

                <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
                    <p className="text-sm font-semibold text-gray-500">
                      Reports Available
                    </p>

                    <p className="mt-3 text-4xl font-bold text-[#30435b]">
                      {submittedReports.length}
                    </p>

                    <p className="mt-2 text-sm text-pink-500 font-medium">
                      Completed daily reports
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl border border-purple-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
                    <p className="text-sm font-semibold text-gray-500">
                      Latest Report
                    </p>

                    <p className="mt-3 text-lg font-bold text-[#30435b]">
                      {latestReport
                        ? formatDate(latestReport.report_date)
                        : "No report yet"}
                    </p>

                    <p className="mt-2 text-sm text-purple-500 font-medium">
                      {latestReport
                        ? "Teacher submitted"
                        : "Waiting for school"}
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl border border-green-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-6">
                    <p className="text-sm font-semibold text-gray-500">
                      Latest Mood
                    </p>

                    <p className="mt-3 text-3xl">
                      {latestReport ? getMoodEmoji(latestReport.mood) : "🌸"}
                    </p>

                    <p className="mt-2 text-sm text-green-600 font-medium">
                      {latestReport
                        ? formatValue(latestReport.mood)
                        : "Not available"}
                    </p>
                  </div>
                </section>

                {/* =================================================
                    REPORT LIST
                ================================================= */}

                <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-[#30435b]">
                      Daily Reports
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                      Select a report to see the full details.
                    </p>
                  </div>

                  {reportsLoading ? (
                    <div className="p-10 text-center">
                      <div className="w-8 h-8 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto" />

                      <p className="mt-4 text-sm text-gray-400">
                        Loading reports...
                      </p>
                    </div>
                  ) : submittedReports.length === 0 ? (
                    <div className="p-10 text-center">
                      <div className="text-4xl mb-3">📝</div>

                      <p className="font-semibold text-[#30435b]">
                        No daily reports yet
                      </p>

                      <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                        Daily reports will appear here after your child's
                        teacher submits them.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {submittedReports.map((report) => (
                        <button
                          key={report.id}
                          type="button"
                          onClick={() => setSelectedReport(report)}
                          className="w-full text-left px-6 py-5 hover:bg-pink-50/30 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-xl">
                              {getMoodEmoji(report.mood)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                <h3 className="font-bold text-[#30435b]">
                                  {formatDate(report.report_date)}
                                </h3>

                                {report.teacher_name && (
                                  <span className="text-xs text-gray-400">
                                    By {report.teacher_name}
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-gray-500 mt-1">
                                Mood:{" "}
                                <span className="font-medium">
                                  {formatValue(report.mood)}
                                </span>
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                                Submitted
                              </span>

                              <span className="text-gray-300 text-xl">→</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}

        {/* =====================================================
            REPORT DETAIL MODAL
        ===================================================== */}

        {selectedReport && (
          <div
            className="fixed inset-0 z-50 bg-[#30435b]/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <div
              className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Modal Header */}

              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
                    Daily Report
                  </span>

                  <h2 className="text-xl md:text-2xl font-bold text-[#30435b] mt-2">
                    {formatDate(selectedReport.report_date)}
                  </h2>

                  {selectedReport.teacher_name && (
                    <p className="text-sm text-gray-400 mt-1">
                      Prepared by {selectedReport.teacher_name}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 hover:bg-pink-50 hover:text-pink-500 transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Mood */}

                <div className="bg-[#fff8fb] rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                    Mood
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-3xl">
                      {getMoodEmoji(selectedReport.mood)}
                    </span>

                    <span className="text-lg font-bold text-[#30435b]">
                      {formatValue(selectedReport.mood)}
                    </span>
                  </div>
                </div>

                {/* Meals */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-pink-100 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                      Morning Snack
                    </p>

                    <p className="mt-3 font-bold text-[#30435b]">
                      {formatValue(selectedReport.morning_snack)}
                    </p>
                  </div>

                  <div className="border border-pink-100 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                      Lunch
                    </p>

                    <p className="mt-3 font-bold text-[#30435b]">
                      {formatValue(selectedReport.lunch)}
                    </p>
                  </div>
                </div>

                {/* Rest */}

                <div className="border border-purple-100 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                    Rest & Sleep
                  </p>

                  <p className="mt-3 font-bold text-[#30435b]">
                    {formatValue(selectedReport.rest_status)}
                  </p>

                  {(selectedReport.rest_start || selectedReport.rest_end) && (
                    <p className="text-sm text-gray-400 mt-2">
                      {selectedReport.rest_start || "--"} —{" "}
                      {selectedReport.rest_end || "--"}
                    </p>
                  )}
                </div>

                {/* Participation */}

                <div className="border border-green-100 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                    Participation
                  </p>

                  <p className="mt-3 font-bold text-[#30435b]">
                    {formatValue(selectedReport.participation)}
                  </p>
                </div>

                {/* Activities */}

                <div className="border border-pink-100 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                    Activities
                  </p>

                  {selectedReport.activity_names?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedReport.activity_names.map((activity) => (
                        <span
                          key={activity}
                          className="px-3 py-2 rounded-xl bg-pink-50 text-pink-600 text-sm font-semibold"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-400">
                      No activities recorded.
                    </p>
                  )}
                </div>

                {/* Teacher Observation */}

                <div className="border border-gray-100 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                    Teacher's Observation
                  </p>

                  {selectedReport.teacher_observation ? (
                    <p className="mt-4 text-[#30435b] leading-7 whitespace-pre-wrap">
                      {selectedReport.teacher_observation}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-gray-400">
                      No additional observation was recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
