// // import { useEffect, useState } from "react";
// // import { Link } from "react-router-dom";
// // import api from "../../services/api";

// // interface DailyReport {
// //   id: number;
// //   child: number;
// //   child_name: string;
// //   teacher_name: string;
// //   classroom_name: string;
// //   report_date: string;
// //   attendance_present: boolean;
// //   arrival_time: string | null;
// //   departure_time: string | null;
// //   mood: string;
// //   morning_snack: string;
// //   lunch: string;
// //   rest_status: string;
// //   rest_start: string | null;
// //   rest_end: string | null;
// //   participation: string;
// //   teacher_observation: string;
// //   activities: number[];
// //   activity_names: string[];
// //   submitted: boolean;
// // }

// // function TeacherReports() {
// //   const [reports, setReports] = useState<DailyReport[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   const [search, setSearch] = useState("");
// //   const [date, setDate] = useState("");
// //   const [status, setStatus] = useState("");

// //   const [selectedReport, setSelectedReport] =
// //     useState<DailyReport | null>(null);

// //   useEffect(() => {
// //     loadReports();
// //   }, [date, status]);

// //   const loadReports = async () => {
// //     try {
// //       setLoading(true);

// //       const params = new URLSearchParams();

// //       if (date) {
// //         params.append("date", date);
// //       }

// //       if (status) {
// //         params.append("submitted", status);
// //       }

// //       const response = await api.get<DailyReport[]>(
// //         `/daily-reports/?${params.toString()}`
// //       );

// //       setReports(response.data);
// //     } catch (error) {
// //       console.error("Failed to load reports:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const filteredReports = reports.filter((report) =>
// //     report.child_name
// //       .toLowerCase()
// //       .includes(search.toLowerCase())
// //   );

// //   const formatDate = (value: string) => {
// //     return new Date(value).toLocaleDateString("en-US", {
// //       year: "numeric",
// //       month: "short",
// //       day: "numeric",
// //     });
// //   };

// //   const formatLabel = (value: string) => {
// //     if (!value) return "—";

// //     return value
// //       .replaceAll("_", " ")
// //       .replace(/\b\w/g, (letter) => letter.toUpperCase());
// //   };

// //   return (
// //     <div className="space-y-6">

// //       {/* Header */}
// //       <div>
// //         <h1 className="text-3xl font-bold text-gray-800">
// //           Previous Reports
// //         </h1>

// //         <p className="mt-2 text-gray-500">
// //           View and review daily reports for your children.
// //         </p>
// //       </div>

// //       {/* Filters */}
// //       <div className="rounded-2xl bg-white border border-pink-100 shadow-sm p-5">

// //         <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

// //           {/* Search */}
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">
// //               Search Child
// //             </label>

// //             <input
// //               type="text"
// //               placeholder="Search by child name..."
// //               value={search}
// //               onChange={(e) => setSearch(e.target.value)}
// //               className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
// //             />
// //           </div>

// //           {/* Date */}
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">
// //               Report Date
// //             </label>

// //             <input
// //               type="date"
// //               value={date}
// //               onChange={(e) => setDate(e.target.value)}
// //               className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
// //             />
// //           </div>

// //           {/* Status */}
// //           <div>
// //             <label className="block text-sm font-medium text-gray-700 mb-2">
// //               Status
// //             </label>

// //             <select
// //               value={status}
// //               onChange={(e) => setStatus(e.target.value)}
// //               className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
// //             >
// //               <option value="">All Reports</option>
// //               <option value="true">Submitted</option>
// //               <option value="false">Draft</option>
// //             </select>
// //           </div>

// //         </div>

// //         {(search || date || status) && (
// //           <button
// //             onClick={() => {
// //               setSearch("");
// //               setDate("");
// //               setStatus("");
// //             }}
// //             className="mt-4 text-sm font-medium text-pink-600 hover:text-pink-700"
// //           >
// //             Clear Filters
// //           </button>
// //         )}

