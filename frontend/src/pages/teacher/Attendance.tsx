import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  roll_number?: number | null;
  classroom?: number | null;
  classroom_name?: string;
  is_active?: boolean;
};

type AttendanceRecord = {
  id: number;
  child: number;
  child_name: string;
  teacher: number;
  teacher_name: string;
  classroom_name: string;
  attendance_date: string;
  status: "present" | "absent";
  marked_at: string;
};

type AttendanceStatus = "present" | "absent";

export default function Attendance() {
  const today = new Date().toISOString().split("T")[0];

  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<
    Record<number, AttendanceStatus>
  >({});

  const [selectedDate, setSelectedDate] = useState(today);

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Load the teacher's assigned children.
   *
   * The backend automatically filters this endpoint:
   * teacher -> assigned classroom -> active children
   */
  useEffect(() => {
    loadChildren();
  }, []);

  /*
   * Load attendance whenever the selected date changes.
   */
  useEffect(() => {
    if (selectedDate) {
      loadAttendance();
    }
  }, [selectedDate]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/children/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      const activeChildren = data.filter(
        (child: Child) => child.is_active !== false,
      );

      setChildren(activeChildren);
    } catch (err: any) {
      console.error("Failed to load children:", err);

      const message =
        err?.response?.data?.detail || "Unable to load your assigned children.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      setAttendanceLoading(true);
      setError("");
      setSuccess("");

      const response = await api.get("/attendance/", {
        params: {
          date: selectedDate,
        },
      });

      const records: AttendanceRecord[] = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      const attendanceMap: Record<number, AttendanceStatus> = {};

      records.forEach((record) => {
        attendanceMap[record.child] = record.status;
      });

      setAttendance(attendanceMap);
    } catch (err: any) {
      console.error("Failed to load attendance:", err);

      const message =
        err?.response?.data?.detail ||
        "Unable to load attendance for this date.";

      setError(message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  /*
   * Change a child's attendance status locally.
   * Nothing is sent to the server until Save Attendance is clicked.
   */
  const markChild = (childId: number, status: AttendanceStatus) => {
    setAttendance((previous) => ({
      ...previous,
      [childId]: status,
    }));

    setSuccess("");
    setError("");
  };

  const markAllPresent = () => {
    const updated: Record<number, AttendanceStatus> = {};

    children.forEach((child) => {
      updated[child.id] = "present";
    });

    setAttendance(updated);
    setSuccess("");
    setError("");
  };

  const markAllAbsent = () => {
    const updated: Record<number, AttendanceStatus> = {};

    children.forEach((child) => {
      updated[child.id] = "absent";
    });

    setAttendance(updated);
    setSuccess("");
    setError("");
  };

  /*
   * Save attendance.
   *
   * Existing record:
   *     PATCH
   *
   * New record:
   *     POST
   */
  const handleSave = async () => {
    if (children.length === 0) {
      setError("No assigned children were found.");
      return;
    }

    const unmarkedCount = children.filter(
      (child) => !attendance[child.id],
    ).length;

    if (unmarkedCount > 0) {
      setError(
        `Please mark attendance for all children. ${unmarkedCount} ${
          unmarkedCount === 1 ? "child is" : "children are"
        } still unmarked.`,
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * Get the current server records again before saving.
       * This ensures we know which children already have
       * attendance records.
       */
      const response = await api.get("/attendance/", {
        params: {
          date: selectedDate,
        },
      });

      const existingRecords: AttendanceRecord[] = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      const existingByChild = new Map<number, AttendanceRecord>();

      existingRecords.forEach((record) => {
        existingByChild.set(record.child, record);
      });

      /*
       * Create/update each child's attendance.
       */
      for (const child of children) {
        const status = attendance[child.id];

        if (!status) {
          continue;
        }

        const existingRecord = existingByChild.get(child.id);

        if (existingRecord) {
          /*
           * Only PATCH if the status changed.
           */
          if (existingRecord.status !== status) {
            await api.patch(`/attendance/${existingRecord.id}/`, {
              status: status,
            });
          }
        } else {
          /*
           * Create new attendance record.
           *
           * teacher is intentionally NOT sent.
           * Your backend automatically assigns
           * request.user.teacher.
           */
          await api.post("/attendance/", {
            child: child.id,
            attendance_date: selectedDate,
            status: status,
          });
        }
      }

      setSuccess(
        `Attendance saved successfully for ${children.length} ${
          children.length === 1 ? "child" : "children"
        }.`,
      );

      await loadAttendance();
    } catch (err: any) {
      console.error("Failed to save attendance:", err);

      let message = "Unable to save attendance. Please try again.";

      if (err?.response?.data) {
        if (typeof err.response.data.detail === "string") {
          message = err.response.data.detail;
        } else if (typeof err.response.data === "object") {
          const values = Object.values(err.response.data).flat();

          if (values.length > 0) {
            message = String(values[0]);
          }
        }
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const totalChildren = children.length;

  const presentCount = useMemo(() => {
    return children.filter((child) => attendance[child.id] === "present")
      .length;
  }, [children, attendance]);

  const absentCount = useMemo(() => {
    return children.filter((child) => attendance[child.id] === "absent").length;
  }, [children, attendance]);

  const unmarkedCount = totalChildren - presentCount - absentCount;

  /*
   * Initial loading state.
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8fb] p-6 md:p-8">
        <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-pink-100 border-t-pink-500" />

            <p className="text-sm text-gray-500">Loading your children...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8fb] p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-pink-500">
              Teacher Portal
            </p>

            <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>

            <p className="mt-2 text-gray-500">
              Mark attendance for your assigned children.
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </span>

            <p className="pt-0.5">{error}</p>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm text-green-700">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold">
              ✓
            </span>

            <p className="pt-0.5">{success}</p>
          </div>
        )}

        {/* DATE SELECTOR */}
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-pink-50">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="w-full md:max-w-sm">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Attendance Date
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div className="rounded-xl bg-purple-50 px-5 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Assigned Children
              </p>

              <p className="mt-1 text-lg font-bold text-purple-700">
                {totalChildren}
              </p>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-pink-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total</p>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                👧
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-gray-800">
              {totalChildren}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-green-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Present</p>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
                ✓
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-green-600">
              {presentCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-red-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Absent</p>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
                ✕
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-red-500">
              {absentCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-yellow-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Not Marked</p>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                !
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-yellow-600">
              {unmarkedCount}
            </p>
          </div>
        </div>

        {/* ATTENDANCE TABLE */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-pink-50">
          {/* TABLE HEADER */}
          <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Children Attendance
              </h2>

              <p className="mt-1 text-sm text-gray-500">{selectedDate}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={markAllPresent}
                disabled={totalChildren === 0 || attendanceLoading}
                className="rounded-xl bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark All Present
              </button>

              <button
                type="button"
                onClick={markAllAbsent}
                disabled={totalChildren === 0 || attendanceLoading}
                className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          {/* ATTENDANCE LOADING */}
          {attendanceLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-pink-100 border-t-pink-500" />

                <p className="text-sm text-gray-500">Loading attendance...</p>
              </div>
            </div>
          ) : totalChildren === 0 ? (
            /* EMPTY STATE */
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-3xl">
                👧
              </div>

              <h3 className="font-semibold text-gray-800">
                No assigned children
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                You currently do not have any active children assigned to your
                classroom.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Child
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Classroom
                      </th>

                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Attendance
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {children.map((child) => {
                      const status = attendance[child.id];

                      return (
                        <tr
                          key={child.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-pink-50/30"
                        >
                          {/* CHILD */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 text-lg">
                                👧
                              </div>

                              <div>
                                <p className="font-semibold text-gray-800">
                                  {child.first_name} {child.last_name}
                                </p>

                                {child.roll_number !== null &&
                                  child.roll_number !== undefined && (
                                    <p className="text-xs text-gray-400">
                                      Roll No. {child.roll_number}
                                    </p>
                                  )}
                              </div>
                            </div>
                          </td>

                          {/* CLASSROOM */}
                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700">
                              {child.classroom_name || "Assigned Classroom"}
                            </span>
                          </td>

                          {/* STATUS */}
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => markChild(child.id, "present")}
                                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                                  status === "present"
                                    ? "bg-green-500 text-white shadow-sm"
                                    : "bg-green-50 text-green-700 hover:bg-green-100"
                                }`}
                              >
                                ✓ Present
                              </button>

                              <button
                                type="button"
                                onClick={() => markChild(child.id, "absent")}
                                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                                  status === "absent"
                                    ? "bg-red-500 text-white shadow-sm"
                                    : "bg-red-50 text-red-600 hover:bg-red-100"
                                }`}
                              >
                                ✕ Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="space-y-3 p-4 md:hidden">
                {children.map((child) => {
                  const status = attendance[child.id];

                  return (
                    <div
                      key={child.id}
                      className="rounded-2xl border border-gray-100 p-4"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 text-lg">
                          👧
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {child.first_name} {child.last_name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {child.classroom_name || "Assigned Classroom"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => markChild(child.id, "present")}
                          className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                            status === "present"
                              ? "bg-green-500 text-white"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          ✓ Present
                        </button>

                        <button
                          type="button"
                          onClick={() => markChild(child.id, "absent")}
                          className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                            status === "absent"
                              ? "bg-red-500 text-white"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          ✕ Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* SAVE FOOTER */}
          {totalChildren > 0 && !attendanceLoading && (
            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                {unmarkedCount === 0 ? (
                  <span className="font-medium text-green-600">
                    ✓ All children have been marked
                  </span>
                ) : (
                  <span className="text-gray-500">
                    {unmarkedCount} {unmarkedCount === 1 ? "child" : "children"}{" "}
                    still need attendance
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || unmarkedCount > 0}
                className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:from-pink-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving Attendance..." : "Save Attendance"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
