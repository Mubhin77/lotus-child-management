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

type OverviewMode = "weekly" | "monthly" | "custom";

const getLocalDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

const parseDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatShortDate = (dateString: string) => {
  if (!dateString) return "";

  return parseDate(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getWeekDates = (dateString: string) => {
  const date = parseDate(dateString);
  const day = date.getDay();

  const mondayOffset = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  const dates: string[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);

    dates.push(formatDateInput(current));
  }

  return dates;
};

const getMonthDates = (dateString: string) => {
  const date = parseDate(dateString);

  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const dates: string[] = [];

  for (
    let current = new Date(firstDay);
    current <= lastDay;
    current.setDate(current.getDate() + 1)
  ) {
    dates.push(formatDateInput(current));
  }

  return dates;
};

const getWeekLabel = (dateString: string) => {
  const dates = getWeekDates(dateString);

  return `${formatShortDate(dates[0])} – ${formatShortDate(dates[6])}`;
};

const getMonthLabel = (dateString: string) => {
  return parseDate(dateString).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const getStatus = (
  records: AttendanceRecord[],
  childId: number,
  date: string,
): Status | null => {
  const record = records.find(
    (record) =>
      record.child === childId && record.attendance_date === date,
  );

  return record?.status ?? null;
};

const calculateAttendancePercentage = (
  records: AttendanceRecord[],
  childId: number,
  dates: string[],
) => {
  const childRecords = records.filter(
    (record) =>
      record.child === childId &&
      dates.includes(record.attendance_date),
  );

  if (childRecords.length === 0) return 0;

  const present = childRecords.filter(
    (record) => record.status === "present",
  ).length;

  return Math.round((present / childRecords.length) * 100);
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

  const [activeTab, setActiveTab] = useState<"mark" | "overview">("mark");

  const [overviewMode, setOverviewMode] =
    useState<OverviewMode>("weekly");

  const [overviewDate, setOverviewDate] = useState(getLocalDate());

  const [customStartDate, setCustomStartDate] =
    useState(getLocalDate());

  const [customEndDate, setCustomEndDate] =
    useState(getLocalDate());

  const [customDateApplied, setCustomDateApplied] =
    useState(false);

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
    () =>
      children.filter(
        (child) => attendance[child.id] === "present",
      ).length,
    [children, attendance],
  );

  const absentCount = useMemo(
    () =>
      children.filter(
        (child) => attendance[child.id] === "absent",
      ).length,
    [children, attendance],
  );

  const notMarkedCount =
    children.length - presentCount - absentCount;

  const allMarked =
    children.length > 0 && notMarkedCount === 0;

  const changeAttendance = (
    childId: number,
    status: Status,
  ) => {
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
      setError(
        `Please mark all ${notMarkedCount} remaining children.`,
      );
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
      setSuccess(
        "Attendance has been saved successfully.",
      );
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while saving attendance.",
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    setEditing(true);
    setSuccess("");
  };

  const classroomName =
    children.find((child) => child.classroom_name)
      ?.classroom_name || "Your Classroom";

  return (
    <div className="min-h-screen bg-[#fff8fb] p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-pink-600 mb-2">
                ATTENDANCE
              </p>

              <h1 className="text-3xl md:text-4xl font-bold text-[#30435b]">
                Attendance
              </h1>

              <p className="text-gray-500 mt-2">
                Manage daily attendance and review attendance
                records for {classroomName}.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-2 mb-6 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setActiveTab("mark");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 px-5 py-3 rounded-xl font-semibold transition ${
              activeTab === "mark"
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm"
                : "text-gray-500 hover:bg-pink-50 hover:text-pink-700"
            }`}
          >
            ✓ Mark Attendance
          </button>

          <button
            onClick={() => {
              setActiveTab("overview");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 px-5 py-3 rounded-xl font-semibold transition ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm"
                : "text-gray-500 hover:bg-pink-50 hover:text-pink-700"
            }`}
          >
            📊 Attendance Overview
          </button>
        </div>

        {activeTab === "mark" ? (
          <MarkAttendance
            children={children}
            attendance={attendance}
            existingRecords={existingRecords}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            loading={loading}
            saving={saving}
            saved={saved}
            editing={editing}
            error={error}
            success={success}
            presentCount={presentCount}
            absentCount={absentCount}
            notMarkedCount={notMarkedCount}
            allMarked={allMarked}
            changeAttendance={changeAttendance}
            markAllPresent={markAllPresent}
            saveAttendance={saveAttendance}
            startEditing={startEditing}
            classroomName={classroomName}
            getLocalDate={getLocalDate}
          />
        ) : (
          <AttendanceOverview
            children={children}
            overviewMode={overviewMode}
            setOverviewMode={setOverviewMode}
            overviewDate={overviewDate}
            setOverviewDate={setOverviewDate}
            customStartDate={customStartDate}
            setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate}
            setCustomEndDate={setCustomEndDate}
            customDateApplied={customDateApplied}
            setCustomDateApplied={setCustomDateApplied}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MARK ATTENDANCE
========================================================= */

function MarkAttendance({
  children,
  attendance,
  existingRecords,
  selectedDate,
  setSelectedDate,
  loading,
  saving,
  saved,
  editing,
  error,
  success,
  presentCount,
  absentCount,
  notMarkedCount,
  allMarked,
  changeAttendance,
  markAllPresent,
  saveAttendance,
  startEditing,
  classroomName,
  getLocalDate,
}: {
  children: Child[];
  attendance: Record<number, Status>;
  existingRecords: Record<number, AttendanceRecord>;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  editing: boolean;
  error: string;
  success: string;
  presentCount: number;
  absentCount: number;
  notMarkedCount: number;
  allMarked: boolean;
  changeAttendance: (
    childId: number,
    status: Status,
  ) => void;
  markAllPresent: () => void;
  saveAttendance: () => void;
  startEditing: () => void;
  classroomName: string;
  getLocalDate: () => string;
}) {
  return (
    <>
      {/* Date / Error / Success */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#30435b]">
            Daily Attendance
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Mark each child as present or absent.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 px-5 py-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Attendance Date
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

      {error && (
        <div className="mb-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 bg-green-50 border border-green-100 text-green-700 rounded-2xl px-5 py-4">
          ✓ {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Children"
          value={children.length}
          icon="👧"
        />

        <StatCard
          label="Present"
          value={presentCount}
          icon="✓"
          green
        />

        <StatCard
          label="Absent"
          value={absentCount}
          icon="—"
          red
        />

        <StatCard
          label="Not Marked"
          value={notMarkedCount}
          icon="!"
          amber
        />
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 md:px-7 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#30435b]">
              Children
            </h2>

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

            <h3 className="font-bold text-[#30435b]">
              No children assigned
            </h3>

            <p className="text-gray-500 mt-1">
              No active children are currently assigned to
              you.
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
                      onClick={() =>
                        changeAttendance(
                          child.id,
                          "present",
                        )
                      }
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
                      onClick={() =>
                        changeAttendance(
                          child.id,
                          "absent",
                        )
                      }
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

        {/* Save */}
        {!loading &&
          children.length > 0 &&
          (!saved || editing) && (
            <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 px-5 md:px-7 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-[#30435b]">
                  {allMarked
                    ? "✓ Everyone is marked"
                    : `${notMarkedCount} children still need attendance`}
                </p>

                <p className="text-sm text-gray-500">
                  Review before saving.
                </p>
              </div>

              <button
                onClick={saveAttendance}
                disabled={!allMarked || saving}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-sm hover:shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving
                  ? "Saving..."
                  : "Save Attendance"}
              </button>
            </div>
          )}

        {/* Saved */}
        {saved &&
          !editing &&
          !loading && (
            <div className="border-t border-green-100 bg-green-50 px-5 md:px-7 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-bold text-green-700">
                  ✓ Attendance Completed
                </p>

                <p className="text-sm text-green-600 mt-1">
                  Today's attendance is saved. Use Edit
                  Attendance only if you need to make a
                  correction.
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
    </>
  );
}

/* =========================================================
   ATTENDANCE OVERVIEW
========================================================= */

function AttendanceOverview({
  children,
  overviewMode,
  setOverviewMode,
  overviewDate,
  setOverviewDate,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  customDateApplied,
  setCustomDateApplied,
  error,
}: {
  children: Child[];
  overviewMode: OverviewMode;
  setOverviewMode: (
    value: OverviewMode,
  ) => void;
  overviewDate: string;
  setOverviewDate: (value: string) => void;
  customStartDate: string;
  setCustomStartDate: (value: string) => void;
  customEndDate: string;
  setCustomEndDate: (value: string) => void;
  customDateApplied: boolean;
  setCustomDateApplied: (value: boolean) => void;
  error: string;
}) {
  const [records, setRecords] = useState<
    AttendanceRecord[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [overviewError, setOverviewError] =
    useState("");

  const [selectedChildId, setSelectedChildId] =
    useState<number | null>(null);

  const overviewDates = useMemo(() => {
    if (overviewMode === "weekly") {
      return getWeekDates(overviewDate);
    }

    if (overviewMode === "monthly") {
      return getMonthDates(overviewDate);
    }

    if (!customDateApplied) {
      return [];
    }

    const start = parseDate(customStartDate);
    const end = parseDate(customEndDate);

    if (start > end) {
      return [];
    }

    const dates: string[] = [];

    const current = new Date(start);

    while (current <= end) {
      dates.push(formatDateInput(current));

      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [
    overviewDate,
    overviewMode,
    customStartDate,
    customEndDate,
    customDateApplied,
  ]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setOverviewError("");

      let url = "/attendance/";
      let allRecords: AttendanceRecord[] = [];

      while (url) {
        const response = await api.get(url);

        const pageRecords: AttendanceRecord[] =
          response.data.results ?? response.data;

        allRecords = [...allRecords, ...pageRecords];

        url = response.data.next ?? "";
      }

      setRecords(allRecords);
    } catch (err) {
      console.error(err);
      setOverviewError(
        "Unable to load attendance overview.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const periodLabel =
    overviewMode === "weekly"
      ? getWeekLabel(overviewDate)
      : overviewMode === "monthly"
        ? getMonthLabel(overviewDate)
        : customDateApplied
          ? `${formatShortDate(
              customStartDate,
            )} – ${formatShortDate(customEndDate)}`
          : "Select a custom date range";

  const periodRecords = useMemo(
    () =>
      records.filter((record) =>
        overviewDates.includes(record.attendance_date),
      ),
    [records, overviewDates],
  );

  const totalRecords = periodRecords.length;

  const totalPresent = periodRecords.filter(
    (record) => record.status === "present",
  ).length;

  const totalAbsent = periodRecords.filter(
    (record) => record.status === "absent",
  ).length;

  const attendancePercentage =
    totalRecords > 0
      ? Math.round(
          (totalPresent / totalRecords) * 100,
        )
      : 0;

  const changeOverviewPeriod = (
    direction: number,
  ) => {
    if (overviewMode === "custom") return;

    const date = parseDate(overviewDate);

    if (overviewMode === "weekly") {
      date.setDate(
        date.getDate() + direction * 7,
      );
    } else {
      date.setMonth(
        date.getMonth() + direction,
      );
    }

    setOverviewDate(formatDateInput(date));
    setSelectedChildId(null);
  };

  const applyCustomRange = () => {
    if (!customStartDate || !customEndDate) {
      setOverviewError(
        "Please select both a start date and an end date.",
      );
      return;
    }

    if (
      parseDate(customStartDate) >
      parseDate(customEndDate)
    ) {
      setOverviewError(
        "The start date cannot be after the end date.",
      );
      return;
    }

    setOverviewError("");
    setCustomDateApplied(true);
    setSelectedChildId(null);
  };

  const selectedChild = children.find(
    (child) => child.id === selectedChildId,
  );

  const selectedChildRecords = selectedChild
    ? periodRecords
        .filter(
          (record) =>
            record.child === selectedChild.id,
        )
        .sort((a, b) =>
          a.attendance_date.localeCompare(
            b.attendance_date,
          ),
        )
    : [];

  return (
    <>
      {/* Errors */}
      {(error || overviewError) && (
        <div className="mb-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4">
          {overviewError || error}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#30435b]">
          Attendance Overview
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Review attendance records by week, month, or
          custom date range.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5 md:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Mode */}
          <div className="bg-gray-50 rounded-xl p-1 flex flex-wrap">
            <button
              onClick={() => {
                setOverviewMode("weekly");
                setSelectedChildId(null);
              }}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
                overviewMode === "weekly"
                  ? "bg-white text-pink-700 shadow-sm"
                  : "text-gray-500 hover:text-pink-700"
              }`}
            >
              Weekly
            </button>

            <button
              onClick={() => {
                setOverviewMode("monthly");
                setSelectedChildId(null);
              }}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
                overviewMode === "monthly"
                  ? "bg-white text-pink-700 shadow-sm"
                  : "text-gray-500 hover:text-pink-700"
              }`}
            >
              Monthly
            </button>

            <button
              onClick={() => {
                setOverviewMode("custom");
                setSelectedChildId(null);
              }}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
                overviewMode === "custom"
                  ? "bg-white text-pink-700 shadow-sm"
                  : "text-gray-500 hover:text-pink-700"
              }`}
            >
              Custom Date
            </button>
          </div>

          {/* Navigation */}
          {overviewMode !== "custom" ? (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() =>
                  changeOverviewPeriod(-1)
                }
                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-700 transition font-bold"
              >
                ←
              </button>

              <div className="text-center min-w-[190px]">
                <p className="font-bold text-[#30435b]">
                  {periodLabel}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {overviewMode === "weekly"
                    ? "Monday to Sunday"
                    : "Full calendar month"}
                </p>
              </div>

              <button
                onClick={() =>
                  changeOverviewPeriod(1)
                }
                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-700 transition font-bold"
              >
                →
              </button>
            </div>
          ) : (
            <div className="text-center lg:text-right">
              <p className="font-bold text-[#30435b]">
                {periodLabel}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Custom date range
              </p>
            </div>
          )}
        </div>

        {/* Custom Date Controls */}
        {overviewMode === "custom" && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-[#30435b] mb-2">
                  From Date
                </label>

                <input
                  type="date"
                  value={customStartDate}
                  max={getLocalDate()}
                  onChange={(e) => {
                    setCustomStartDate(
                      e.target.value,
                    );
                    setCustomDateApplied(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#30435b] mb-2">
                  To Date
                </label>

                <input
                  type="date"
                  value={customEndDate}
                  max={getLocalDate()}
                  min={customStartDate}
                  onChange={(e) => {
                    setCustomEndDate(
                      e.target.value,
                    );
                    setCustomDateApplied(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none"
                />
              </div>

              <button
                onClick={applyCustomRange}
                className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-sm hover:shadow-md transition"
              >
                Apply Date Range
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <OverviewStat
          label="Attendance Records"
          value={totalRecords}
          icon="📋"
        />

        <OverviewStat
          label="Present"
          value={totalPresent}
          icon="✓"
          green
        />

        <OverviewStat
          label="Absent"
          value={totalAbsent}
          icon="—"
          red
        />

        <OverviewStat
          label="Attendance Rate"
          value={`${attendancePercentage}%`}
          icon="%"
          purple
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-12 text-center text-gray-500">
          Loading attendance overview...
        </div>
      ) : overviewMode === "custom" &&
        !customDateApplied ? (
        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">
            📅
          </div>

          <h3 className="font-bold text-[#30435b] text-lg">
            Select a Date Range
          </h3>

          <p className="text-gray-500 mt-2">
            Choose the start and end dates above, then
            click Apply Date Range.
          </p>
        </div>
      ) : overviewDates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">
            📅
          </div>

          <h3 className="font-bold text-[#30435b] text-lg">
            No dates selected
          </h3>

          <p className="text-gray-500 mt-2">
            Please select a valid date range.
          </p>
        </div>
      ) : (
        <>
          {/* Weekly View */}
          {overviewMode === "weekly" && (
            <WeeklyOverview
              children={children}
              dates={overviewDates}
              records={records}
              selectedChildId={selectedChildId}
              setSelectedChildId={
                setSelectedChildId
              }
            />
          )}

          {/* Monthly View */}
          {overviewMode === "monthly" && (
            <MonthlyOverview
              children={children}
              dates={overviewDates}
              records={records}
              selectedChildId={selectedChildId}
              setSelectedChildId={
                setSelectedChildId
              }
            />
          )}

          {/* Custom View */}
          {overviewMode === "custom" && (
            <CustomOverview
              children={children}
              dates={overviewDates}
              records={records}
              selectedChildId={selectedChildId}
              setSelectedChildId={
                setSelectedChildId
              }
            />
          )}

          {/* Child Detail */}
          {selectedChild && (
            <ChildAttendanceDetail
              child={selectedChild}
              dates={overviewDates}
              records={selectedChildRecords}
              onClose={() =>
                setSelectedChildId(null)
              }
            />
          )}
        </>
      )}
    </>
  );
}

/* =========================================================
   WEEKLY
========================================================= */

function WeeklyOverview({
  children,
  dates,
  records,
  selectedChildId,
  setSelectedChildId,
}: {
  children: Child[];
  dates: string[];
  records: AttendanceRecord[];
  selectedChildId: number | null;
  setSelectedChildId: (
    id: number | null,
  ) => void;
}) {
  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
      <div className="px-5 md:px-7 py-5 border-b border-gray-100">
        <h3 className="font-bold text-[#30435b]">
          Weekly Attendance
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Click a child to see detailed attendance.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-5 py-4 text-xs uppercase tracking-wide text-gray-500 font-semibold sticky left-0 bg-gray-50">
                Child
              </th>

              {dates.map((date) => (
                <th
                  key={date}
                  className="px-3 py-4 text-center text-xs font-semibold text-gray-500"
                >
                  {parseDate(date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                    },
                  )}

                  <div className="text-[11px] text-gray-400 mt-1">
                    {parseDate(date).getDate()}
                  </div>
                </th>
              ))}

              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-gray-500">
                Rate
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {children.map((child) => {
              const percentage =
                calculateAttendancePercentage(
                  records,
                  child.id,
                  dates,
                );

              return (
                <tr
                  key={child.id}
                  className={`hover:bg-pink-50/30 transition ${
                    selectedChildId === child.id
                      ? "bg-pink-50/50"
                      : ""
                  }`}
                >
                  <td className="px-5 py-4 sticky left-0 bg-white">
                    <button
                      onClick={() =>
                        setSelectedChildId(
                          child.id,
                        )
                      }
                      className="text-left"
                    >
                      <p className="font-semibold text-[#30435b] hover:text-pink-600">
                        {child.first_name}{" "}
                        {child.last_name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {child.roll_number
                          ? `Roll No. ${child.roll_number}`
                          : child.classroom_name ||
                            "Child"}
                      </p>
                    </button>
                  </td>

                  {dates.map((date) => {
                    const status = getStatus(
                      records,
                      child.id,
                      date,
                    );

                    return (
                      <td
                        key={date}
                        className="px-3 py-4 text-center"
                      >
                        <AttendanceBadge
                          status={status}
                        />
                      </td>
                    );
                  })}

                  <td className="px-4 py-4 text-center">
                    <PercentageBadge
                      percentage={percentage}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AttendanceLegend />
    </div>
  );
}

/* =========================================================
   MONTHLY
========================================================= */

function MonthlyOverview({
  children,
  dates,
  records,
  selectedChildId,
  setSelectedChildId,
}: {
  children: Child[];
  dates: string[];
  records: AttendanceRecord[];
  selectedChildId: number | null;
  setSelectedChildId: (
    id: number | null,
  ) => void;
}) {
  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
      <div className="px-5 md:px-7 py-5 border-b border-gray-100">
        <h3 className="font-bold text-[#30435b]">
          Monthly Attendance Summary
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Summary of attendance records for each child.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-5 py-4 text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Child
              </th>

              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-gray-500">
                Records
              </th>

              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-gray-500">
                Present
              </th>

              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-gray-500">
                Absent
              </th>

              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-gray-500">
                Attendance
              </th>

              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-gray-500">
                Details
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {children.map((child) => {
              const childRecords = records.filter(
                (record) =>
                  record.child === child.id &&
                  dates.includes(
                    record.attendance_date,
                  ),
              );

              const present = childRecords.filter(
                (record) =>
                  record.status === "present",
              ).length;

              const absent = childRecords.filter(
                (record) =>
                  record.status === "absent",
              ).length;

              const percentage =
                childRecords.length > 0
                  ? Math.round(
                      (present /
                        childRecords.length) *
                        100,
                    )
                  : 0;

              return (
                <tr
                  key={child.id}
                  className={`hover:bg-pink-50/30 transition ${
                    selectedChildId === child.id
                      ? "bg-pink-50/50"
                      : ""
                  }`}
                >
                  <td className="px-5 py-5">
                    <p className="font-semibold text-[#30435b]">
                      {child.first_name}{" "}
                      {child.last_name}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {child.roll_number
                        ? `Roll No. ${child.roll_number}`
                        : child.classroom_name ||
                          "Child"}
                    </p>
                  </td>

                  <td className="px-4 py-5 text-center font-semibold text-[#30435b]">
                    {childRecords.length}
                  </td>

                  <td className="px-4 py-5 text-center font-semibold text-green-600">
                    {present}
                  </td>

                  <td className="px-4 py-5 text-center font-semibold text-red-600">
                    {absent}
                  </td>

                  <td className="px-4 py-5 text-center">
                    <PercentageBadge
                      percentage={percentage}
                    />
                  </td>

                  <td className="px-4 py-5 text-center">
                    <button
                      onClick={() =>
                        setSelectedChildId(
                          child.id,
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-pink-50 text-pink-700 font-semibold text-sm hover:bg-pink-100 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   CUSTOM DATE
========================================================= */

function CustomOverview({
  children,
  dates,
  records,
  selectedChildId,
  setSelectedChildId,
}: {
  children: Child[];
  dates: string[];
  records: AttendanceRecord[];
  selectedChildId: number | null;
  setSelectedChildId: (
    id: number | null,
  ) => void;
}) {
  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
      <div className="px-5 md:px-7 py-5 border-b border-gray-100">
        <h3 className="font-bold text-[#30435b]">
          Custom Date Range Summary
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Attendance summary for the selected date
          range.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-5 py-4 text-xs uppercase tracking-wide text-gray-500 font-semibold">
                Child
              </th>

              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-gray-500">
                Records
              </th>

              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-gray-500">
                Present
              </th>

              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-gray-500">
                Absent
              </th>

              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-gray-500">
                Attendance
              </th>

              <th className="px-4 py-4 text-center text-xs uppercase tracking-wide text-gray-500">
                Details
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {children.map((child) => {
              const childRecords = records.filter(
                (record) =>
                  record.child === child.id &&
                  dates.includes(
                    record.attendance_date,
                  ),
              );

              const present = childRecords.filter(
                (record) =>
                  record.status === "present",
              ).length;

              const absent = childRecords.filter(
                (record) =>
                  record.status === "absent",
              ).length;

              const percentage =
                childRecords.length > 0
                  ? Math.round(
                      (present /
                        childRecords.length) *
                        100,
                    )
                  : 0;

              return (
                <tr
                  key={child.id}
                  className={`hover:bg-pink-50/30 transition ${
                    selectedChildId === child.id
                      ? "bg-pink-50/50"
                      : ""
                  }`}
                >
                  <td className="px-5 py-5">
                    <p className="font-semibold text-[#30435b]">
                      {child.first_name}{" "}
                      {child.last_name}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {child.roll_number
                        ? `Roll No. ${child.roll_number}`
                        : child.classroom_name ||
                          "Child"}
                    </p>
                  </td>

                  <td className="px-4 py-5 text-center font-semibold text-[#30435b]">
                    {childRecords.length}
                  </td>

                  <td className="px-4 py-5 text-center font-semibold text-green-600">
                    {present}
                  </td>

                  <td className="px-4 py-5 text-center font-semibold text-red-600">
                    {absent}
                  </td>

                  <td className="px-4 py-5 text-center">
                    <PercentageBadge
                      percentage={percentage}
                    />
                  </td>

                  <td className="px-4 py-5 text-center">
                    <button
                      onClick={() =>
                        setSelectedChildId(
                          child.id,
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-pink-50 text-pink-700 font-semibold text-sm hover:bg-pink-100 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   CHILD DETAIL
========================================================= */

function ChildAttendanceDetail({
  child,
  dates,
  records,
  onClose,
}: {
  child: Child;
  dates: string[];
  records: AttendanceRecord[];
  onClose: () => void;
}) {
  const present = records.filter(
    (record) => record.status === "present",
  ).length;

  const absent = records.filter(
    (record) => record.status === "absent",
  ).length;

  const percentage =
    records.length > 0
      ? Math.round((present / records.length) * 100)
      : 0;

  return (
    <div className="mt-6 bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
      <div className="px-5 md:px-7 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center font-bold text-pink-700 text-lg">
            {child.first_name.charAt(0)}
          </div>

          <div>
            <h3 className="font-bold text-[#30435b] text-lg">
              {child.first_name} {child.last_name}
            </h3>

            <p className="text-sm text-gray-500">
              {child.roll_number
                ? `Roll No. ${child.roll_number}`
                : child.classroom_name ||
                  "Child"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-gray-50 text-gray-600 font-semibold hover:bg-gray-100 transition"
        >
          Close
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-5 md:p-7 border-b border-gray-100">
        <DetailStat
          label="Records"
          value={records.length}
        />

        <DetailStat
          label="Present"
          value={present}
          green
        />

        <DetailStat
          label="Absent"
          value={absent}
          red
        />
      </div>

      {/* Daily records */}
      <div className="p-5 md:p-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-[#30435b]">
              Attendance Details
            </h4>

            <p className="text-sm text-gray-500 mt-1">
              Attendance rate:{" "}
              <span className="font-semibold text-pink-600">
                {percentage}%
              </span>
            </p>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">
              📋
            </div>

            <p className="font-semibold text-[#30435b]">
              No attendance records
            </p>

            <p className="text-sm text-gray-500 mt-1">
              No attendance has been recorded for this
              child during this period.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dates.map((date) => {
              const record = records.find(
                (item) =>
                  item.attendance_date === date,
              );

              return (
                <div
                  key={date}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-[#30435b]">
                      {parseDate(
                        date,
                      ).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>

                  <AttendanceBadge
                    status={
                      record?.status ?? null
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function AttendanceBadge({
  status,
}: {
  status: Status | null;
}) {
  if (status === "present") {
    return (
      <span className="inline-flex items-center justify-center min-w-[34px] h-8 px-2 rounded-lg bg-green-100 text-green-700 font-bold text-sm">
        ✓
      </span>
    );
  }

  if (status === "absent") {
    return (
      <span className="inline-flex items-center justify-center min-w-[34px] h-8 px-2 rounded-lg bg-red-100 text-red-700 font-bold text-sm">
        —
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center min-w-[34px] h-8 px-2 rounded-lg bg-gray-100 text-gray-400 font-bold text-sm">
      ·
    </span>
  );
}

function PercentageBadge({
  percentage,
}: {
  percentage: number;
}) {
  let className =
    "bg-red-50 text-red-600";

  if (percentage >= 80) {
    className = "bg-green-50 text-green-700";
  } else if (percentage >= 60) {
    className = "bg-amber-50 text-amber-700";
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-bold ${className}`}
    >
      {percentage}%
    </span>
  );
}

function AttendanceLegend() {
  return (
    <div className="px-5 md:px-7 py-4 border-t border-gray-100 flex flex-wrap gap-5 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <AttendanceBadge status="present" />
        <span>Present</span>
      </div>

      <div className="flex items-center gap-2">
        <AttendanceBadge status="absent" />
        <span>Absent</span>
      </div>

      <div className="flex items-center gap-2">
        <AttendanceBadge status={null} />
        <span>No record</span>
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
          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-[#30435b] mt-1">
            {value}
          </p>
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

function OverviewStat({
  label,
  value,
  icon,
  green,
  red,
  purple,
}: {
  label: string;
  value: number | string;
  icon: string;
  green?: boolean;
  red?: boolean;
  purple?: boolean;
}) {
  const iconClass = green
    ? "bg-green-100 text-green-700"
    : red
      ? "bg-red-100 text-red-700"
      : purple
        ? "bg-purple-100 text-purple-700"
        : "bg-pink-100 text-pink-700";

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-[#30435b] mt-1">
            {value}
          </p>
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

function DetailStat({
  label,
  value,
  green,
  red,
}: {
  label: string;
  value: number;
  green?: boolean;
  red?: boolean;
}) {
  const valueClass = green
    ? "text-green-600"
    : red
      ? "text-red-600"
      : "text-[#30435b]";

  return (
    <div className="bg-gray-50 rounded-2xl p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p
        className={`text-2xl font-bold mt-1 ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}