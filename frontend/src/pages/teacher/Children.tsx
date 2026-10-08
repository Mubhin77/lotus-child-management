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

type DailyReport = {
  id: number;
  child: number;
  child_name?: string;
  teacher?: number;
  teacher_name?: string;
  classroom_name?: string;
  report_date: string;
  mood?: string;
  morning_snack?: string;
  lunch?: string;
  rest_status?: string;
  rest_start?: string | null;
  rest_end?: string | null;
  participation?: string;
  teacher_observation?: string;
  activities?: number[];
  activity_names?: string[];
  submitted?: boolean;
  created_at?: string;
  updated_at?: string;
};

type AttendanceRecord = {
  id: number;
  child: number;
  child_name?: string;
  attendance_date: string;
  status: "present" | "absent";
  marked_at?: string;
};

type DateFilter = "7" | "30" | "month" | "custom";

type CountItem = {
  label: string;
  count: number;
};

const getLocalDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
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

const formatDisplayDate = (dateString: string) => {
  if (!dateString) return "—";

  return parseDate(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStartDate = (filter: DateFilter) => {
  const today = parseDate(getLocalDate());

  if (filter === "7") {
    const date = new Date(today);
    date.setDate(date.getDate() - 6);
    return formatDateInput(date);
  }

  if (filter === "30") {
    const date = new Date(today);
    date.setDate(date.getDate() - 29);
    return formatDateInput(date);
  }

  if (filter === "month") {
    return formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  return formatDateInput(today);
};

const labelValue = (value?: string) => {
  if (!value) return "Not recorded";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function Children() {
  const [children, setChildren] = useState<Child[]>([]);
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  const [loading, setLoading] = useState(true);
  const [recordLoading, setRecordLoading] = useState(false);

  const [error, setError] = useState("");
  const [recordError, setRecordError] = useState("");

  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const [dateFilter, setDateFilter] = useState<DateFilter>("30");

  const [customStartDate, setCustomStartDate] = useState(getStartDate("30"));

  const [customEndDate, setCustomEndDate] = useState(getLocalDate());

  const [appliedStartDate, setAppliedStartDate] = useState(getStartDate("30"));

  const [appliedEndDate, setAppliedEndDate] = useState(getLocalDate());

  const [activeSection, setActiveSection] = useState<
    "overview" | "daily" | "attendance"
  >("overview");

  useEffect(() => {
    const loadChildren = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/children/");

        setChildren(response.data.results ?? response.data);
      } catch (error) {
        console.error(error);
        setError("Unable to load your children.");
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, []);

  const filteredChildren = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return children;

    return children.filter((child) =>
      `${child.first_name} ${child.last_name}`.toLowerCase().includes(value),
    );
  }, [children, search]);

  const openChildRecord = async (child: Child) => {
    try {
      setSelectedChild(child);
      setRecordLoading(true);
      setRecordError("");
      setActiveSection("overview");

      const [reportsResponse, attendanceResponse] = await Promise.all([
        api.get("/daily-reports/", {
          params: {
            child: child.id,
          },
        }),
        api.get("/attendance/", {
          params: {
            child: child.id,
          },
        }),
      ]);

      setDailyReports(reportsResponse.data.results ?? reportsResponse.data);

      setAttendance(attendanceResponse.data.results ?? attendanceResponse.data);
    } catch (error) {
      console.error(error);
      setRecordError("Unable to load this child's records.");
    } finally {
      setRecordLoading(false);
    }
  };

  const closeChildRecord = () => {
    setSelectedChild(null);
    setDailyReports([]);
    setAttendance([]);
    setRecordError("");
  };

  const applyCustomRange = () => {
    if (!customStartDate || !customEndDate) {
      setRecordError("Please select both a start date and an end date.");
      return;
    }

    if (parseDate(customStartDate) > parseDate(customEndDate)) {
      setRecordError("The start date cannot be after the end date.");
      return;
    }

    setRecordError("");
    setAppliedStartDate(customStartDate);
    setAppliedEndDate(customEndDate);
  };

  const changeDateFilter = (filter: DateFilter) => {
    setDateFilter(filter);

    if (filter !== "custom") {
      setAppliedStartDate(getStartDate(filter));
      setAppliedEndDate(getLocalDate());
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8fb] p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <p className="text-sm font-semibold text-pink-600">
              YOUR CLASSROOM
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-[#30435b] mt-2">
              My Children
            </h1>

            <p className="text-gray-500 mt-2">
              View children's records, daily reports, attendance, and classroom
              patterns.
            </p>
          </div>

          <div className="bg-white border border-pink-100 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Children</p>

            <p className="text-2xl font-bold text-[#30435b]">
              {children.length}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4">
            {error}
          </div>
        )}

        {/* SEARCH */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-4 mb-6">
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search children..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
            />
          </div>
        </div>

        {/* CHILDREN */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
            Loading children...
          </div>
        ) : filteredChildren.length === 0 ? (
          <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center">
            <div className="text-5xl mb-4">👧</div>

            <h2 className="font-bold text-xl text-[#30435b]">
              No children found
            </h2>

            <p className="text-gray-500 mt-2">
              {search
                ? "Try another search."
                : "No children are currently assigned to you."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => openChildRecord(child)}
                className="text-left bg-white rounded-3xl border border-pink-100 shadow-sm p-6 hover:-translate-y-1 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xl font-bold text-pink-700">
                    {child.first_name.charAt(0)}
                  </div>

                  <span className="text-gray-300 text-xl">→</span>
                </div>

                <h2 className="font-bold text-lg text-[#30435b] mt-5">
                  {child.first_name} {child.last_name}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {child.classroom_name || "Assigned Classroom"}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">
                      Roll No.
                    </p>

                    <p className="font-semibold text-[#30435b] mt-1">
                      {child.roll_number ?? "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">
                      Status
                    </p>

                    <p
                      className={`font-semibold mt-1 ${
                        child.is_active === false
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {child.is_active === false ? "Inactive" : "Active"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-sm font-semibold text-pink-600">
                  View Child Record →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CHILD RECORD */}
      {selectedChild && (
        <div className="fixed inset-0 z-50 bg-[#263238]/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-5">
          <div
            className="w-full max-w-7xl max-h-[95vh] bg-[#fff8fb] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            {/* HEADER */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 md:px-8 py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-xl">
                    {selectedChild.first_name.charAt(0)}
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {selectedChild.first_name} {selectedChild.last_name}
                    </h2>

                    <p className="text-white/80 mt-1">
                      {selectedChild.classroom_name || "Assigned Classroom"}

                      {selectedChild.roll_number
                        ? ` · Roll No. ${selectedChild.roll_number}`
                        : ""}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeChildRecord}
                  className="self-end md:self-auto w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 transition flex items-center justify-center text-xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="overflow-y-auto flex-1 p-4 md:p-7">
              {recordLoading ? (
                <div className="bg-white rounded-3xl p-16 text-center text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  Loading {selectedChild.first_name}'s records...
                </div>
              ) : recordError ? (
                <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4">
                  {recordError}
                </div>
              ) : (
                <>
                  {/* FILTER */}
                  <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-4 md:p-5 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#30435b]">
                          Record Period
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {formatDisplayDate(appliedStartDate)} –{" "}
                          {formatDisplayDate(appliedEndDate)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <FilterButton
                          active={dateFilter === "7"}
                          onClick={() => changeDateFilter("7")}
                        >
                          Last 7 Days
                        </FilterButton>

                        <FilterButton
                          active={dateFilter === "30"}
                          onClick={() => changeDateFilter("30")}
                        >
                          Last 30 Days
                        </FilterButton>

                        <FilterButton
                          active={dateFilter === "month"}
                          onClick={() => changeDateFilter("month")}
                        >
                          This Month
                        </FilterButton>

                        <FilterButton
                          active={dateFilter === "custom"}
                          onClick={() => changeDateFilter("custom")}
                        >
                          Custom
                        </FilterButton>
                      </div>
                    </div>

                    {dateFilter === "custom" && (
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="date"
                          value={customStartDate}
                          max={getLocalDate()}
                          onChange={(event) =>
                            setCustomStartDate(event.target.value)
                          }
                          className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-pink-300"
                        />

                        <input
                          type="date"
                          value={customEndDate}
                          max={getLocalDate()}
                          min={customStartDate}
                          onChange={(event) =>
                            setCustomEndDate(event.target.value)
                          }
                          className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-pink-300"
                        />

                        <button
                          onClick={applyCustomRange}
                          className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold"
                        >
                          Apply Date Range
                        </button>
                      </div>
                    )}
                  </div>

                  {/* SECTIONS */}
                  <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-2 mb-6 flex flex-wrap gap-2">
                    <SectionButton
                      active={activeSection === "overview"}
                      onClick={() => setActiveSection("overview")}
                    >
                      📊 Overview
                    </SectionButton>

                    <SectionButton
                      active={activeSection === "daily"}
                      onClick={() => setActiveSection("daily")}
                    >
                      📋 Daily Reports
                    </SectionButton>

                    <SectionButton
                      active={activeSection === "attendance"}
                      onClick={() => setActiveSection("attendance")}
                    >
                      ✓ Attendance
                    </SectionButton>
                  </div>

                  {activeSection === "overview" && (
                    <ChildOverview
                      child={selectedChild}
                      dailyReports={dailyReports}
                      attendance={attendance}
                      startDate={appliedStartDate}
                      endDate={appliedEndDate}
                    />
                  )}

                  {activeSection === "daily" && (
                    <DailyReportsSection
                      reports={dailyReports}
                      startDate={appliedStartDate}
                      endDate={appliedEndDate}
                    />
                  )}

                  {activeSection === "attendance" && (
                    <AttendanceSection
                      records={attendance}
                      startDate={appliedStartDate}
                      endDate={appliedEndDate}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CHILD OVERVIEW
========================================================= */

function ChildOverview({
  child,
  dailyReports,
  attendance,
  startDate,
  endDate,
}: {
  child: Child;
  dailyReports: DailyReport[];
  attendance: AttendanceRecord[];
  startDate: string;
  endDate: string;
}) {
  const reports = useMemo(
    () =>
      dailyReports
        .filter(
          (report) =>
            report.report_date >= startDate && report.report_date <= endDate,
        )
        .sort((a, b) => a.report_date.localeCompare(b.report_date)),
    [dailyReports, startDate, endDate],
  );

  const attendanceRecords = useMemo(
    () =>
      attendance
        .filter(
          (record) =>
            record.attendance_date >= startDate &&
            record.attendance_date <= endDate,
        )
        .sort((a, b) => a.attendance_date.localeCompare(b.attendance_date)),
    [attendance, startDate, endDate],
  );

  const present = attendanceRecords.filter(
    (record) => record.status === "present",
  ).length;

  const absent = attendanceRecords.filter(
    (record) => record.status === "absent",
  ).length;

  const attendanceRate =
    attendanceRecords.length > 0
      ? Math.round((present / attendanceRecords.length) * 100)
      : 0;

  const moodData = countValues(reports.map((report) => report.mood));

  const snackData = countValues(reports.map((report) => report.morning_snack));

  const lunchData = countValues(reports.map((report) => report.lunch));

  const restData = countValues(reports.map((report) => report.rest_status));

  const participationData = countValues(
    reports.map((report) => report.participation),
  );

  const activityData = countActivities(reports);

  const recentObservations = reports
    .filter((report) => report.teacher_observation?.trim())
    .slice()
    .reverse()
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Attendance"
          value={`${attendanceRate}%`}
          icon="✓"
          green
        />

        <SummaryCard label="Reports" value={reports.length} icon="📋" />

        <SummaryCard label="Present" value={present} icon="✓" green />

        <SummaryCard label="Absent" value={absent} icon="—" red />
      </div>

      {/* CHILD INFO */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-3xl font-bold text-pink-700">
            {child.first_name.charAt(0)}
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#30435b]">
              {child.first_name} {child.last_name}
            </h3>

            <p className="text-gray-500 mt-1">
              {child.classroom_name || "Assigned Classroom"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SmallInfo
              label="Roll No."
              value={child.roll_number ? String(child.roll_number) : "—"}
            />

            <SmallInfo
              label="Date of Birth"
              value={
                child.date_of_birth
                  ? formatDisplayDate(child.date_of_birth)
                  : "—"
              }
            />
          </div>
        </div>
      </div>

      {/* MOOD */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Mood Pattern"
          description="How the child's mood has been recorded during the selected period."
        >
          <MoodTrend reports={reports} />
        </ChartCard>

        <ChartCard
          title="Mood Distribution"
          description="Overall mood pattern during the selected period."
        >
          <HorizontalBars
            data={moodData}
            emptyText="No mood records available."
          />
        </ChartCard>
      </div>

      {/* EATING */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Morning Snack"
          description="Morning snack habits based on daily reports."
        >
          <HorizontalBars
            data={snackData}
            emptyText="No snack records available."
          />
        </ChartCard>

        <ChartCard
          title="Lunch Habits"
          description="Lunch completion pattern during the selected period."
        >
          <HorizontalBars
            data={lunchData}
            emptyText="No lunch records available."
          />
        </ChartCard>
      </div>

      {/* REST / PARTICIPATION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Rest Pattern"
          description="How the child has been resting during school days."
        >
          <HorizontalBars
            data={restData}
            emptyText="No rest records available."
          />
        </ChartCard>

        <ChartCard
          title="Participation"
          description="Participation in classroom activities."
        >
          <HorizontalBars
            data={participationData}
            emptyText="No participation records available."
          />
        </ChartCard>
      </div>

      {/* ACTIVITIES */}
      <ChartCard
        title="Activity Participation"
        description="Activities recorded in the child's daily reports."
      >
        <HorizontalBars
          data={activityData}
          emptyText="No activity records available."
        />
      </ChartCard>

      {/* OBSERVATIONS */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="px-5 md:px-7 py-5 border-b border-gray-100">
          <h3 className="font-bold text-[#30435b]">
            Recent Teacher Observations
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Recent notes recorded by teachers.
          </p>
        </div>

        {recentObservations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No teacher observations recorded during this period.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentObservations.map((report) => (
              <div key={report.id} className="p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 text-xs font-bold whitespace-nowrap">
                    {formatDisplayDate(report.report_date)}
                  </div>

                  <div>
                    <p className="text-[#30435b] leading-relaxed">
                      {report.teacher_observation}
                    </p>

                    {report.teacher_name && (
                      <p className="text-xs text-gray-400 mt-2">
                        Recorded by {report.teacher_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DAILY TIMELINE */}
      <DailyTimeline reports={reports} attendance={attendanceRecords} />
    </div>
  );
}

/* =========================================================
   MOOD TREND
========================================================= */

function MoodTrend({ reports }: { reports: DailyReport[] }) {
  const points = reports
    .filter((report) => report.mood)
    .map((report) => ({
      date: report.report_date,
      value: moodScore(report.mood),
      label: labelValue(report.mood),
    }));

  if (points.length === 0) {
    return <EmptyChart text="No mood records available." />;
  }

  const max = 4;
  const width = 700;
  const height = 230;
  const paddingX = 35;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const coordinates = points.map((point, index) => {
    const x =
      points.length === 1
        ? width / 2
        : paddingX + (index / (points.length - 1)) * chartWidth;

    const y = height - paddingY - ((point.value - 1) / (max - 1)) * chartHeight;

    return {
      ...point,
      x,
      y,
    };
  });

  const path = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div>
      <div className="relative overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {[1, 2, 3, 4].map((value) => {
            const y =
              height - paddingY - ((value - 1) / (max - 1)) * chartHeight;

            return (
              <g key={value}>
                <line
                  x1={paddingX}
                  x2={width - paddingX}
                  y1={y}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="2"
                />

                <text x="4" y={y + 4} fontSize="12" fill="#94a3b8">
                  {moodLabel(value)}
                </text>
              </g>
            );
          })}

          <path
            d={path}
            fill="none"
            stroke="#ec4899"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coordinates.map((point) => (
            <g key={`${point.date}-${point.x}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="white"
                stroke="#ec4899"
                strokeWidth="3"
              />

              <title>
                {formatDisplayDate(point.date)}: {point.label}
              </title>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between text-xs text-gray-400 px-8">
        {points
          .filter(
            (_, index) =>
              index === 0 ||
              index === Math.floor(points.length / 2) ||
              index === points.length - 1,
          )
          .map((point) => (
            <span key={point.date}>{formatDisplayDate(point.date)}</span>
          ))}
      </div>
    </div>
  );
}

/* =========================================================
   DAILY TIMELINE
========================================================= */

function DailyTimeline({
  reports,
  attendance,
}: {
  reports: DailyReport[];
  attendance: AttendanceRecord[];
}) {
  const dates = Array.from(
    new Set([
      ...reports.map((report) => report.report_date),
      ...attendance.map((record) => record.attendance_date),
    ]),
  ).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-10 text-center text-gray-500">
        No daily records available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
      <div className="px-5 md:px-7 py-5 border-b border-gray-100">
        <h3 className="font-bold text-[#30435b]">Daily Record</h3>

        <p className="text-sm text-gray-500 mt-1">
          A day-by-day view of attendance and daily reports.
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {dates.map((date) => {
          const report = reports.find((item) => item.report_date === date);

          const attendanceRecord = attendance.find(
            (item) => item.attendance_date === date,
          );

          return (
            <div key={date} className="p-5 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                <div className="lg:w-32 shrink-0">
                  <p className="font-bold text-[#30435b]">
                    {formatDisplayDate(date)}
                  </p>

                  {attendanceRecord && (
                    <span
                      className={`inline-flex mt-2 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        attendanceRecord.status === "present"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {attendanceRecord.status === "present"
                        ? "✓ Present"
                        : "Absent"}
                    </span>
                  )}
                </div>

                {report ? (
                  <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <StatusPill
                        label="Mood"
                        value={labelValue(report.mood)}
                        type={getMoodType(report.mood)}
                        icon={moodEmoji(report.mood)}
                      />

                      <StatusPill
                        label="Snack"
                        value={labelValue(report.morning_snack)}
                        type={getMealType(report.morning_snack)}
                        icon={mealEmoji(report.morning_snack)}
                      />

                      <StatusPill
                        label="Lunch"
                        value={labelValue(report.lunch)}
                        type={getMealType(report.lunch)}
                        icon={mealEmoji(report.lunch)}
                      />

                      <StatusPill
                        label="Participation"
                        value={labelValue(report.participation)}
                        type={getParticipationType(report.participation)}
                        icon="✓"
                      />
                    </div>

                    {report.rest_status && (
                      <StatusPill
                        label="Rest"
                        value={labelValue(report.rest_status)}
                        type={getRestType(report.rest_status)}
                        icon={restEmoji(report.rest_status)}
                        fullWidth
                      />
                    )}

                    {report.activity_names &&
                      report.activity_names.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {report.activity_names.map((activity) => (
                            <span
                              key={activity}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      )}

                    {report.teacher_observation && (
                      <div className="mt-4 p-4 rounded-2xl bg-gray-50">
                        <p className="text-xs uppercase tracking-wide font-bold text-gray-400 mb-1">
                          Teacher Observation
                        </p>

                        <p className="text-sm text-[#30435b] leading-relaxed">
                          {report.teacher_observation}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 text-sm text-gray-400 bg-gray-50 rounded-2xl p-4">
                    No daily report recorded for this date.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   DAILY REPORTS
========================================================= */

function DailyReportsSection({
  reports,
  startDate,
  endDate,
}: {
  reports: DailyReport[];
  startDate: string;
  endDate: string;
}) {
  const filtered = reports
    .filter(
      (report) =>
        report.report_date >= startDate && report.report_date <= endDate,
    )
    .sort((a, b) => b.report_date.localeCompare(a.report_date));

  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
      <div className="px-5 md:px-7 py-5 border-b border-gray-100">
        <h3 className="font-bold text-[#30435b]">Daily Reports</h3>

        <p className="text-sm text-gray-500 mt-1">
          Complete daily records for this child.
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          No daily reports recorded during this period.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filtered.map((report) => (
            <div key={report.id} className="p-5 md:p-7">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <p className="font-bold text-[#30435b]">
                    {formatDisplayDate(report.report_date)}
                  </p>

                  {report.teacher_name && (
                    <p className="text-xs text-gray-400 mt-1">
                      Recorded by {report.teacher_name}
                    </p>
                  )}
                </div>

                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    report.submitted
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {report.submitted ? "Submitted" : "Draft"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                <StatusReportBox
                  label="Mood"
                  value={labelValue(report.mood)}
                  type={getMoodType(report.mood)}
                />

                <StatusReportBox
                  label="Morning Snack"
                  value={labelValue(report.morning_snack)}
                  type={getMealType(report.morning_snack)}
                />

                <StatusReportBox
                  label="Lunch"
                  value={labelValue(report.lunch)}
                  type={getMealType(report.lunch)}
                />

                <StatusReportBox
                  label="Participation"
                  value={labelValue(report.participation)}
                  type={getParticipationType(report.participation)}
                />
              </div>

              <div className="mt-3">
                <StatusReportBox
                  label="Rest"
                  value={labelValue(report.rest_status)}
                  type={getRestType(report.rest_status)}
                />
              </div>

              {report.activity_names && report.activity_names.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide font-bold text-gray-400 mb-2">
                    Activities
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {report.activity_names.map((activity) => (
                      <span
                        key={activity}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {report.teacher_observation && (
                <div className="mt-4 bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-wide font-bold text-gray-400 mb-1">
                    Teacher Observation
                  </p>

                  <p className="text-sm text-[#30435b] leading-relaxed">
                    {report.teacher_observation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ATTENDANCE
========================================================= */

function AttendanceSection({
  records,
  startDate,
  endDate,
}: {
  records: AttendanceRecord[];
  startDate: string;
  endDate: string;
}) {
  const filtered = records
    .filter(
      (record) =>
        record.attendance_date >= startDate &&
        record.attendance_date <= endDate,
    )
    .sort((a, b) => b.attendance_date.localeCompare(a.attendance_date));

  const present = filtered.filter(
    (record) => record.status === "present",
  ).length;

  const absent = filtered.filter((record) => record.status === "absent").length;

  const percentage =
    filtered.length > 0 ? Math.round((present / filtered.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Records" value={filtered.length} icon="📋" />

        <SummaryCard label="Present" value={present} icon="✓" green />

        <SummaryCard
          label="Attendance Rate"
          value={`${percentage}%`}
          icon="%"
          purple
        />
      </div>

      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="px-5 md:px-7 py-5 border-b border-gray-100">
          <h3 className="font-bold text-[#30435b]">Attendance History</h3>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No attendance records during this period.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((record) => (
              <div
                key={record.id}
                className="px-5 md:px-7 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-[#30435b]">
                    {formatDisplayDate(record.attendance_date)}
                  </p>
                </div>

                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    record.status === "present"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {record.status === "present" ? "✓ Present" : "Absent"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   GRAPH COMPONENTS
========================================================= */

function HorizontalBars({
  data,
  emptyText,
}: {
  data: CountItem[];
  emptyText: string;
}) {
  if (data.length === 0) {
    return <EmptyChart text={emptyText} />;
  }

  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const percentage = (item.count / max) * 100;

        const colors = getValueColors(item.label);

        return (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${colors.badge}`}
                >
                  {getValueIcon(item.label)}
                </span>

                <span className="text-sm font-semibold text-[#30435b]">
                  {labelValue(item.label)}
                </span>
              </div>

              <span className={`text-sm font-bold ${colors.text}`}>
                {item.count}
              </span>
            </div>

            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${colors.bar}`}
                style={{
                  width: `${Math.max(8, percentage)}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   STATUS COLORS
========================================================= */

function getValueColors(label: string) {
  const value = label.toLowerCase();

  /* GREEN — positive */
  if (
    [
      "happy",
      "good",
      "finished",
      "slept",
      "rested",
      "participated",
      "present",
    ].includes(value)
  ) {
    return {
      badge: "bg-green-100 text-green-700",
      bar: "bg-green-500",
      text: "text-green-600",
    };
  }

  /* RED — negative */
  if (
    [
      "tired",
      "did_not_eat",
      "did_not_rest",
      "not_participated",
      "absent",
    ].includes(value)
  ) {
    return {
      badge: "bg-red-100 text-red-700",
      bar: "bg-red-500",
      text: "text-red-600",
    };
  }

  /* AMBER — partial / neutral */
  if (["partial", "partly", "normal"].includes(value)) {
    return {
      badge: "bg-amber-100 text-amber-700",
      bar: "bg-amber-500",
      text: "text-amber-600",
    };
  }

  /* BLUE — activities / other */
  return {
    badge: "bg-blue-100 text-blue-700",
    bar: "bg-blue-500",
    text: "text-blue-600",
  };
}

function getValueIcon(label: string) {
  const value = label.toLowerCase();

  switch (value) {
    case "happy":
      return "😊";

    case "good":
      return "🙂";

    case "normal":
      return "😐";

    case "tired":
      return "😴";

    case "finished":
      return "✓";

    case "partial":
    case "partly":
      return "~";

    case "did_not_eat":
      return "×";

    case "slept":
      return "😴";

    case "rested":
      return "✓";

    case "did_not_rest":
      return "×";

    case "participated":
      return "✓";

    case "not_participated":
      return "×";

    case "absent":
      return "×";

    case "present":
      return "✓";

    default:
      return "•";
  }
}

/* =========================================================
   STATUS HELPERS
========================================================= */

type StatusType = "positive" | "negative" | "partial" | "neutral";

function getMealType(value?: string): StatusType {
  if (value === "finished") {
    return "positive";
  }

  if (value === "did_not_eat") {
    return "negative";
  }

  if (value === "partial") {
    return "partial";
  }

  return "neutral";
}

function getMoodType(value?: string): StatusType {
  if (value === "happy" || value === "good") {
    return "positive";
  }

  if (value === "tired") {
    return "negative";
  }

  if (value === "normal") {
    return "neutral";
  }

  return "neutral";
}

function getRestType(value?: string): StatusType {
  if (value === "slept" || value === "rested") {
    return "positive";
  }

  if (value === "did_not_rest") {
    return "negative";
  }

  return "neutral";
}

function getParticipationType(value?: string): StatusType {
  if (value === "participated") {
    return "positive";
  }

  if (value === "not_participated") {
    return "negative";
  }

  if (value === "partial") {
    return "partial";
  }

  return "neutral";
}

/* =========================================================
   STATUS PILLS
========================================================= */

function StatusPill({
  label,
  value,
  type,
  icon,
  fullWidth = false,
}: {
  label: string;
  value: string;
  type: StatusType;
  icon: string;
  fullWidth?: boolean;
}) {
  const colors = getStatusClasses(type);

  return (
    <div
      className={`mt-3 rounded-2xl p-4 ${colors.background} ${
        fullWidth ? "w-full" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${colors.icon}`}
        >
          {icon}
        </div>

        <div>
          <p
            className={`text-[10px] uppercase tracking-wide font-bold ${colors.label}`}
          >
            {label}
          </p>

          <p className={`text-sm font-bold mt-0.5 ${colors.text}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusReportBox({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type: StatusType;
}) {
  const colors = getStatusClasses(type);

  return (
    <div className={`rounded-2xl p-4 border ${colors.border}`}>
      <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
        {label}
      </p>

      <p className={`text-sm font-semibold mt-1 ${colors.text}`}>{value}</p>
    </div>
  );
}

function getStatusClasses(type: StatusType) {
  switch (type) {
    case "positive":
      return {
        background: "bg-green-50",
        border: "border-green-100",
        icon: "bg-green-100 text-green-700",
        label: "text-green-600",
        text: "text-green-700",
      };

    case "negative":
      return {
        background: "bg-red-50",
        border: "border-red-100",
        icon: "bg-red-100 text-red-700",
        label: "text-red-600",
        text: "text-red-700",
      };

    case "partial":
      return {
        background: "bg-amber-50",
        border: "border-amber-100",
        icon: "bg-amber-100 text-amber-700",
        label: "text-amber-600",
        text: "text-amber-700",
      };

    default:
      return {
        background: "bg-gray-50",
        border: "border-gray-100",
        icon: "bg-gray-100 text-gray-600",
        label: "text-gray-500",
        text: "text-gray-700",
      };
  }
}

/* =========================================================
   OTHER COMPONENTS
========================================================= */

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
      <div className="px-5 md:px-7 py-5 border-b border-gray-100">
        <h3 className="font-bold text-[#30435b]">{title}</h3>

        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      <div className="p-5 md:p-7">{children}</div>
    </div>
  );
}

function SummaryCard({
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
      <div className="flex items-center justify-between gap-3">
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

function SmallInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3 min-w-[110px]">
      <p className="text-[10px] uppercase tracking-wide font-bold text-gray-400">
        {label}
      </p>

      <p className="font-semibold text-[#30435b] mt-1 text-sm">{value}</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
        active
          ? "bg-pink-100 text-pink-700"
          : "bg-gray-50 text-gray-500 hover:bg-pink-50 hover:text-pink-700"
      }`}
    >
      {children}
    </button>
  );
}

function SectionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 rounded-xl text-sm font-semibold transition ${
        active
          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm"
          : "text-gray-500 hover:bg-pink-50 hover:text-pink-700"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-48 flex flex-col items-center justify-center text-center">
      <div className="text-4xl mb-3">📊</div>

      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}

/* =========================================================
   DATA HELPERS
========================================================= */

function countValues(values: (string | undefined)[]): CountItem[] {
  const counts: Record<string, number> = {};

  values.forEach((value) => {
    if (!value) return;

    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

function countActivities(reports: DailyReport[]): CountItem[] {
  const counts: Record<string, number> = {};

  reports.forEach((report) => {
    report.activity_names?.forEach((activity) => {
      counts[activity] = (counts[activity] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

function moodScore(mood?: string): number {
  switch (mood) {
    case "happy":
      return 4;

    case "good":
      return 3;

    case "normal":
      return 2;

    case "tired":
      return 1;

    default:
      return 0;
  }
}

function moodLabel(value: number) {
  switch (value) {
    case 4:
      return "Happy";

    case 3:
      return "Good";

    case 2:
      return "Normal";

    case 1:
      return "Tired";

    default:
      return "";
  }
}

function moodEmoji(value?: string) {
  switch (value) {
    case "happy":
      return "😊";

    case "good":
      return "🙂";

    case "normal":
      return "😐";

    case "tired":
      return "😴";

    default:
      return "—";
  }
}

function mealEmoji(value?: string) {
  switch (value) {
    case "finished":
      return "✓";

    case "partial":
      return "~";

    case "did_not_eat":
      return "×";

    default:
      return "—";
  }
}

function restEmoji(value?: string) {
  switch (value) {
    case "slept":
      return "😴";

    case "rested":
      return "✓";

    case "did_not_rest":
      return "×";

    default:
      return "—";
  }
}
