import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function TeacherChildren() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);

      const response = await api.get("/children/");

      setChildren(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load children.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          My Children
        </h1>

        <p className="text-gray-500 mt-2">
          View the children assigned to your class.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-pink-100 p-8 text-center">
          <p className="text-gray-500">
            Loading children...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && children.length === 0 && (
        <div className="bg-white rounded-2xl border border-pink-100 p-10 text-center">
          <div className="text-4xl mb-4">
            👧
          </div>

          <h2 className="text-lg font-semibold text-gray-700">
            No children assigned
          </h2>

          <p className="text-gray-500 mt-2">
            There are currently no children assigned to your class.
          </p>
        </div>
      )}

      {/* Children */}
      {!loading && !error && children.length > 0 && (
        <>
          <div className="mb-5">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-pink-100 text-pink-700 font-medium">
              {children.length}{" "}
              {children.length === 1 ? "Child" : "Children"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {children.map((child) => (
              <div
                key={child.id}
                className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm"
              >

                {/* Child Icon */}
                <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center text-2xl mb-5">
                  👧
                </div>

                {/* Name */}
                <h2 className="text-xl font-semibold text-gray-800">
                  {child.first_name} {child.last_name}
                </h2>

                {/* Information */}
                <div className="mt-4 space-y-2 text-sm">

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Roll Number
                    </span>

                    <span className="font-medium text-gray-700">
                      {child.roll_number || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Date of Birth
                    </span>

                    <span className="font-medium text-gray-700">
                      {child.date_of_birth || "—"}
                    </span>
                  </div>

                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">

                  <Link
                    to={`/teacher/reports/${child.id}`}
                    className="flex-1 text-center px-4 py-2.5 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
                  >
                    Daily Report
                  </Link>

                  <Link
                    to={`/teacher/reports?search=${encodeURIComponent(
                      `${child.first_name} ${child.last_name}`
                    )}`}
                    className="px-4 py-2.5 rounded-xl border border-pink-200 text-pink-600 font-medium hover:bg-pink-50 transition"
                  >
                    Reports
                  </Link>

                </div>

              </div>
            ))}

          </div>
        </>
      )}

    </div>
  );
}