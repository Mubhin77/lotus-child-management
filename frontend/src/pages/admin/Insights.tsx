import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

// ============================================================
// TYPES
// ============================================================

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  roll_number: number | null;
  classroom: number | null;
  classroom_name: string;
  is_active: boolean;
}

interface Classroom {
  id: number;
  name: string;
  academic_year: string;
  teachers?: number[];
  teacher_names?: string[];
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  address: string;
  is_active: boolean;
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

// ============================================================
// HELPERS
// ============================================================

const formatDate = (date: string) => {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-NP", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getToday = () => getDateString(new Date());

const getStartDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return getDateString(date);
};

const percentage = (value: number, total: number) => {
  if (!total) return 0;

  return Math.round((value / total) * 100);
};

const label = (value: string) => {
  if (!value) return "Not recorded";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getMostCommon = (values: string[]) => {
  if (!values.length) return "No data";

  const counts: Record<string, number> = {};

  values.forEach((value) => {
    if (!value) return;
    counts[value] = (counts[value] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return sorted[0]?.[0] || "No data";
};

// ============================================================
// SMALL COMPONENTS
// ============================================================

function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  tone: "pink" | "green" | "purple" | "orange";
}) {
  const tones = {
    pink: "bg-pink-50 text-pink-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-[1.5rem] border border-pink-100/70 shadow-[0_10px_30px_rgba(53,35,67,0.05)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {title}
          </p>

          <p className="text-3xl font-bold text-[#30435b] mt-2">
            {value}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-[#30435b]">
        {title}
      </h2>

      {description && (
        <p className="text-sm text-gray-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

function Distribution({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return (
    <div className="bg-white rounded-[1.5rem] border border-pink-100/70 shadow-[0_10px_30px_rgba(53,35,67,0.05)] p-6">
      <h3 className="font-bold text-[#30435b]">
        {title}
      </h3>

      <div className="mt-5 space-y-4">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400">
            No data recorded.
          </p>
        ) : (
          entries.map(([key, value]) => {
            const rate = percentage(value, total);

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600">
                    {label(key)}
                  </span>

                  <span className="text-sm font-bold text-[#30435b]">
                    {value}
                  </span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
                    style={{
                      width: `${rate}%`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Insights() {
  const [children, setChildren] = useState<Child[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState<"7" | "30" | "custom">("7");

  const [customStart, setCustomStart] = useState(
    getStartDate(6)
  );

  const [customEnd, setCustomEnd] = useState(
    getToday()
  );

  const [selectedClassroom, setSelectedClassroom] =
    useState("");

  const [selectedChild, setSelectedChild] =
    useState("");

  // ==========================================================
  // DATE RANGE
  // ==========================================================

  const dateRange = useMemo(() => {
    if (period === "custom") {
      return {
        start: customStart,
        end: customEnd,
      };
    }

    if (period === "30") {
      return {
        start: getStartDate(29),
        end: getToday(),
      };
    }

    return {
      start: getStartDate(6),
      end: getToday(),
    };
  }, [period, customStart, customEnd]);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          childrenResponse,
          classroomsResponse,
          teachersResponse,
          attendanceResponse,
          reportsResponse,
        ] = await Promise.all([
          api.get("/children/"),
          api.get("/classes/"),
          api.get("/teachers/"),
          api.get("/attendance/"),
          api.get("/daily-reports/"),
        ]);

        const extract = (response: any) => {
          return Array.isArray(response.data)
            ? response.data
            : response.data?.results || [];
        };

        setChildren(extract(childrenResponse));
        setClassrooms(extract(classroomsResponse));
        setTeachers(extract(teachersResponse));
        setAttendance(extract(attendanceResponse));
        setReports(extract(reportsResponse));

        console.log("INSIGHTS RAW DATA", {
          children: extract(childrenResponse),
          classrooms: extract(classroomsResponse),
          teachers: extract(teachersResponse),
          attendance: extract(attendanceResponse),
          reports: extract(reportsResponse),
        });
      } catch (err: any) {
        console.error("Failed to load insights:", err);

        setError(
          err?.response?.data?.detail ||
            "Unable to load insights. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ==========================================================
  // FILTER DATA BY DATE
  // ==========================================================

  const periodAttendance = useMemo(() => {
    return attendance.filter(
      (record) =>
        record.attendance_date >= dateRange.start &&
        record.attendance_date <= dateRange.end
    );
  }, [attendance, dateRange]);

  const periodReports = useMemo(() => {
    return reports.filter(
      (report) =>
        report.report_date >= dateRange.start &&
        report.report_date <= dateRange.end
    );
  }, [reports, dateRange]);

  // ==========================================================
  // FILTER BY CLASSROOM / CHILD
  // ==========================================================

  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const classroomMatch =
        !selectedClassroom ||
        String(child.classroom) === selectedClassroom;

      const childMatch =
        !selectedChild ||
        String(child.id) === selectedChild;

      return classroomMatch && childMatch;
    });
  }, [
    children,
    selectedClassroom,
    selectedChild,
  ]);

  const filteredChildIds = useMemo(() => {
    return new Set(
      filteredChildren.map((child) => child.id)
    );
  }, [filteredChildren]);

  const filteredAttendance = useMemo(() => {
    return periodAttendance.filter((record) =>
      filteredChildIds.has(record.child)
    );
  }, [periodAttendance, filteredChildIds]);

  const filteredReports = useMemo(() => {
    return periodReports.filter((report) =>
      filteredChildIds.has(report.child)
    );
  }, [periodReports, filteredChildIds]);

  // ==========================================================
  // OVERVIEW
  // ==========================================================

  const presentCount = filteredAttendance.filter(
    (record) => record.status === "present"
  ).length;

  const absentCount = filteredAttendance.filter(
    (record) => record.status === "absent"
  ).length;

  const attendanceRate = percentage(
    presentCount,
    filteredAttendance.length
  );

  const expectedReports = presentCount;

  const submittedReports = filteredReports.filter(
    (report) => report.submitted
  ).length;

  const pendingReports = Math.max(
    expectedReports - submittedReports,
    0
  );

  const reportCompletion = percentage(
    submittedReports,
    expectedReports
  );

  // ==========================================================
  // DISTRIBUTIONS
  // ==========================================================

  const moodData = useMemo(() => {
    const result: Record<string, number> = {};

    filteredReports
      .filter((report) => report.submitted)
      .forEach((report) => {
        if (!report.mood) return;

        result[report.mood] =
          (result[report.mood] || 0) + 1;
      });

    return result;
  }, [filteredReports]);

  const snackData = useMemo(() => {
    const result: Record<string, number> = {};

    filteredReports
      .filter((report) => report.submitted)
      .forEach((report) => {
        if (!report.morning_snack) return;

        result[report.morning_snack] =
          (result[report.morning_snack] || 0) + 1;
      });

    return result;
  }, [filteredReports]);

  const lunchData = useMemo(() => {
    const result: Record<string, number> = {};

    filteredReports
      .filter((report) => report.submitted)
      .forEach((report) => {
        if (!report.lunch) return;

        result[report.lunch] =
          (result[report.lunch] || 0) + 1;
      });

    return result;
  }, [filteredReports]);

  const participationData = useMemo(() => {
    const result: Record<string, number> = {};

    filteredReports
      .filter((report) => report.submitted)
      .forEach((report) => {
        if (!report.participation) return;

        result[report.participation] =
          (result[report.participation] || 0) + 1;
      });

    return result;
  }, [filteredReports]);

  const activityData = useMemo(() => {
    const result: Record<string, number> = {};

    filteredReports
      .filter((report) => report.submitted)
      .forEach((report) => {
        report.activity_names?.forEach((activity) => {
          result[activity] =
            (result[activity] || 0) + 1;
        });
      });

    return result;
  }, [filteredReports]);

  // ==========================================================
  // CLASSROOM SUMMARY
  // ==========================================================

  const classroomSummary = useMemo(() => {
    return classrooms.map((classroom) => {
      const classroomChildren = children.filter(
        (child) =>
          child.classroom === classroom.id
      );

      const childIds = new Set(
        classroomChildren.map((child) => child.id)
      );

      const classroomAttendance =
        periodAttendance.filter((record) =>
          childIds.has(record.child)
        );

      const classroomReports =
        periodReports.filter((report) =>
          childIds.has(report.child)
        );

      const present =
        classroomAttendance.filter(
          (record) => record.status === "present"
        ).length;

      const absent =
        classroomAttendance.filter(
          (record) => record.status === "absent"
        ).length;

      const expected = present;

      const submitted =
        classroomReports.filter(
          (report) => report.submitted
        ).length;

      return {
        ...classroom,
        children: classroomChildren.length,
        attendanceMarked: classroomAttendance.length,
        present,
        absent,
        expected,
        submitted,
        pending: Math.max(expected - submitted, 0),
        completion: percentage(
          submitted,
          expected
        ),
      };
    }).filter(
      (classroom) => classroom.children > 0
    );
  }, [
    classrooms,
    children,
    periodAttendance,
    periodReports,
  ]);

  // ==========================================================
  // TEACHER SUMMARY
  // ==========================================================

  const teacherSummary = useMemo(() => {
    return teachers.map((teacher) => {
      const teacherAttendance =
        filteredAttendance.filter(
          (record) => record.teacher === teacher.id
        );

      const teacherReports =
        filteredReports.filter(
          (report) => report.teacher === teacher.id
        );

      const present =
        teacherAttendance.filter(
          (record) => record.status === "present"
        ).length;

      const absent =
        teacherAttendance.filter(
          (record) => record.status === "absent"
        ).length;

      const expected = present;

      const submitted =
        teacherReports.filter(
          (report) => report.submitted
        ).length;

      return {
        ...teacher,
        marked: teacherAttendance.length,
        present,
        absent,
        expected,
        submitted,
        pending: Math.max(expected - submitted, 0),
        completion: percentage(
          submitted,
          expected
        ),
      };
    }).filter(
      (teacher) =>
        teacher.marked > 0 ||
        teacher.submitted > 0
    );
  }, [
    teachers,
    filteredAttendance,
    filteredReports,
  ]);

  // ==========================================================
  // DAILY SUMMARY
  // ==========================================================

  const dailySummary = useMemo(() => {
    const dates = new Set<string>();

    filteredAttendance.forEach((record) =>
      dates.add(record.attendance_date)
    );

    filteredReports.forEach((report) =>
      dates.add(report.report_date)
    );

    return Array.from(dates)
      .sort((a, b) => b.localeCompare(a))
      .map((date) => {
        const attendanceForDay =
          filteredAttendance.filter(
            (record) =>
              record.attendance_date === date
          );

        const reportsForDay =
          filteredReports.filter(
            (report) =>
              report.report_date === date
          );

        const present =
          attendanceForDay.filter(
            (record) =>
              record.status === "present"
          ).length;

        const absent =
          attendanceForDay.filter(
            (record) =>
              record.status === "absent"
          ).length;

        const submitted =
          reportsForDay.filter(
            (report) => report.submitted
          ).length;

        return {
          date,
          attendance: attendanceForDay.length,
          present,
          absent,
          expected: present,
          submitted,
          pending: Math.max(
            present - submitted,
            0
          ),
        };
      });
  }, [
    filteredAttendance,
    filteredReports,
  ]);

  // ==========================================================
  // CHILD SUMMARY
  // ==========================================================

  const childSummary = useMemo(() => {
    return filteredChildren.map((child) => {
      const childAttendance =
        filteredAttendance.filter(
          (record) =>
            record.child === child.id
        );

      const childReports =
        filteredReports.filter(
          (report) =>
            report.child === child.id
        );

      const present =
        childAttendance.filter(
          (record) =>
            record.status === "present"
        ).length;

      const absent =
        childAttendance.filter(
          (record) =>
            record.status === "absent"
        ).length;

      const submitted =
        childReports.filter(
          (report) => report.submitted
        ).length;

      const needsAttention: string[] = [];

      const recentReports =
        childReports.filter(
          (report) => report.submitted
        );

      const tiredCount =
        recentReports.filter(
          (report) =>
            report.mood === "tired"
        ).length;

      const didNotEatCount =
        recentReports.filter(
          (report) =>
            report.lunch === "did_not_eat"
        ).length;

      const noParticipationCount =
        recentReports.filter(
          (report) =>
            report.participation ===
            "not_participated"
        ).length;

      if (tiredCount >= 2) {
        needsAttention.push(
          "Tired mood recorded multiple times"
        );
      }

      if (didNotEatCount >= 2) {
        needsAttention.push(
          "Did not eat lunch multiple times"
        );
      }

      if (noParticipationCount >= 2) {
        needsAttention.push(
          "Low participation recorded multiple times"
        );
      }

      return {
        child,
        marked: childAttendance.length,
        present,
        absent,
        submitted,
        pending: Math.max(
          present - submitted,
          0
        ),
        attendanceRate: percentage(
          present,
          childAttendance.length
        ),
        reportRate: percentage(
          submitted,
          present
        ),
        needsAttention,
        reports: childReports.sort((a, b) =>
          b.report_date.localeCompare(
            a.report_date
          )
        ),
      };
    });
  }, [
    filteredChildren,
    filteredAttendance,
    filteredReports,
  ]);

  // ==========================================================
  // POSITIVE MOOD
  // ==========================================================

  const positiveMoodRate = useMemo(() => {
    const total = Object.values(moodData).reduce(
      (sum, value) => sum + value,
      0
    );

    const positive =
      (moodData.happy || 0) +
      (moodData.good || 0);

    return percentage(positive, total);
  }, [moodData]);

  // ==========================================================
  // SELECTED CHILD
  // ==========================================================

  const selectedChildData = useMemo(() => {
    if (!selectedChild) return null;

    return (
      childSummary.find(
        (item) =>
          String(item.child.id) ===
          selectedChild
      ) || null
    );
  }, [selectedChild, childSummary]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-2xl shadow-lg animate-pulse">
            📊
          </div>

          <p className="mt-4 font-bold text-[#30435b]">
            Preparing insights...
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Analysing school data
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-[1.5rem] border border-red-100 bg-red-50 p-6">
          <h2 className="font-bold text-red-700">
            Unable to load insights
          </h2>

          <p className="text-sm text-red-500 mt-1">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 px-4 py-2 rounded-xl bg-white border border-red-200 text-sm font-semibold text-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="space-y-6 pb-10">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="relative overflow-hidden rounded-[2rem] bg-white border border-pink-100/80 shadow-[0_12px_40px_rgba(53,35,67,0.06)]">

        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-pink-100/60 blur-3xl pointer-events-none" />

        <div className="relative p-6 md:p-8">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

            <div className="flex items-start gap-4">

              <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 items-center justify-center text-white text-2xl shadow-lg">
                📊
              </div>

              <div>

                <div className="flex flex-wrap gap-2 mb-2">

                  <span className="px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
                    School Insights
                  </span>

                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold">
                    {period === "7"
                      ? "Last 7 Days"
                      : period === "30"
                      ? "Last 30 Days"
                      : "Custom Range"}
                  </span>

                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-[#30435b]">
                  Understand how children are doing
                </h1>

                <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                  Review attendance, daily reports,
                  mood, meals, participation and
                  activities recorded by teachers.
                </p>

              </div>

            </div>

            <div className="px-4 py-3 rounded-2xl bg-[#fff8fb] border border-pink-100">

              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                Selected Period
              </p>

              <p className="text-sm font-bold text-[#30435b] mt-1">
                {formatDate(dateRange.start)}
                {" — "}
                {formatDate(dateRange.end)}
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <section className="bg-white rounded-[1.5rem] border border-pink-100/80 shadow-sm p-4">

        <div className="flex flex-col xl:flex-row gap-4">

          <div className="flex gap-2">

            <button
              onClick={() => {
                setPeriod("7");
                setSelectedChild("");
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                period === "7"
                  ? "bg-pink-500 text-white"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              7 Days
            </button>

            <button
              onClick={() => {
                setPeriod("30");
                setSelectedChild("");
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                period === "30"
                  ? "bg-pink-500 text-white"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              30 Days
            </button>

            <button
              onClick={() =>
                setPeriod("custom")
              }
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                period === "custom"
                  ? "bg-pink-500 text-white"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              Custom
            </button>

          </div>

          <select
            value={selectedClassroom}
            onChange={(e) => {
              setSelectedClassroom(
                e.target.value
              );
              setSelectedChild("");
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
          >

            <option value="">
              All Classrooms
            </option>

            {classrooms.map((classroom) => (
              <option
                key={classroom.id}
                value={classroom.id}
              >
                {classroom.name}
              </option>
            ))}

          </select>

          <select
            value={selectedChild}
            onChange={(e) =>
              setSelectedChild(
                e.target.value
              )
            }
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm"
          >

            <option value="">
              All Children
            </option>

            {children
              .filter(
                (child) =>
                  !selectedClassroom ||
                  String(child.classroom) ===
                    selectedClassroom
              )
              .map((child) => (
                <option
                  key={child.id}
                  value={child.id}
                >
                  {child.first_name}{" "}
                  {child.last_name}
                </option>
              ))}

          </select>

        </div>

        {period === "custom" && (
          <div className="mt-4 flex flex-col sm:flex-row gap-3">

            <input
              type="date"
              value={customStart}
              max={customEnd}
              onChange={(e) =>
                setCustomStart(e.target.value)
              }
              className="px-4 py-2.5 rounded-xl border border-gray-200"
            />

            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={getToday()}
              onChange={(e) =>
                setCustomEnd(e.target.value)
              }
              className="px-4 py-2.5 rounded-xl border border-gray-200"
            />

          </div>
        )}

      </section>

      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      <section>

        <SectionTitle
          title="Overview"
          description="A quick view of the selected period."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          <StatCard
            title="Children"
            value={filteredChildren.length}
            subtitle="Children in this view"
            icon="👧"
            tone="pink"
          />

          <StatCard
            title="Attendance"
            value={`${attendanceRate}%`}
            subtitle={`${presentCount} present • ${absentCount} absent`}
            icon="✓"
            tone="green"
          />

          <StatCard
            title="Daily Reports"
            value={submittedReports}
            subtitle={`${pendingReports} pending`}
            icon="📝"
            tone="purple"
          />

          <StatCard
            title="Positive Mood"
            value={`${positiveMoodRate}%`}
            subtitle="Happy or good"
            icon="😊"
            tone="orange"
          />

        </div>

      </section>

      {/* ======================================================
          ATTENDANCE + REPORTS
      ====================================================== */}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-[1.75rem] border border-pink-100/70 shadow-sm p-6">

          <SectionTitle
            title="Attendance Overview"
            description="Attendance during the selected period."
          />

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-xs font-semibold text-green-600">
                Present
              </p>

              <p className="text-3xl font-bold text-green-700 mt-1">
                {presentCount}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-5">
              <p className="text-xs font-semibold text-red-600">
                Absent
              </p>

              <p className="text-3xl font-bold text-red-700 mt-1">
                {absentCount}
              </p>
            </div>

          </div>

          <div className="mt-6">

            <div className="flex justify-between mb-2">

              <span className="text-sm font-semibold text-gray-500">
                Attendance Rate
              </span>

              <span className="text-sm font-bold text-[#30435b]">
                {attendanceRate}%
              </span>

            </div>

            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">

              <div
                className="h-full bg-green-400 rounded-full"
                style={{
                  width: `${attendanceRate}%`,
                }}
              />

            </div>

          </div>

        </div>

        <div className="bg-white rounded-[1.75rem] border border-pink-100/70 shadow-sm p-6">

          <SectionTitle
            title="Daily Reporting"
            description="Teacher report completion."
          />

          <div className="flex items-center gap-6">

            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(#ec4899 ${reportCompletion}%, #f3f4f6 ${reportCompletion}% 100%)`,
              }}
            >

              <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center">

                <span className="text-xl font-bold text-[#30435b]">
                  {reportCompletion}%
                </span>

                <span className="text-[9px] text-gray-400 font-bold">
                  COMPLETE
                </span>

              </div>

            </div>

            <div className="space-y-3">

              <div>
                <p className="text-xs text-gray-400">
                  Expected
                </p>

                <p className="font-bold text-[#30435b]">
                  {expectedReports}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Submitted
                </p>

                <p className="font-bold text-green-600">
                  {submittedReports}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Pending
                </p>

                <p className="font-bold text-orange-500">
                  {pendingReports}
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          DAILY REPORT PATTERNS
      ====================================================== */}

      <section>

        <SectionTitle
          title="Daily Report Patterns"
          description="What teachers have recorded about children's day."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          <Distribution
            title="Mood"
            data={moodData}
          />

          <Distribution
            title="Morning Snack"
            data={snackData}
          />

          <Distribution
            title="Lunch"
            data={lunchData}
          />

          <Distribution
            title="Participation"
            data={participationData}
          />

        </div>

      </section>

      {/* ======================================================
          ACTIVITIES
      ====================================================== */}

      <section className="bg-white rounded-[1.75rem] border border-pink-100/70 shadow-sm p-6">

        <SectionTitle
          title="Activities"
          description="Activities recorded by teachers."
        />

        {Object.keys(activityData).length === 0 ? (
          <p className="text-sm text-gray-400">
            No activities recorded.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

            {Object.entries(activityData)
              .sort((a, b) => b[1] - a[1])
              .map(([activity, count]) => (
                <div
                  key={activity}
                  className="rounded-2xl bg-[#fff8fb] border border-pink-100 p-5"
                >

                  <p className="font-bold text-[#30435b]">
                    {activity}
                  </p>

                  <p className="text-2xl font-bold text-pink-600 mt-2">
                    {count}
                  </p>

                  <p className="text-xs text-gray-400">
                    {count === 1
                      ? "record"
                      : "records"}
                  </p>

                </div>
              ))}

          </div>
        )}

      </section>

      {/* ======================================================
          CLASSROOM OVERVIEW
      ====================================================== */}

      <section>

        <SectionTitle
          title="Classroom Overview"
          description="Attendance and reporting across classrooms."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {classroomSummary.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-pink-100 p-8 text-center text-gray-400">
              No classroom data available.
            </div>
          ) : (
            classroomSummary.map((classroom) => (
              <button
                key={classroom.id}
                onClick={() => {
                  setSelectedClassroom(
                    String(classroom.id)
                  );
                  setSelectedChild("");
                }}
                className="text-left bg-white rounded-[1.5rem] border border-pink-100 shadow-sm p-5 hover:border-pink-300 transition"
              >

                <div className="flex justify-between">

                  <div>

                    <h3 className="font-bold text-[#30435b]">
                      {classroom.name}
                    </h3>

                    <p className="text-xs text-gray-400 mt-1">
                      {classroom.children} children
                    </p>

                  </div>

                  <span className="text-gray-300">
                    →
                  </span>

                </div>

                <div className="mt-5">

                  <div className="flex justify-between text-xs mb-2">

                    <span className="font-semibold text-gray-500">
                      Attendance
                    </span>

                    <span className="font-bold text-[#30435b]">
                      {percentage(
                        classroom.present,
                        classroom.attendanceMarked
                      )}%
                    </span>

                  </div>

                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-green-400 rounded-full"
                      style={{
                        width: `${percentage(
                          classroom.present,
                          classroom.attendanceMarked
                        )}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-2 mt-5">

                  <div className="rounded-xl bg-green-50 p-3">
                    <p className="text-[10px] uppercase font-bold text-green-600">
                      Present
                    </p>

                    <p className="text-lg font-bold text-green-700">
                      {classroom.present}
                    </p>
                  </div>

                  <div className="rounded-xl bg-red-50 p-3">
                    <p className="text-[10px] uppercase font-bold text-red-600">
                      Absent
                    </p>

                    <p className="text-lg font-bold text-red-700">
                      {classroom.absent}
                    </p>
                  </div>

                  <div className="rounded-xl bg-purple-50 p-3">
                    <p className="text-[10px] uppercase font-bold text-purple-600">
                      Reports
                    </p>

                    <p className="text-lg font-bold text-purple-700">
                      {classroom.submitted}
                    </p>
                  </div>

                </div>

              </button>
            ))
          )}

        </div>

      </section>

      {/* ======================================================
          TEACHER TRACKING
      ====================================================== */}

      <section>

        <SectionTitle
          title="Teacher Reporting"
          description="Attendance and daily report completion by teacher."
        />

        <div className="bg-white rounded-[1.5rem] border border-pink-100 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-pink-50 border-b border-pink-100">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Teacher
                  </th>

                  <th className="text-center px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Attendance
                  </th>

                  <th className="text-center px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Present
                  </th>

                  <th className="text-center px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Reports
                  </th>

                  <th className="text-center px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Completion
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {teacherSummary.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-gray-400"
                    >
                      No teacher activity recorded.
                    </td>
                  </tr>
                ) : (
                  teacherSummary.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="hover:bg-pink-50/40"
                    >

                      <td className="px-6 py-4">

                        <p className="font-semibold text-[#30435b]">
                          {teacher.first_name}{" "}
                          {teacher.last_name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {teacher.username}
                        </p>

                      </td>

                      <td className="px-6 py-4 text-center text-sm">
                        {teacher.marked}
                      </td>

                      <td className="px-6 py-4 text-center">

                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
                          {teacher.present}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-center text-sm">
                        {teacher.submitted}
                        {" / "}
                        {teacher.expected}
                      </td>

                      <td className="px-6 py-4 text-center">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            teacher.completion === 100
                              ? "bg-green-50 text-green-700"
                              : teacher.completion >= 70
                              ? "bg-orange-50 text-orange-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {teacher.completion}%
                        </span>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

      {/* ======================================================
          DAILY BREAKDOWN
      ====================================================== */}

      <section>

        <SectionTitle
          title="Daily Breakdown"
          description="Attendance and report completion by date."
        />

        <div className="bg-white rounded-[1.5rem] border border-pink-100 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50 border-b">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Date
                  </th>

                  <th className="text-center px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Attendance
                  </th>

                  <th className="text-center px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Present
                  </th>

                  <th className="text-center px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Absent
                  </th>

                  <th className="text-center px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Reports
                  </th>

                  <th className="text-center px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Completion
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {dailySummary.map((day) => (
                  <tr
                    key={day.date}
                    className="hover:bg-pink-50/40"
                  >

                    <td className="px-6 py-4 font-semibold text-[#30435b]">
                      {formatDate(day.date)}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {day.attendance}
                    </td>

                    <td className="px-6 py-4 text-center text-green-600 font-semibold">
                      {day.present}
                    </td>

                    <td className="px-6 py-4 text-center text-red-600 font-semibold">
                      {day.absent}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {day.submitted}
                      {" / "}
                      {day.expected}
                    </td>

                    <td className="px-6 py-4 text-center">

                      <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-semibold">
                        {percentage(
                          day.submitted,
                          day.expected
                        )}%
                      </span>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </section>

      {/* ======================================================
          CHILD TRACKING
      ====================================================== */}

      <section>

        <SectionTitle
          title="Individual Child Tracking"
          description="Attendance, reporting and observations for each child."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {childSummary.map((item) => (
            <button
              key={item.child.id}
              onClick={() =>
                setSelectedChild(
                  String(item.child.id)
                )
              }
              className="text-left bg-white rounded-[1.5rem] border border-pink-100 shadow-sm p-5 hover:border-pink-300 transition"
            >

              <div className="flex items-start justify-between">

                <div>

                  <h3 className="font-bold text-[#30435b]">
                    {item.child.first_name}{" "}
                    {item.child.last_name}
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    {item.child.classroom_name ||
                      "No classroom"}
                  </p>

                </div>

                <span className="text-gray-300">
                  →
                </span>

              </div>

              <div className="grid grid-cols-3 gap-2 mt-5">

                <div className="rounded-xl bg-green-50 p-3">

                  <p className="text-[10px] uppercase font-bold text-green-600">
                    Present
                  </p>

                  <p className="text-lg font-bold text-green-700">
                    {item.present}
                  </p>

                </div>

                <div className="rounded-xl bg-red-50 p-3">

                  <p className="text-[10px] uppercase font-bold text-red-600">
                    Absent
                  </p>

                  <p className="text-lg font-bold text-red-700">
                    {item.absent}
                  </p>

                </div>

                <div className="rounded-xl bg-purple-50 p-3">

                  <p className="text-[10px] uppercase font-bold text-purple-600">
                    Reports
                  </p>

                  <p className="text-lg font-bold text-purple-700">
                    {item.submitted}
                  </p>

                </div>

              </div>

              {item.needsAttention.length > 0 && (
                <div className="mt-4 rounded-xl bg-orange-50 border border-orange-100 p-3">

                  <p className="text-xs font-bold text-orange-700">
                    Needs Attention
                  </p>

                  <p className="text-xs text-orange-600 mt-1">
                    {item.needsAttention[0]}
                  </p>

                </div>
              )}

            </button>
          ))}

        </div>

      </section>

      {/* ======================================================
          SELECTED CHILD DETAILS
      ====================================================== */}

      {selectedChildData && (
        <section className="bg-white rounded-[1.75rem] border border-pink-100 shadow-sm p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-pink-500">
                Child Details
              </p>

              <h2 className="text-2xl font-bold text-[#30435b] mt-1">
                {selectedChildData.child.first_name}{" "}
                {selectedChildData.child.last_name}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                {selectedChildData.child.classroom_name}
              </p>

            </div>

            <button
              onClick={() =>
                setSelectedChild("")
              }
              className="px-4 py-2 rounded-xl bg-gray-50 text-gray-600 text-sm font-semibold"
            >
              Close
            </button>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-xs text-green-600">
                Attendance Rate
              </p>

              <p className="text-2xl font-bold text-green-700">
                {selectedChildData.attendanceRate}%
              </p>
            </div>

            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-xs text-purple-600">
                Reports
              </p>

              <p className="text-2xl font-bold text-purple-700">
                {selectedChildData.submitted}
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-4">
              <p className="text-xs text-orange-600">
                Pending
              </p>

              <p className="text-2xl font-bold text-orange-700">
                {selectedChildData.pending}
              </p>
            </div>

            <div className="rounded-xl bg-pink-50 p-4">
              <p className="text-xs text-pink-600">
                Report Completion
              </p>

              <p className="text-2xl font-bold text-pink-700">
                {selectedChildData.reportRate}%
              </p>
            </div>

          </div>

          <h3 className="font-bold text-[#30435b] mb-4">
            Daily Reports
          </h3>

          <div className="space-y-3">

            {selectedChildData.reports.length === 0 ? (
              <p className="text-sm text-gray-400">
                No reports recorded.
              </p>
            ) : (
              selectedChildData.reports.map(
                (report) => (
                  <div
                    key={report.id}
                    className="border border-gray-100 rounded-2xl p-4"
                  >

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                      <div>

                        <p className="font-bold text-[#30435b]">
                          {formatDate(
                            report.report_date
                          )}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          Teacher:{" "}
                          {report.teacher_name ||
                            "Not recorded"}
                        </p>

                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          report.submitted
                            ? "bg-green-50 text-green-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {report.submitted
                          ? "Submitted"
                          : "Pending"}
                      </span>

                    </div>

                    {report.submitted && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">

                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            Mood
                          </p>

                          <p className="text-sm font-semibold text-[#30435b] mt-1">
                            {label(report.mood)}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            Snack
                          </p>

                          <p className="text-sm font-semibold text-[#30435b] mt-1">
                            {label(
                              report.morning_snack
                            )}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            Lunch
                          </p>

                          <p className="text-sm font-semibold text-[#30435b] mt-1">
                            {label(report.lunch)}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            Participation
                          </p>

                          <p className="text-sm font-semibold text-[#30435b] mt-1">
                            {label(
                              report.participation
                            )}
                          </p>
                        </div>

                      </div>
                    )}

                    {report.activity_names?.length >
                      0 && (
                      <div className="mt-4">

                        <p className="text-xs font-bold text-gray-400 uppercase">
                          Activities
                        </p>

                        <div className="flex flex-wrap gap-2 mt-2">

                          {report.activity_names.map(
                            (activity) => (
                              <span
                                key={activity}
                                className="px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 text-xs font-semibold"
                              >
                                {activity}
                              </span>
                            )
                          )}

                        </div>

                      </div>
                    )}

                    {report.teacher_observation && (
                      <div className="mt-4 rounded-xl bg-gray-50 p-4">

                        <p className="text-xs font-bold text-gray-400 uppercase">
                          Teacher Observation
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {report.teacher_observation}
                        </p>

                      </div>
                    )}

                  </div>
                )
              )
            )}

          </div>

        </section>
      )}

    </div>
  );
}