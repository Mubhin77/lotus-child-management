import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

interface DailyReport {
  id: number;
  child: number;
  child_name: string;
  teacher: number | null;
  teacher_name: string;
  classroom_name: string;
  report_date: string;

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

interface Attendance {
  id: number;
  child: number;
  child_name: string;
  teacher: number | null;
  teacher_name: string;
  classroom_name: string;
  attendance_date: string;
  status: "present" | "absent";
  marked_at: string;
}

interface Classroom {
  id: number;
  name: string;
  academic_year: string;
}

function DailyReports() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [classroom, setClassroom] = useState("");

  const [selectedReport, setSelectedReport] =
    useState<DailyReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD CLASSROOMS
  // =========================================================

  const loadClasses = async () => {
    try {
      const response = await api.get("/classes/");
      setClasses(response.data);
    } catch (err) {
      console.error("Failed to load classrooms:", err);
    }
  };

  // =========================================================
  // LOAD ATTENDANCE
  // =========================================================

  const loadAttendance = async () => {
    try {
      const params = new URLSearchParams();

      if (date) {
        params.append("date", date);
      }

      if (classroom) {
        params.append("classroom", classroom);
      }

      const url = params.toString()
        ? `/attendance/?${params.toString()}`
        : "/attendance/";

      const response = await api.get(url);

      setAttendance(response.data);
    } catch (err) {
      console.error("Failed to load attendance:", err);
    }
  };

  // =========================================================
  // LOAD DAILY REPORTS
  // =========================================================

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

