import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  roll_number: number | null;
  classroom: number | null;
  is_active: boolean;
}

interface DailyReport {
  id: number;
  child: number;
  report_date: string;
  submitted: boolean;
}

function TeacherDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [childrenResponse, reportsResponse] = await Promise.all([
        api.get<Child[]>("/children/"),
        api.get<DailyReport[]>(`/daily-reports/?date=${today}`),
      ]);

      setChildren(childrenResponse.data);
      setReports(reportsResponse.data);
    } catch (error) {
      console.error("Failed to load teacher dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeChildren = children.filter(
    (child) => child.is_active
  );

  const submittedReports = reports.filter(
    (report) => report.submitted
  );

  const pendingReports = activeChildren.filter(
    (child) =>
      !reports.some(
        (report) =>
          report.child === child.id &&
          report.submitted
      )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Teacher Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your children and their daily reports.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-pink-100">
          <p className="text-sm font-medium text-gray-500">
            My Children
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {activeChildren.length}
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Active children assigned to you
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-pink-100">
          <p className="text-sm font-medium text-gray-500">
            Today's Reports
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {submittedReports.length}
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Reports submitted today
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-pink-100">
          <p className="text-sm font-medium text-gray-500">
            Pending Reports
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {pendingReports.length}
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Reports still to be submitted
          </p>
        </div>

      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <Link
            to="/teacher/reports"
            className="rounded-2xl bg-pink-50 border border-pink-100 p-5 hover:bg-pink-100 transition"
          >
            <h3 className="font-semibold text-gray-800">
              My Children
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              View children assigned to your class.
            </p>
          </Link>

          <Link
            to="/teacher/reports"
            className="rounded-2xl bg-purple-50 border border-purple-100 p-5 hover:bg-purple-100 transition"
          >
            <h3 className="font-semibold text-gray-800">
              Daily Reports
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Create and manage children's daily reports.
            </p>
          </Link>

          <Link
            to="/teacher"
            className="rounded-2xl bg-blue-50 border border-blue-100 p-5 hover:bg-blue-100 transition"
          >
            <h3 className="font-semibold text-gray-800">
              Previous Reports
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Review reports submitted previously.
            </p>
          </Link>

        </div>
      </div>

      {/* Children */}
      <div className="rounded-2xl bg-white border border-pink-100 shadow-sm">

        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              My Children
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Children currently assigned to you
            </p>
          </div>

          <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700">
            {activeChildren.length} Children
          </span>
        </div>

        <div className="divide-y">

          {activeChildren.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No children are currently assigned to you.
            </div>
          ) : (
            activeChildren.map((child) => {

              const report = reports.find(
                (item) => item.child === child.id
              );

              return (
                <div
                  key={child.id}
                  className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                >

                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {child.first_name} {child.last_name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Roll No: {child.roll_number ?? "—"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">

                    {report?.submitted ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                        Submitted
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                        Pending
                      </span>
                    )}

                    <Link
                      to={`/teacher/reports/${child.id}`}
                      className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition"
                    >
                      Daily Report
                    </Link>

                  </div>

                </div>
              );
            })
          )}

        </div>

      </div>

    </div>
  );
}

export default TeacherDashboard;