// //       </div>

// //       {/* Reports */}
// //       <div className="rounded-2xl bg-white border border-pink-100 shadow-sm overflow-hidden">

// //         <div className="px-6 py-5 border-b">
// //           <div className="flex items-center justify-between">

// //             <div>
// //               <h2 className="text-xl font-bold text-gray-800">
// //                 Daily Reports
// //               </h2>

// //               <p className="text-sm text-gray-500 mt-1">
// //                 {filteredReports.length} report
// //                 {filteredReports.length !== 1 ? "s" : ""}
// //               </p>
// //             </div>

// //           </div>
// //         </div>

// //         {loading ? (
// //           <div className="p-10 text-center text-gray-500">
// //             Loading reports...
// //           </div>
// //         ) : filteredReports.length === 0 ? (
// //           <div className="p-10 text-center">

// //             <p className="text-gray-500">
// //               No reports found.
// //             </p>

// //             <p className="text-sm text-gray-400 mt-1">
// //               Try changing your filters.
// //             </p>

// //           </div>
// //         ) : (
// //           <div className="overflow-x-auto">

// //             <table className="w-full">

// //               <thead className="bg-gray-50">
// //                 <tr>

// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
// //                     Date
// //                   </th>

// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
// //                     Child
// //                   </th>

// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
// //                     Attendance
// //                   </th>

// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
// //                     Mood
// //                   </th>

// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
// //                     Status
// //                   </th>

// //                   <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
// //                     Action
// //                   </th>

// //                 </tr>
// //               </thead>

// //               <tbody className="divide-y divide-gray-100">

// //                 {filteredReports.map((report) => (
// //                   <tr
// //                     key={report.id}
// //                     className="hover:bg-pink-50/40"
// //                   >

// //                     <td className="px-6 py-4 text-sm text-gray-700">
// //                       {formatDate(report.report_date)}
// //                     </td>

// //                     <td className="px-6 py-4">

// //                       <p className="font-medium text-gray-800">
// //                         {report.child_name}
// //                       </p>

// //                       <p className="text-xs text-gray-400">
// //                         {report.classroom_name}
// //                       </p>

// //                     </td>

// //                     <td className="px-6 py-4">

// //                       {report.attendance_present ? (
// //                         <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
// //                           Present
// //                         </span>
// //                       ) : (
// //                         <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
// //                           Absent
// //                         </span>
// //                       )}

// //                     </td>

// //                     <td className="px-6 py-4 text-sm text-gray-700">
// //                       {formatLabel(report.mood)}
// //                     </td>

// //                     <td className="px-6 py-4">

// //                       {report.submitted ? (
// //                         <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
// //                           Submitted
// //                         </span>
// //                       ) : (
// //                         <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
// //                           Draft
// //                         </span>
// //                       )}

// //                     </td>

// //                     <td className="px-6 py-4 text-right">

// //                       <button
// //                         onClick={() =>
// //                           setSelectedReport(report)
// //                         }
// //                         className="rounded-lg border border-pink-200 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50"
// //                       >
// //                         View
// //                       </button>

// //                     </td>

// //                   </tr>
// //                 ))}

// //               </tbody>

// //             </table>

// //           </div>
// //         )}

// //       </div>

// //       {/* View Report Modal */}
// //       {selectedReport && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

// //           <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">

// //             {/* Modal Header */}
// //             <div className="flex items-center justify-between border-b px-6 py-5">

// //               <div>
// //                 <h2 className="text-xl font-bold text-gray-800">
// //                   Daily Report
// //                 </h2>

// //                 <p className="text-sm text-gray-500 mt-1">
// //                   {selectedReport.child_name} ·{" "}
// //                   {formatDate(selectedReport.report_date)}
// //                 </p>
// //               </div>

// //               <button
// //                 onClick={() => setSelectedReport(null)}
// //                 className="text-2xl text-gray-400 hover:text-gray-600"
// //               >
// //                 ×
// //               </button>

