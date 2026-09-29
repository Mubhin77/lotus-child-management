import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

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

function TeacherReports() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");

  const [selectedReport, setSelectedReport] =
    useState<DailyReport | null>(null);

  useEffect(() => {
    loadReports();
  }, [date, status]);

  const loadReports = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (date) {
        params.append("date", date);
      }

      if (status) {
        params.append("submitted", status);
      }

      const response = await api.get<DailyReport[]>(
        `/daily-reports/?${params.toString()}`
      );

      setReports(response.data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) =>
    report.child_name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLabel = (value: string) => {
    if (!value) return "—";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Previous Reports
        </h1>

        <p className="mt-2 text-gray-500">
          View and review daily reports for your children.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-pink-100 shadow-sm p-5">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Child
            </label>

            <input
              type="text"
              placeholder="Search by child name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            >
              <option value="">All Reports</option>
              <option value="true">Submitted</option>
              <option value="false">Draft</option>
            </select>
          </div>

        </div>

        {(search || date || status) && (
          <button
            onClick={() => {
              setSearch("");
              setDate("");
              setStatus("");
            }}
            className="mt-4 text-sm font-medium text-pink-600 hover:text-pink-700"
          >
            Clear Filters
          </button>
        )}

      </div>

      {/* Reports */}
      <div className="rounded-2xl bg-white border border-pink-100 shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b">
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Daily Reports
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {filteredReports.length} report
                {filteredReports.length !== 1 ? "s" : ""}
              </p>
            </div>

          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-10 text-center">

            <p className="text-gray-500">
              No reports found.
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Try changing your filters.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Child
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Attendance
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Mood
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-pink-50/40"
                  >

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDate(report.report_date)}
                    </td>

                    <td className="px-6 py-4">

                      <p className="font-medium text-gray-800">
                        {report.child_name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {report.classroom_name}
                      </p>

                    </td>

                    <td className="px-6 py-4">

                      {report.attendance_present ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Present
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Absent
                        </span>
                      )}

                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatLabel(report.mood)}
                    </td>

                    <td className="px-6 py-4">

                      {report.submitted ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Submitted
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          Draft
                        </span>
                      )}

                    </td>

                    <td className="px-6 py-4 text-right">

                      <button
                        onClick={() =>
                          setSelectedReport(report)
                        }
                        className="rounded-lg border border-pink-200 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50"
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

      {/* View Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Daily Report
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedReport.child_name} ·{" "}
                  {formatDate(selectedReport.report_date)}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>

            </div>

            <div className="p-6 space-y-6">

              {/* Basic Information */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Child
                    </p>
                    <p className="mt-1 font-medium">
                      {selectedReport.child_name}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Class
                    </p>
                    <p className="mt-1 font-medium">
                      {selectedReport.classroom_name || "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Teacher
                    </p>
                    <p className="mt-1 font-medium">
                      {selectedReport.teacher_name}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Attendance
                    </p>
                    <p className="mt-1 font-medium">
                      {selectedReport.attendance_present
                        ? "Present"
                        : "Absent"}
                    </p>
                  </div>

                </div>
              </div>

              {/* Daily Details */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Daily Details
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Mood
                    </p>
                    <p className="mt-1 font-medium">
                      {formatLabel(selectedReport.mood)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Participation
                    </p>
                    <p className="mt-1 font-medium">
                      {formatLabel(
                        selectedReport.participation
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Morning Snack
                    </p>
                    <p className="mt-1 font-medium">
                      {formatLabel(
                        selectedReport.morning_snack
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Lunch
                    </p>
                    <p className="mt-1 font-medium">
                      {formatLabel(selectedReport.lunch)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Rest
                    </p>
                    <p className="mt-1 font-medium">
                      {formatLabel(
                        selectedReport.rest_status
                      )}
                    </p>
                  </div>

                </div>
              </div>

              {/* Activities */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Activities
                </h3>

                {selectedReport.activity_names.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No activities recorded.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.activity_names.map(
                      (activity) => (
                        <span
                          key={activity}
                          className="rounded-full bg-pink-100 px-3 py-1 text-sm text-pink-700"
                        >
                          {activity}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Observation */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Teacher Observation
                </h3>

                <div className="rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {selectedReport.teacher_observation ||
                    "No observation recorded."}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t px-6 py-4">

              <Link
                to={`/teacher/reports/${selectedReport.child}`}
                className="mr-3 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700"
              >
                Open Daily Report
              </Link>

              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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

export default TeacherReports;