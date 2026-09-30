import { useEffect, useState } from "react";
import api from "../../services/api";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
}

interface DailyReport {
  id: number;
  child: number;
  report_date: string;
  attendance_present: boolean;
  arrival_time: string | null;
  departure_time: string | null;
  submitted: boolean;
}

export default function ParentAttendance() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const [childrenResponse, reportsResponse] = await Promise.all([
          api.get("/children/"),
          api.get("/daily-reports/"),
        ]);

        const childData: Child[] = childrenResponse.data;
        const reportData: DailyReport[] = reportsResponse.data;

        setChildren(childData);
        setReports(reportData);

        if (childData.length > 0) {
          setSelectedChildId(childData[0].id);
        }
      } catch (error) {
        console.error("Failed to load attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">
          Loading attendance...
        </p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Attendance
        </h1>

        <div className="bg-white rounded-2xl border border-pink-100 p-8 mt-6">
          <p className="text-gray-500">
            No child has been assigned to your account yet.
          </p>
        </div>
      </div>
    );
  }

  const selectedChild = children.find(
    (child) => child.id === selectedChildId
  );

  const childReports = reports.filter(
    (report) => report.child === selectedChildId
  );

  const presentDays = childReports.filter(
    (report) => report.attendance_present
  ).length;

  const absentDays = childReports.filter(
    (report) => !report.attendance_present
  ).length;

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Attendance
        </h1>

        <p className="text-gray-500 mt-1">
          View your child's attendance records.
        </p>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div className="bg-white rounded-2xl border border-pink-100 p-5 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Child
          </label>

          <select
            value={selectedChildId ?? ""}
            onChange={(e) =>
              setSelectedChildId(Number(e.target.value))
            }
            className="w-full md:w-80 border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Child */}
      {selectedChild && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedChild.first_name} {selectedChild.last_name}
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Attendance records
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

        <div className="bg-white rounded-2xl border border-pink-100 p-6">
          <p className="text-sm text-gray-500">
            Present Days
          </p>

          <p className="text-3xl font-bold text-green-600 mt-2">
            {presentDays}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 p-6">
          <p className="text-sm text-gray-500">
            Absent Days
          </p>

          <p className="text-3xl font-bold text-red-600 mt-2">
            {absentDays}
          </p>
        </div>

      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">

        {childReports.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No attendance records are available for this child yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-pink-50 border-b border-pink-100">
                <tr>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Arrival
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Departure
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {childReports.map((report) => (

                  <tr
                    key={report.id}
                    className="hover:bg-pink-50/50 transition"
                  >

                    <td className="px-6 py-4 text-gray-800">
                      {report.report_date}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          report.attendance_present
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {report.attendance_present
                          ? "Present"
                          : "Absent"}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {report.arrival_time || "-"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {report.departure_time || "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}