// //             </div>

// //             <div className="p-6 space-y-6">

// //               {/* Basic Information */}
// //               <div>
// //                 <h3 className="font-semibold text-gray-800 mb-3">
// //                   Basic Information
// //                 </h3>

// //                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

// //                   <div className="rounded-lg bg-gray-50 p-4">
// //                     <p className="text-xs text-gray-500">
// //                       Child
// //                     </p>
// //                     <p className="mt-1 font-medium">
// //                       {selectedReport.child_name}
// //                     </p>
// //                   </div>

// //                   <div className="rounded-lg bg-gray-50 p-4">
// //                     <p className="text-xs text-gray-500">
// //                       Class
// //                     </p>
// //                     <p className="mt-1 font-medium">
// //                       {selectedReport.classroom_name || "—"}
// //                     </p>
// //                   </div>

// //                   <div className="rounded-lg bg-gray-50 p-4">
// //                     <p className="text-xs text-gray-500">
// //                       Teacher
// //                     </p>
// //                     <p className="mt-1 font-medium">
// //                       {selectedReport.teacher_name}
// //                     </p>
// //                   </div>

// //                   <div className="rounded-lg bg-gray-50 p-4">
// //                     <p className="text-xs text-gray-500">
// //                       Attendance
// //                     </p>
// //                     <p className="mt-1 font-medium">
// //                       {selectedReport.attendance_present
// //                         ? "Present"
// //                         : "Absent"}
// //                     </p>
// //                   </div>

// //                 </div>
// //               </div>

// //               {/* Daily Details */}
// //               <div>
// //                 <h3 className="font-semibold text-gray-800 mb-3">
// //                   Daily Details
// //                 </h3>

// //                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

// //                   <div className="rounded-lg bg-gray-50 p-4">
// //                     <p className="text-xs text-gray-500">
// //                       Mood
// //                     </p>
// //                     <p className="mt-1 font-medium">
// //                       {formatLabel(selectedReport.mood)}
// //                     </p>
// //                   </div>

// //                   <div className="rounded-lg bg-gray-50 p-4">
// //                     <p className="text-xs text-gray-500">
// //                       Participation
// //                     </p>
// //                     <p className="mt-1 font-medium">
// //                       {formatLabel(
// //                         selectedReport.participation
// //                       )}
// //                     </p>
// //                   </div>

// //                   <div className="rounded-lg bg-gray-50 p-4">
// //                     <p className="text-xs text-gray-500">
// //                       Morning Snack
// //                     </p>
// //                     <p className="mt-1 font-medium">
// //                       {formatLabel(
// //                         selectedReport.morning_snack
// //                       )}
// //                     </p>
// //                   </div>

// //                   <div className="rounded-lg bg-gray-50 p-4">
// //                     <p className="text-xs text-gray-500">
// //                       Lunch
// //                     </p>
// //                     <p className="mt-1 font-medium">
// //                       {formatLabel(selectedReport.lunch)}
// //                     </p>
// //                   </div>

// //                   <div className="rounded-lg bg-gray-50 p-4">
// //                     <p className="text-xs text-gray-500">
// //                       Rest
// //                     </p>
// //                     <p className="mt-1 font-medium">
// //                       {formatLabel(
// //                         selectedReport.rest_status
// //                       )}
// //                     </p>
// //                   </div>

// //                 </div>
// //               </div>

// //               {/* Activities */}
// //               <div>
// //                 <h3 className="font-semibold text-gray-800 mb-3">
// //                   Activities
// //                 </h3>

// //                 {selectedReport.activity_names.length === 0 ? (
// //                   <p className="text-sm text-gray-500">
// //                     No activities recorded.
// //                   </p>
// //                 ) : (
// //                   <div className="flex flex-wrap gap-2">
// //                     {selectedReport.activity_names.map(
// //                       (activity) => (
// //                         <span
// //                           key={activity}
// //                           className="rounded-full bg-pink-100 px-3 py-1 text-sm text-pink-700"
// //                         >
// //                           {activity}
// //                         </span>
// //                       )
// //                     )}
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Observation */}
// //               <div>
// //                 <h3 className="font-semibold text-gray-800 mb-3">
// //                   Teacher Observation
// //                 </h3>

