import { useEffect, useState } from "react";
import api from "../../services/api";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  roll_number: string;
}

interface DailyReport {
  id: number;
  child: number;
  child_name: string;
  teacher_name: string;
  classroom_name: string;
  report_date: string;

  attendance_present: boolean;
  arrival_time: string | null;
  departure_time: string | null;

  mood: string;
  morning_snack: string;
  lunch: string;

  rest_status: string;
  rest_start: string | null;
  rest_end: string | null;

  participation: string;
  teacher_observation: string;

  activities: number[];
  activity_names: string[];

  submitted: boolean;
}

export default function ParentReports() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] =
    useState<DailyReport | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [childrenResponse, reportsResponse] = await Promise.all([
          api.get("/children/"),
          api.get("/daily-reports/"),
        ]);

        const childrenData: Child[] = childrenResponse.data;
        const reportsData: DailyReport[] = reportsResponse.data;

        setChildren(childrenData);
        setReports(reportsData);

        if (childrenData.length > 0) {
          setSelectedChildId(childrenData[0].id);
        }
      } catch (error) {
        console.error("Failed to load daily reports:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const selectedChild =
    children.find((child) => child.id === selectedChildId) || null;

  const filteredReports = reports.filter(
    (report) => report.child === selectedChildId
  );

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading daily reports...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Daily Reports
        </h1>

        <p className="text-gray-500 mt-1">
          View your child's daily activities and observations.
        </p>
      </div>

      {/* Child Selector */}
      {children.length > 0 && (
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Select Child
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Choose a child to view their daily reports.
              </p>
            </div>

            {children.length > 1 && (
              <select
                value={selectedChildId ?? ""}
                onChange={(e) =>
                  setSelectedChildId(Number(e.target.value))
                }
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-pink-500"
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.first_name} {child.last_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedChild && (
            <div className="mt-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-xl">
                👧
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  {selectedChild.first_name} {selectedChild.last_name}
                </p>

                <p className="text-sm text-gray-500">
                  Roll No: {selectedChild.roll_number || "Not assigned"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reports */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
        {children.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No child has been assigned to your account yet.
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No daily reports are available for{" "}
              {selectedChild?.first_name || "this child"} yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-50 border-b border-pink-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Attendance
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Mood
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Participation
                  </th>

                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-pink-50/50 transition"
                  >
                    <td className="px-6 py-4 text-gray-800">
                      {report.report_date}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          report.attendance_present
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {report.attendance_present
                          ? "Present"
                          : "Absent"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-700 capitalize">
                      {report.mood || "Not recorded"}
                    </td>

                    <td className="px-6 py-4 text-gray-700 capitalize">
                      {report.participation || "Not recorded"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-2 rounded-lg bg-pink-100 text-pink-700 font-medium hover:bg-pink-200 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Daily Report
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedReport.child_name} ·{" "}
                  {selectedReport.report_date}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">

              {/* Child / Teacher */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-sm text-gray-500">Child</p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedReport.child_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Teacher</p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {selectedReport.teacher_name}
                  </p>
                </div>
              </div>

              {/* Attendance */}
              <div className="border-t pt-5">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Attendance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>

                    <p className="font-semibold mt-1">
                      {selectedReport.attendance_present
                        ? "Present"
                        : "Absent"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Arrival</p>

                    <p className="font-semibold mt-1">
                      {selectedReport.arrival_time ||
                        "Not recorded"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Departure</p>

                    <p className="font-semibold mt-1">
                      {selectedReport.departure_time ||
                        "Not recorded"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mood & Participation */}
              <div className="border-t pt-5">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Child's Day
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm text-gray-500">Mood</p>

                    <p className="font-semibold mt-1 capitalize">
                      {selectedReport.mood || "Not recorded"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Participation
                    </p>

                    <p className="font-semibold mt-1 capitalize">
                      {selectedReport.participation ||
                        "Not recorded"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Meals */}
              <div className="border-t pt-5">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Meals
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm text-gray-500">
                      Morning Snack
                    </p>

                    <p className="font-semibold mt-1 capitalize">
                      {selectedReport.morning_snack ||
                        "Not recorded"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Lunch
                    </p>

                    <p className="font-semibold mt-1 capitalize">
                      {selectedReport.lunch ||
                        "Not recorded"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rest */}
              <div className="border-t pt-5">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Rest / Sleep
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>

                    <p className="font-semibold mt-1 capitalize">
                      {selectedReport.rest_status ||
                        "Not recorded"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Start</p>

                    <p className="font-semibold mt-1">
                      {selectedReport.rest_start ||
                        "Not recorded"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">End</p>

                    <p className="font-semibold mt-1">
                      {selectedReport.rest_end ||
                        "Not recorded"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="border-t pt-5">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Activities
                </h3>

                {selectedReport.activity_names.length === 0 ? (
                  <p className="text-gray-500">
                    No activities recorded.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.activity_names.map(
                      (activity) => (
                        <span
                          key={activity}
                          className="px-3 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm"
                        >
                          {activity}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Teacher Observation */}
              <div className="border-t pt-5">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Teacher's Observation
                </h3>

                <div className="bg-gray-50 rounded-xl p-4 text-gray-700">
                  {selectedReport.teacher_observation ||
                    "No observation recorded."}
                </div>
              </div>
            </div>

            {/* Close */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}