      // Attendance is a separate resource now
      await loadAttendance();

    } catch (err) {
      console.error(err);
      setError("Failed to load daily reports.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadClasses();
    loadReports();
  }, []);

  // =========================================================
  // ATTENDANCE LOOKUP
  // =========================================================

  const getAttendanceForReport = (
    report: DailyReport
  ) => {
    return attendance.find(
      (record) =>
        record.child === report.child &&
        record.attendance_date === report.report_date
    );
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const total = reports.length;

    const submitted = reports.filter(
      (report) => report.submitted
    ).length;

    const drafts = reports.filter(
      (report) => !report.submitted
    ).length;

    const present = reports.filter((report) => {
      const record = getAttendanceForReport(report);
      return record?.status === "present";
    }).length;

    const absent = reports.filter((report) => {
      const record = getAttendanceForReport(report);
      return record?.status === "absent";
    }).length;

    const attendanceMarked = reports.filter(
      (report) => getAttendanceForReport(report)
    ).length;

    return {
      total,
      submitted,
      drafts,
      present,
      absent,
      attendanceMarked,
    };
  }, [reports, attendance]);

  // =========================================================
  // FILTER
  // =========================================================

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

  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatDate = (value: string) => {
    if (!value) return "-";

    const dateObject = new Date(
      `${value}T00:00:00`
    );

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
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatTime = (value: string | null) => {
    if (!value) return "";

    return value.slice(0, 5);
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[2rem] border border-pink-100/80 bg-white shadow-[0_12px_40px_rgba(53,35,67,0.06)]">

        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-pink-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 right-48 h-56 w-56 rounded-full bg-purple-100/50 blur-3xl" />

        <div className="relative p-6 md:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-xl font-bold text-white shadow-lg shadow-pink-200 sm:flex">
                📝
              </div>

              <div>

                <div className="mb-2 flex flex-wrap items-center gap-2">

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-bold text-pink-600">

                    <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />

                    Daily Reports

                  </span>

                  <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-600">
                    Teacher Reports
                  </span>

                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#30435b] sm:text-3xl">
                  Daily Reports
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-gray-500 md:text-base">
                  Review children's daily wellbeing,
                  activities, meals, rest and teacher
                  observations.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-pink-100 bg-[#fff8fb] px-4 py-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                📋
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Reports
                </p>

                <p className="text-sm font-bold text-[#30435b]">
                  {summary.total} records
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total */}

        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Total Reports
              </p>

              <p className="mt-2 text-3xl font-bold text-[#30435b]">
                {summary.total}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-lg">
              📝
            </div>

          </div>

          <p className="mt-3 text-xs text-gray-500">
            Reports matching your filters
          </p>

        </div>

        {/* Submitted */}

        <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Submitted
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {summary.submitted}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-lg">
              ✓
            </div>

          </div>

          <p className="mt-3 text-xs text-gray-500">
            Completed teacher reports
          </p>

        </div>

        {/* Draft */}

        <div className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Drafts
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {summary.drafts}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-lg">
              ✎
            </div>

          </div>

          <p className="mt-3 text-xs text-gray-500">
            Reports not submitted yet
          </p>

        </div>

        {/* Attendance */}

        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Attendance
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-600">
                {summary.present}
              </p>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-lg">
              👧
            </div>

          </div>

          <p className="mt-3 text-xs text-gray-500">
            Children marked present
          </p>

        </div>

      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="rounded-[1.5rem] border border-pink-100 bg-white p-5 shadow-sm md:p-6">

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="font-bold text-[#30435b]">
              Find Reports
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Filter reports by child, date, class or status.
            </p>

          </div>

          {(search || date || status || classroom) && (
            <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600">
              Filters active
            </span>
          )}

        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          {/* Search */}

          <div>

            <label className="mb-2 block text-xs font-bold text-gray-600">
              Search Child
            </label>

            <div className="relative">

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search child..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-50"
              />

            </div>

          </div>

          {/* Date */}

          <div>

            <label className="mb-2 block text-xs font-bold text-gray-600">
              Report Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-50"
            />

          </div>

          {/* Class */}

          <div>

            <label className="mb-2 block text-xs font-bold text-gray-600">
              Classroom
            </label>

            <select
              value={classroom}
              onChange={(e) =>
                setClassroom(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-50"
            >

              <option value="">
                All Classes
              </option>

              {classes.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}

            </select>

          </div>

          {/* Status */}

          <div>

            <label className="mb-2 block text-xs font-bold text-gray-600">
              Report Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-50"
            >

              <option value="">
                All Reports
              </option>

              <option value="true">
                Submitted
              </option>

              <option value="false">
                Draft
              </option>

            </select>

          </div>

        </div>

        <div className="mt-5 flex flex-wrap gap-3">

          <button
            onClick={handleFilter}
            className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-pink-200 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Apply Filters
          </button>

          <button
            onClick={clearFilters}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            Clear Filters
          </button>

        </div>

      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* =====================================================
          REPORT TABLE
      ===================================================== */}

      <section className="overflow-hidden rounded-[1.5rem] border border-pink-100 bg-white shadow-sm">

        <div className="border-b border-gray-100 px-5 py-5 md:px-6">

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="font-bold text-[#30435b]">
                Report Records
              </h2>

              <p className="text-xs text-gray-400">
                Daily reports and their attendance status
              </p>

            </div>

            {!loading && (
              <span className="text-xs font-semibold text-gray-400">
                {reports.length}{" "}
                {reports.length === 1
                  ? "report"
                  : "reports"}
              </span>
            )}

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px] text-left text-sm">

            <thead className="bg-[#fff8fb]">

              <tr className="border-b border-pink-100">

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Date
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Child
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Class
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Teacher
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Attendance
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Mood
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Report
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {reports.map((report) => {

                const attendanceRecord =
                  getAttendanceForReport(report);

                return (
                  <tr
                    key={report.id}
                    className="transition hover:bg-pink-50/30"
                  >

                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(
                        report.report_date
                      )}
                    </td>

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 text-sm font-bold text-purple-600">
                          {report.child_name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <p className="font-bold text-gray-800">
                            {report.child_name}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {report.classroom_name || "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {report.teacher_name || "-"}
                    </td>

                    <td className="px-6 py-4">

                      {attendanceRecord?.status ===
                      "present" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Present
                        </span>
                      ) : attendanceRecord?.status ===
                        "absent" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Absent
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500">
                          Not Marked
                        </span>
                      )}

                    </td>

                    <td className="px-6 py-4">

                      {report.mood ? (
                        <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-600">
                          {formatChoice(
                            report.mood
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          -
                        </span>
                      )}

                    </td>

                    <td className="px-6 py-4">

                      {report.submitted ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-600">
                          ✓ Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-600">
                          ✎ Draft
                        </span>
                      )}

                    </td>

                    <td className="px-6 py-4 text-right">

                      <button
                        onClick={() =>
                          setSelectedReport(
                            report
                          )
                        }
                        className="rounded-xl border border-pink-200 bg-white px-4 py-2 text-xs font-bold text-pink-600 transition hover:bg-pink-50"
                      >
                        View Report
                      </button>

                    </td>

                  </tr>
                );
              })}

              {!loading &&
                reports.length === 0 && (
                  <tr>

                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center"
                    >

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
                        📝
                      </div>

                      <p className="mt-4 font-semibold text-gray-700">
                        No daily reports found
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Try changing your filters.
                      </p>

                    </td>

                  </tr>
                )}

              {loading && (
                <tr>

                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center"
                  >

                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-pink-100 border-t-pink-500" />

                    <p className="mt-3 text-sm text-gray-400">
                      Loading reports...
                    </p>

                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          REPORT DETAILS MODAL
      ===================================================== */}

      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2937]/50 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedReport(null)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="relative overflow-hidden border-b border-gray-100 px-6 py-6 md:px-8">

              <div className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full bg-pink-100/60 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-lg text-white shadow-lg shadow-pink-100">
                    📝
                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                      Daily Report
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-[#30435b]">
                      {selectedReport.child_name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(
                        selectedReport.report_date
                      )}{" "}
                      ·{" "}
                      {selectedReport.classroom_name ||
                        "No classroom"}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    setSelectedReport(null)
                  }
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  ✕
                </button>

              </div>

            </div>

            <div className="p-6 md:p-8">

              {/* Basic Info */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl bg-pink-50 p-4">

                  <p className="text-xs font-bold uppercase tracking-wider text-pink-500">
                    Child
                  </p>

                  <p className="mt-2 font-bold text-gray-800">
                    {selectedReport.child_name}
                  </p>

                </div>

                <div className="rounded-2xl bg-purple-50 p-4">

                  <p className="text-xs font-bold uppercase tracking-wider text-purple-500">
                    Teacher
                  </p>

                  <p className="mt-2 font-bold text-gray-800">
                    {selectedReport.teacher_name ||
                      "-"}
                  </p>

                </div>

              </div>

              {/* Attendance */}

              {(() => {
                const attendanceRecord =
                  getAttendanceForReport(
                    selectedReport
                  );

                return (
                  <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-5">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Attendance
                        </p>

                        <p className="mt-1 font-bold text-gray-800">
                          {attendanceRecord
                            ? attendanceRecord.status ===
                              "present"
                              ? "Present"
                              : "Absent"
                            : "Not Marked"}
                        </p>

                      </div>

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          attendanceRecord?.status ===
                          "present"
                            ? "bg-green-50 text-green-600"
                            : attendanceRecord?.status ===
                              "absent"
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {attendanceRecord?.status ===
                        "present"
                          ? "✓"
                          : attendanceRecord?.status ===
                            "absent"
                          ? "×"
                          : "—"}
                      </div>

                    </div>

                    {attendanceRecord && (
                      <p className="mt-2 text-xs text-gray-400">
                        Attendance marked by{" "}
                        {attendanceRecord.teacher_name ||
                          "Administrator"}
                      </p>
                    )}

                  </div>
                );
              })()}

              {/* Report Status */}

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Report Status
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {selectedReport.submitted
                      ? "Submitted"
                      : "Draft"}
                  </p>

                </div>

                {selectedReport.submitted ? (
                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-600">
                    ✓ Submitted
                  </span>
                ) : (
                  <span className="rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-600">
                    Draft
                  </span>
                )}

              </div>

              {/* Wellbeing */}

              <div className="mt-7">

                <h3 className="mb-3 text-sm font-bold text-[#30435b]">
                  Child Wellbeing
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  <div className="rounded-2xl bg-purple-50 p-4">

                    <p className="text-xs font-bold text-purple-500">
                      Mood
                    </p>

                    <p className="mt-2 font-bold text-gray-800">
                      {formatChoice(
                        selectedReport.mood
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-orange-50 p-4">

                    <p className="text-xs font-bold text-orange-500">
                      Morning Snack
                    </p>

                    <p className="mt-2 font-bold text-gray-800">
                      {formatChoice(
                        selectedReport.morning_snack
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-green-50 p-4">

                    <p className="text-xs font-bold text-green-600">
                      Lunch
                    </p>

                    <p className="mt-2 font-bold text-gray-800">
                      {formatChoice(
                        selectedReport.lunch
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-blue-50 p-4">

                    <p className="text-xs font-bold text-blue-500">
                      Rest
                    </p>

                    <p className="mt-2 font-bold text-gray-800">
                      {formatChoice(
                        selectedReport.rest_status
                      )}
                    </p>

                    {selectedReport.rest_start &&
                      selectedReport.rest_end && (
                        <p className="mt-1 text-xs text-gray-500">
                          {formatTime(
                            selectedReport.rest_start
                          )}{" "}
                          –{" "}
                          {formatTime(
                            selectedReport.rest_end
                          )}
                        </p>
                      )}

                  </div>

                  <div className="rounded-2xl bg-pink-50 p-4">

                    <p className="text-xs font-bold text-pink-500">
                      Participation
                    </p>

                    <p className="mt-2 font-bold text-gray-800">
                      {formatChoice(
                        selectedReport.participation
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* Activities */}

              <div className="mt-7">

                <h3 className="mb-3 text-sm font-bold text-[#30435b]">
                  Activities
                </h3>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">

                  {selectedReport.activity_names.length >
                  0 ? (
                    <div className="flex flex-wrap gap-2">

                      {selectedReport.activity_names.map(
                        (activity) => (
                          <span
                            key={activity}
                            className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm"
                          >
                            {activity}
                          </span>
                        )
                      )}

                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No activities recorded.
                    </p>
                  )}

                </div>

              </div>

              {/* Teacher Observation */}

              <div className="mt-7">

                <h3 className="mb-3 text-sm font-bold text-[#30435b]">
                  Teacher Observation
                </h3>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">

                  <p className="text-sm leading-7 text-gray-600">
                    {selectedReport.teacher_observation ||
                      "No observation recorded."}
                  </p>

                </div>

              </div>

              {/* Close */}

              <div className="mt-7 flex justify-end">

                <button
                  onClick={() =>
                    setSelectedReport(null)
                  }
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-pink-100 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Close Report
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default DailyReports;