import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
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

type Status = "present" | "absent";

const getLocalDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
};

export default function Attendance() {
  const [children, setChildren] = useState<Child[]>([]);
  const [attendance, setAttendance] = useState<Record<number, Status>>({});

  const [existingRecords, setExistingRecords] = useState<
    Record<number, AttendanceRecord>
  >({});

  const [selectedDate, setSelectedDate] = useState(getLocalDate());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadChildren = async () => {
    try {
      const response = await api.get("/children/");

      setChildren(response.data.results ?? response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load your children.");
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.get(`/attendance/?date=${selectedDate}`);

      const records: AttendanceRecord[] =
        response.data.results ?? response.data;

      const recordMap: Record<number, AttendanceRecord> = {};
      const statusMap: Record<number, Status> = {};

      records.forEach((record) => {
        recordMap[record.child] = record;
        statusMap[record.child] = record.status;
      });

      setExistingRecords(recordMap);
      setAttendance(statusMap);

      const hasSavedRecords = records.length > 0;

      setSaved(hasSavedRecords);
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const presentCount = useMemo(
    () => children.filter((child) => attendance[child.id] === "present").length,
    [children, attendance],
  );

  const absentCount = useMemo(
    () => children.filter((child) => attendance[child.id] === "absent").length,
    [children, attendance],
  );

  const notMarkedCount = children.length - presentCount - absentCount;

  const allMarked = children.length > 0 && notMarkedCount === 0;

  const changeAttendance = (childId: number, status: Status) => {
    if (saved && !editing) return;

    setAttendance((current) => ({
      ...current,
      [childId]: status,
    }));

    setSuccess("");
  };

  const markAllPresent = () => {
    if (saved && !editing) return;

    const updated: Record<number, Status> = {};

    children.forEach((child) => {
      updated[child.id] = "present";
    });

    setAttendance(updated);
    setSuccess("");
  };

  const saveAttendance = async () => {
    if (!allMarked) {
      setError(`Please mark all ${notMarkedCount} remaining children.`);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      for (const child of children) {
        const status = attendance[child.id];
        const existing = existingRecords[child.id];

        if (existing) {
          if (existing.status !== status) {
            await api.patch(`/attendance/${existing.id}/`, {
              status,
            });
          }
        } else {
          await api.post("/attendance/", {
            child: child.id,
            attendance_date: selectedDate,
            status,
          });
        }
      }

      await loadAttendance();

      setSaved(true);
      setEditing(false);
      setSuccess("Attendance has been saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving attendance.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    setEditing(true);
    setSuccess("");
  };

  const classroomName =
    children.find((child) => child.classroom_name)?.classroom_name ||
    "Your Classroom";

  return (
    <div className="min-h-screen bg-[#fff8fb] p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <p className="text-sm font-semibold text-pink-600 mb-2">
              DAILY ATTENDANCE
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-[#30435b]">
              Today's Attendance
            </h1>

            <p className="text-gray-500 mt-2">
              {classroomName} · Mark attendance for your children.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-pink-100 px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Date
            </p>

            <input
              type="date"
              value={selectedDate}
              max={getLocalDate()}
              disabled={saving}
              onChange={(e) => {
                if (saved && !editing) {
                  const confirmed = window.confirm(
                    "You are viewing saved attendance. Change the date?",
                  );

                  if (!confirmed) return;
                }

                setSelectedDate(e.target.value);
              }}
              className="mt-1 font-semibold text-[#30435b] outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 bg-green-50 border border-green-100 text-green-700 rounded-2xl px-5 py-4">
            ✓ {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Children" value={children.length} icon="👧" />

          <StatCard label="Present" value={presentCount} icon="✓" green />

          <StatCard label="Absent" value={absentCount} icon="—" red />

          <StatCard label="Not Marked" value={notMarkedCount} icon="!" amber />
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 md:px-7 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#30435b]">Children</h2>

              <p className="text-sm text-gray-500 mt-1">
                {saved && !editing
                  ? "Attendance is saved and locked."
                  : "Mark each child as present or absent."}
              </p>
            </div>

            {!saved || editing ? (
              <button
                onClick={markAllPresent}
                disabled={saving || children.length === 0}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-sm hover:shadow-md transition disabled:opacity-50"
              >
                ✓ Mark All Present
              </button>
            ) : (
              <button
                onClick={startEditing}
                className="px-5 py-3 rounded-xl bg-pink-50 text-pink-700 font-semibold hover:bg-pink-100 transition"
              >
                ✎ Edit Attendance
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading attendance...
            </div>
          ) : children.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">👧</div>
              <h3 className="font-bold text-[#30435b]">No children assigned</h3>
              <p className="text-gray-500 mt-1">
                No active children are currently assigned to you.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {children.map((child) => {
                const status = attendance[child.id];

                return (
                  <div
                    key={child.id}
                    className="px-5 md:px-7 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-pink-50/30 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center font-bold text-pink-700">
                        {child.first_name.charAt(0)}
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#30435b]">
                          {child.first_name} {child.last_name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {child.roll_number
                            ? `Roll No. ${child.roll_number}`
                            : classroomName}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        disabled={saved && !editing}
                        onClick={() => changeAttendance(child.id, "present")}
                        className={`px-5 py-2.5 rounded-xl font-semibold transition ${
                          status === "present"
                            ? "bg-green-100 text-green-700 ring-2 ring-green-200"
                            : "bg-gray-50 text-gray-500 hover:bg-green-50 hover:text-green-700"
                        } disabled:cursor-default`}
                      >
                        ✓ Present
                      </button>

                      <button
                        disabled={saved && !editing}
                        onClick={() => changeAttendance(child.id, "absent")}
                        className={`px-5 py-2.5 rounded-xl font-semibold transition ${
                          status === "absent"
                            ? "bg-red-100 text-red-700 ring-2 ring-red-200"
                            : "bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-700"
                        } disabled:cursor-default`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom action */}
          {!loading && children.length > 0 && (!saved || editing) && (
            <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 px-5 md:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-[#30435b]">
                  {allMarked
                    ? "✓ Everyone is marked"
                    : `${notMarkedCount} children still need attendance`}
                </p>

                <p className="text-sm text-gray-500">Review before saving.</p>
              </div>

              <button
                onClick={saveAttendance}
                disabled={!allMarked || saving}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-sm hover:shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          )}

          {/* Saved footer */}
          {saved && !editing && !loading && (
            <div className="border-t border-green-100 bg-green-50 px-5 md:px-7 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-bold text-green-700">
                  ✓ Attendance Completed
                </p>

                <p className="text-sm text-green-600 mt-1">
                  Today's attendance is saved. Use Edit Attendance only if you
                  need to make a correction.
                </p>
              </div>

              <button
                onClick={startEditing}
                className="px-5 py-3 rounded-xl bg-white text-green-700 font-semibold border border-green-200 hover:bg-green-100 transition"
              >
                Edit Attendance
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  green,
  red,
  amber,
}: {
  label: string;
  value: number;
  icon: string;
  green?: boolean;
  red?: boolean;
  amber?: boolean;
}) {
  const iconClass = green
    ? "bg-green-100 text-green-700"
    : red
      ? "bg-red-100 text-red-700"
      : amber
        ? "bg-amber-100 text-amber-700"
        : "bg-pink-100 text-pink-700";

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-[#30435b] mt-1">{value}</p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