// //                 <div className="rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
// //                   {selectedReport.teacher_observation ||
// //                     "No observation recorded."}
// //                 </div>
// //               </div>

// //             </div>

// //             {/* Modal Footer */}
// //             <div className="flex justify-end border-t px-6 py-4">

// //               <Link
// //                 to={`/teacher/reports/${selectedReport.child}`}
// //                 className="mr-3 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
// //               >
// //                 Open Daily Report
// //               </Link>

// //               <button
// //                 onClick={() => setSelectedReport(null)}
// //                 className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
// //               >
// //                 Close
// //               </button>

// //             </div>

// //           </div>

// //         </div>
// //       )}

// //     </div>
// //   );
// // }

// // export default TeacherReports;

// import { useEffect, useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import {
//   cardClass,
//   EmptyState,
//   formatDate,
//   getErrorMessage,
//   getLocalDate,
//   initials,
//   inputClass,
//   maxClass,
//   PageHeader,
//   pageClass,
//   StatCard,
// } from "../../components/teacher/TeacherUI";

// type Child = {
//   id: number;
//   first_name: string;
//   last_name: string;
//   classroom_name?: string;
// };
// type Attendance = { child: number; status: "present" | "absent" };
// type Report = {
//   id: number;
//   child: number;
//   child_name: string;
//   teacher_name?: string;
//   classroom_name?: string;
//   report_date: string;
//   mood?: string;
//   morning_snack?: string;
//   lunch?: string;
//   rest_status?: string;
//   rest_start?: string | null;
//   rest_end?: string | null;
//   participation?: string;
//   teacher_observation?: string;
//   activities?: number[];
//   activity_names?: string[];
//   submitted: boolean;
// };
// export default function TeacherReports() {
//   const [date, setDate] = useState(getLocalDate());
//   const [children, setChildren] = useState<Child[]>([]);
//   const [attendance, setAttendance] = useState<Attendance[]>([]);
//   const [reports, setReports] = useState<Report[]>([]);
//   const [selected, setSelected] = useState<Report | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const load = async () => {
//     try {
//       setLoading(true);
//       const [c, a, r] = await Promise.all([
//         api.get("/children/"),
//         api.get(`/attendance/?date=${date}`),
//         api.get(`/daily-reports/?date=${date}`),
//       ]);
//       setChildren(c.data.results ?? c.data);
//       setAttendance(a.data.results ?? a.data);
//       setReports(r.data.results ?? r.data);
//     } catch (e) {
//       setError(getErrorMessage(e, "Unable to load daily reports."));
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     load();
//   }, [date]);
//   const present = useMemo(
//     () =>
//       children.filter((c) =>
//         attendance.some((a) => a.child === c.id && a.status === "present"),
//       ),
//     [children, attendance],
//   );
//   const done = present.filter((c) =>
//     reports.some((r) => r.child === c.id && r.submitted),
//   );
//   const pending = present.filter(
//     (c) => !reports.some((r) => r.child === c.id && r.submitted),
//   );
//   const absent = children.filter((c) =>
//     attendance.some((a) => a.child === c.id && a.status === "absent"),
//   );
//   const pct = present.length
//     ? Math.round((done.length / present.length) * 100)
//     : 0;
//   return (
//     <div className={pageClass}>
//       <div className={maxClass}>
//         <PageHeader
//           title="Daily Reports"
//           subtitle="Complete and review daily reports for children who were present."
//           action={
//             <input
//               type="date"
//               className={`${inputClass} w-auto`}
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//             />
//           }
//         />
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           <StatCard
//             label="Present"
//             value={present.length}
//             icon="✓"
//             tone="green"
//           />
//           <StatCard
//             label="Completed"
//             value={done.length}
//             icon="📝"
//             tone="purple"
//           />
//           <StatCard
//             label="Pending"
//             value={pending.length}
//             icon="!"
//             tone="amber"
//           />
//           <StatCard label="Absent" value={absent.length} icon="—" tone="pink" />
//         </div>
//         {error && (
//           <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
//             {error}
//           </div>
//         )}
//         <div className={`${cardClass} p-6 mb-6`}>
//           <div className="flex items-center justify-between mb-3">
//             <div>
//               <h2 className="font-bold text-[#30435b]">Report completion</h2>
//               <p className="text-sm text-gray-400 mt-1">
//                 {done.length} of {present.length} present children have
//                 submitted a report.
//               </p>
//             </div>
//             <span className="text-2xl font-bold text-pink-500">{pct}%</span>
//           </div>
//           <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
//             <div
//               className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
//               style={{ width: `${pct}%` }}
//             />
//           </div>
//         </div>
//         <div className={cardClass}>
//           {loading ? (
//             <EmptyState
//               icon="⏳"
//               title="Loading reports"
//               text="Getting today's report status..."
//             />
//           ) : children.length === 0 ? (
//             <EmptyState
//               icon="📝"
//               title="No children assigned"
//               text="Your classroom children will appear here."
//             />
//           ) : (
//             <div className="divide-y divide-gray-100">
//               {children.map((c) => {
//                 const a = attendance.find((x) => x.child === c.id);
//                 const r = reports.find((x) => x.child === c.id);
//                 const isPresent = a?.status === "present";
//                 return (
//                   <div
//                     key={c.id}
//                     className="p-5 flex flex-col lg:flex-row lg:items-center gap-4"
//                   >
//                     <div className="flex items-center gap-3 flex-1">
//                       <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 text-pink-600 flex items-center justify-center font-bold">
//                         {initials(c.first_name, c.last_name)}
//                       </div>
//                       <div>
//                         <p className="font-bold text-[#30435b]">
//                           {c.first_name} {c.last_name}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1">
//                           {c.classroom_name || "Assigned Classroom"}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex flex-wrap items-center gap-2 lg:w-72">
//                       <span
//                         className={`px-3 py-1.5 rounded-full text-xs font-bold ${a?.status === "present" ? "bg-green-50 text-green-700" : a?.status === "absent" ? "bg-gray-100 text-gray-500" : "bg-amber-50 text-amber-700"}`}
//                       >
//                         {a?.status === "present"
//                           ? "Present"
//                           : a?.status === "absent"
//                             ? "Absent"
//                             : "Attendance not marked"}
//                       </span>
//                       <span
//                         className={`px-3 py-1.5 rounded-full text-xs font-bold ${!isPresent ? "bg-gray-100 text-gray-500" : r?.submitted ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
//                       >
//                         {!isPresent
//                           ? a?.status === "absent"
//                             ? "Not required"
//                             : "Waiting for attendance"
//                           : r?.submitted
//                             ? "Completed"
//                             : "Pending"}
//                       </span>
//                     </div>
//                     <div className="flex gap-2">
//                       <button
//                         disabled={!isPresent}
//                         onClick={() =>
//                           navigate(
//                             `/teacher/reports/new?child=${c.id}&date=${date}`,
//                           )
//                         }
//                         className="px-4 py-2.5 rounded-xl bg-pink-50 text-pink-600 font-bold text-sm disabled:opacity-40"
//                       >
//                         {r?.submitted ? "Edit" : "Complete"}
//                       </button>
//                       {r && (
//                         <button
//                           onClick={() => setSelected(r)}
//                           className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm"
//                         >
//                           View
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//         {selected && (
//           <div
//             className="fixed inset-0 z-50 bg-[#263238]/40 backdrop-blur-sm flex items-center justify-center p-4"
//             onClick={() => setSelected(null)}
//           >
//             <div
//               className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="p-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
//                 <div className="flex justify-between gap-4">
//                   <div>
//                     <p className="text-white/75 text-sm">Daily Report</p>
//                     <h2 className="text-2xl font-bold mt-1">
//                       {selected.child_name}
//                     </h2>
//                     <p className="text-white/75 mt-1">
//                       {formatDate(selected.report_date)}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setSelected(null)}
//                     className="w-9 h-9 rounded-xl bg-white/15"
//                   >
//                     ×
//                   </button>
//                 </div>
//               </div>
//               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {[
//                   ["Mood", selected.mood],
//                   ["Participation", selected.participation],
//                   ["Morning Snack", selected.morning_snack],
//                   ["Lunch", selected.lunch],
//                   ["Rest", selected.rest_status],
//                   ["Activities", selected.activity_names?.join(", ") || "None"],
//                 ].map(([l, v]) => (
//                   <div key={l} className="rounded-2xl bg-gray-50 p-4">
//                     <p className="text-xs uppercase tracking-wide text-gray-400 font-bold">
//                       {l}
//                     </p>
//                     <p className="mt-2 font-semibold text-[#30435b] capitalize">
//                       {v || "Not recorded"}
//                     </p>
//                   </div>
//                 ))}
//                 <div className="md:col-span-2 rounded-2xl bg-pink-50 p-5">
//                   <p className="text-xs uppercase tracking-wide text-pink-500 font-bold">
//                     Teacher Observation
//                   </p>
//                   <p className="mt-2 text-[#30435b] leading-7">
//                     {selected.teacher_observation || "No observation recorded."}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
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
  classroom_name?: string;
};

