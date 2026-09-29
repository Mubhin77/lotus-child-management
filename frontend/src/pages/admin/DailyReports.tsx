import { useEffect, useState } from "react";
import api from "../../services/api";

interface DailyReport {
  id: number;
  child: number;
  child_name: string;
  teacher: number;
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

  created_at: string;
  updated_at: string;
}

interface Classroom {
  id: number;
  name: string;
  academic_year: string;
}

function DailyReports() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [classroom, setClassroom] = useState("");

  const [selectedReport, setSelectedReport] =
    useState<DailyReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClasses = async () => {
    try {
      const response = await api.get("/classes/");
      setClasses(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (date) {
        params.append("date", date);
      }

      if (status) {
        params.append("submitted", status);
      }

      if (classroom) {
        params.append("classroom", classroom);
      }

      const url = params.toString()
        ? `/daily-reports/?${params.toString()}`
        : "/daily-reports/";

      const response = await api.get(url);

      setReports(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load daily reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    loadReports();
  }, []);

  const handleFilter = () => {
    loadReports();
  };

  const clearFilters = () => {
    setSearch("");
    setDate("");
    setStatus("");
    setClassroom("");

    setTimeout(() => {
      loadReports();
    }, 0);
  };

  const formatDate = (value: string) => {
    if (!value) return "-";

    const dateObject = new Date(`${value}T00:00:00`);

    return dateObject.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatChoice = (value: string) => {
    if (!value) return "-";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Daily Reports
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor daily reports submitted by teachers.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Search Child
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search child..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Class
            </label>

            <select
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
            >
              <option value="">All Classes</option>

              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
            >
              <option value="">All Reports</option>
              <option value="true">Submitted</option>
              <option value="false">Draft</option>
            </select>
          </div>

        </div>

        <div className="mt-4 flex gap-3">

          <button
            onClick={handleFilter}
            className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Apply Filters
          </button>

          <button
            onClick={clearFilters}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Clear
          </button>

        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-pink-50 text-gray-600">

              <tr>
                <th className="px-6 py-4 font-semibold">
                  Date
                </th>

                <th className="px-6 py-4 font-semibold">
                  Child
                </th>

                <th className="px-6 py-4 font-semibold">
                  Class
                </th>

                <th className="px-6 py-4 font-semibold">
                  Teacher
                </th>

                <th className="px-6 py-4 font-semibold">
                  Attendance
                </th>

                <th className="px-6 py-4 font-semibold">
                  Mood
                </th>

                <th className="px-6 py-4 font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 text-right font-semibold">
                  Action
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {reports.map((report) => (

                <tr
                  key={report.id}
                  className="transition hover:bg-pink-50/40"
                >

                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(report.report_date)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">
                      {report.child_name}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {report.classroom_name || "-"}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {report.teacher_name}
                  </td>

                  <td className="px-6 py-4">

                    {report.attendance_present ? (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                        Present
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        Absent
                      </span>
                    )}

                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {formatChoice(report.mood)}
                  </td>

                  <td className="px-6 py-4">

                    {report.submitted ? (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                        Submitted
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-600">
                        Draft
                      </span>
                    )}

                  </td>

                  <td className="px-6 py-4 text-right">

                    <button
                      onClick={() =>
                        setSelectedReport(report)
                      }
                      className="rounded-lg border border-pink-200 px-4 py-2 text-xs font-semibold text-pink-600 hover:bg-pink-50"
                    >
                      View
                    </button>

                  </td>

                </tr>

              ))}

              {!loading && reports.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No daily reports found.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading reports...
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Report Details Modal */}
      {selectedReport && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-start justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Daily Report
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedReport.child_name} ·{" "}
                  {formatDate(selectedReport.report_date)}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <div className="rounded-xl bg-pink-50 p-4">
                <p className="text-xs font-semibold text-gray-500">
                  Child
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {selectedReport.child_name}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4">
                <p className="text-xs font-semibold text-gray-500">
                  Class
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {selectedReport.classroom_name || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-xs font-semibold text-gray-500">
                  Teacher
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {selectedReport.teacher_name}
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-xs font-semibold text-gray-500">
                  Attendance
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {selectedReport.attendance_present
                    ? "Present"
                    : "Absent"}
                </p>
              </div>

            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <div>
                <h3 className="mb-2 font-semibold text-gray-800">
                  Mood / Behaviour
                </h3>

                <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                  {formatChoice(selectedReport.mood)}
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-800">
                  Participation
                </h3>

                <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                  {formatChoice(
                    selectedReport.participation
                  )}
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-800">
                  Morning Snack
                </h3>

                <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                  {formatChoice(
                    selectedReport.morning_snack
                  )}
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-800">
                  Lunch
                </h3>

                <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                  {formatChoice(selectedReport.lunch)}
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-800">
                  Rest / Sleep
                </h3>

                <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                  {formatChoice(
                    selectedReport.rest_status
                  )}

                  {selectedReport.rest_start &&
                    selectedReport.rest_end && (
                      <span className="block mt-1">
                        {selectedReport.rest_start} -{" "}
                        {selectedReport.rest_end}
                      </span>
                    )}
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-800">
                  Activities
                </h3>

                <div className="rounded-xl bg-gray-50 p-4">

                  {selectedReport.activity_names.length >
                  0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.activity_names.map(
                        (activity) => (
                          <span
                            key={activity}
                            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm"
                          >
                            {activity}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No activities recorded.
                    </p>
                  )}

                </div>
              </div>

            </div>

            <div className="mt-6">

              <h3 className="mb-2 font-semibold text-gray-800">
                Teacher Observation
              </h3>

              <div className="rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
                {selectedReport.teacher_observation ||
                  "No observation recorded."}
              </div>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
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

export default DailyReports;