import { useEffect, useState } from "react";
import api from "../../services/api";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  roll_number: string;
  classroom: number | null;
  is_active: boolean;
}

interface DailyReport {
  id: number;
  child: number;
  child_name: string;
  report_date: string;
  attendance_present: boolean;
  mood: string;
  participation: string;
  submitted: boolean;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  notice_date: string;
  event_date: string | null;
  is_active: boolean;
}

export default function ParentDashboard() {
  const [child, setChild] = useState<Child | null>(null);
  const [todayReport, setTodayReport] = useState<DailyReport | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [childrenResponse, reportsResponse, noticesResponse] =
          await Promise.all([
            api.get("/children/"),
            api.get(`/daily-reports/?date=${today}`),
            api.get("/notices/"),
          ]);

        const children = childrenResponse.data;

        setChild(children.length > 0 ? children[0] : null);

        const reports = reportsResponse.data;

        setTodayReport(reports.length > 0 ? reports[0] : null);

        setNotices(noticesResponse.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to load parent dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [today]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Parent Dashboard</h1>

        <p className="text-gray-500 mt-1">
          Welcome to your Lotus parent portal.
        </p>
      </div>

      {/* Child Summary */}
      {child ? (
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-2xl">
              👧
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {child.first_name} {child.last_name}
              </h2>

              <p className="text-gray-500 mt-1">
                Roll No: {child.roll_number || "Not assigned"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-pink-100 p-6 mb-6">
          <p className="text-gray-500">
            No child has been assigned to your account yet.
          </p>
        </div>
      )}

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-pink-100 p-6">
          <p className="text-sm text-gray-500">Today's Attendance</p>

          <p className="text-2xl font-bold text-gray-800 mt-2">
            {todayReport
              ? todayReport.attendance_present
                ? "Present"
                : "Absent"
              : "Not Recorded"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 p-6">
          <p className="text-sm text-gray-500">Today's Mood</p>

          <p className="text-2xl font-bold text-gray-800 mt-2 capitalize">
            {todayReport?.mood || "Not Recorded"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 p-6">
          <p className="text-sm text-gray-500">Report Status</p>

          <p className="text-2xl font-bold text-gray-800 mt-2">
            {todayReport
              ? todayReport.submitted
                ? "Submitted"
                : "Draft"
              : "Pending"}
          </p>
        </div>
      </div>

      {/* Recent Notices */}
      <div className="bg-white rounded-2xl border border-pink-100 p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Recent Notices</h2>

            <p className="text-sm text-gray-500 mt-1">
              Important updates from Lotus Montessori
            </p>
          </div>
        </div>

        {notices.length === 0 ? (
          <p className="text-gray-500">No notices available.</p>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="border border-pink-100 rounded-xl p-4"
              >
                <h3 className="font-semibold text-gray-800">{notice.title}</h3>

                <p className="text-sm text-gray-500 mt-1">
                  {notice.notice_date}
                </p>

                <p className="text-gray-600 mt-3 line-clamp-2">
                  {notice.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