type Attendance = {
  child: number;
  attendance_date: string;
  status: "present" | "absent";
};

type Report = {
  id: number;
  child: number;
  child_name: string;
  classroom_name: string;
  report_date: string;
  mood: string;
  participation: string;
  submitted: boolean;
};

const getLocalDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(
    date.getTime() - offset * 60000,
  )
    .toISOString()
    .split("T")[0];
};

export default function Reports() {
  const [selectedDate, setSelectedDate] =
    useState(getLocalDate());

  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [childrenRes, attendanceRes, reportsRes] =
        await Promise.all([
          api.get("/children/"),
          api.get(
            `/attendance/?date=${selectedDate}`,
          ),
          api.get(
            `/daily-reports/?date=${selectedDate}`,
          ),
        ]);

      setChildren(
        childrenRes.data.results ??
          childrenRes.data,
      );

      setAttendance(
        attendanceRes.data.results ??
          attendanceRes.data,
      );

      setReports(
        reportsRes.data.results ??
          reportsRes.data,
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const reportMap = useMemo(
    () =>
      Object.fromEntries(
        reports.map((report) => [
          report.child,
          report,
        ]),
      ),
    [reports],
  );

  const attendanceMap = useMemo(
    () =>
      Object.fromEntries(
        attendance.map((record) => [
          record.child,
          record,
        ]),
      ),
    [attendance],
  );

  const rows = children
    .filter((child) => {
      const value = search.toLowerCase().trim();

      if (!value) return true;

      return `${child.first_name} ${child.last_name}`
        .toLowerCase()
        .includes(value);
    })
    .map((child) => {
      const attendanceRecord =
        attendanceMap[child.id];

      const report = reportMap[child.id];

      return {
        child,
        present:
          attendanceRecord?.status === "present",
        absent:
          attendanceRecord?.status === "absent",
        report,
      };
    });

  const presentCount = rows.filter(
    (row) => row.present,
  ).length;

  const submittedCount = rows.filter(
    (row) => row.present && row.report?.submitted,
  ).length;

  const pendingCount = rows.filter(
    (row) => row.present && !row.report,
  ).length;

  const draftCount = rows.filter(
    (row) =>
      row.present &&
      row.report &&
      !row.report.submitted,
  ).length;

  const completion =
    presentCount === 0
      ? 0
      : Math.round(
          (submittedCount / presentCount) * 100,
        );

  return (
    <div className="min-h-screen bg-[#fff8fb] p-5 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">

          <div>
            <p className="text-sm font-semibold text-pink-600">
              DAILY REPORTS
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-[#30435b] mt-2">
              Daily Reports
            </h1>

            <p className="text-gray-500 mt-2">
              Complete and review today's reports.
            </p>
          </div>

          <input
            type="date"
            value={selectedDate}
            max={getLocalDate()}
            onChange={(e) =>
              setSelectedDate(e.target.value)
            }
            className="bg-white border border-pink-100 rounded-xl px-4 py-3 font-semibold text-[#30435b] outline-none"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          <ReportStat
            label="Present"
            value={presentCount}
            icon="👧"
          />

          <ReportStat
            label="Submitted"
            value={submittedCount}
            icon="✓"
            green
          />

          <ReportStat
            label="Draft"
            value={draftCount}
            icon="📝"
            amber
          />

          <ReportStat
            label="Pending"
            value={pendingCount}
            icon="!"
            red
          />
        </div>

        {/* Completion */}
        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6 mb-6">

          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-[#30435b]">
                Today's Progress
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {submittedCount} of {presentCount} present children have completed reports.
              </p>
            </div>

            <span className="text-2xl font-bold text-pink-600">
              {completion}%
            </span>
          </div>

          <div className="h-3 bg-pink-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all"
              style={{
                width: `${completion}%`,
              }}
            />
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-4 mb-6">
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search children..."
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>

        {/* Reports */}
        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading reports...
            </div>
          ) : (
            <div className="divide-y divide-gray-100">

              {rows.map((row) => (
                <div
                  key={row.child.id}
                  className="px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-pink-50/30 transition"
                >
                  <div className="flex items-center gap-4">

                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center font-bold text-pink-700">
                      {row.child.first_name.charAt(0)}
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#30435b]">
                        {row.child.first_name}{" "}
                        {row.child.last_name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {row.present
                          ? "Present"
                          : row.absent
                            ? "Absent · Report not required"
                            : "Attendance not marked"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">

                    {!row.present ? (
                      <span className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold">
                        {row.absent
                          ? "Not Required"
                          : "Awaiting Attendance"}
                      </span>
                    ) : row.report?.submitted ? (
                      <>
                        <span className="px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-semibold">
                          ✓ Submitted
                        </span>

                        <Link
                          to={`/teacher/reports/${row.report.id}`}
                          className="px-4 py-2 rounded-xl bg-pink-50 text-pink-700 font-semibold hover:bg-pink-100"
                        >
                          View
                        </Link>
                      </>
                    ) : row.report ? (
                      <>
                        <span className="px-4 py-2 rounded-xl bg-amber-100 text-amber-700 text-sm font-semibold">
                          Draft
                        </span>

                        <Link
                          to={`/teacher/reports/${row.report.id}`}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
                        >
                          Continue
                        </Link>
                      </>
                    ) : (
                      <Link
                        to={`/teacher/reports/new?child=${row.child.id}&date=${selectedDate}`}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-sm hover:shadow-md transition"
                      >
                        Complete Report
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {rows.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  No children found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportStat({
  label,
  value,
  icon,
  green,
  amber,
  red,
}: {
  label: string;
  value: number;
  icon: string;
  green?: boolean;
  amber?: boolean;
  red?: boolean;
}) {
  const bg = green
    ? "bg-green-100 text-green-700"
    : amber
      ? "bg-amber-100 text-amber-700"
      : red
        ? "bg-red-100 text-red-700"
        : "bg-pink-100 text-pink-700";

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">
          {label}
        </p>

        <p className="text-2xl font-bold text-[#30435b] mt-1">
          {value}
        </p>
      </div>

      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}
      >
        {icon}
      </div>
    </div>
  );
}