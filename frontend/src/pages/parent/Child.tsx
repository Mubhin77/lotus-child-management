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

interface Classroom {
  id: number;
  name: string;
  academic_year: string;
}

export default function ParentChild() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const response = await api.get("/children/");
        const childData: Child[] = response.data;

        setChildren(childData);

        if (childData.length > 0) {
          setSelectedChildId(childData[0].id);
        }
      } catch (error) {
        console.error("Failed to load children:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, []);

  useEffect(() => {
    const loadClassroom = async () => {
      if (!selectedChildId) {
        setClassroom(null);
        return;
      }

      const selectedChild = children.find(
        (child) => child.id === selectedChildId,
      );

      if (!selectedChild?.classroom) {
        setClassroom(null);
        return;
      }

      try {
        const response = await api.get(`/classes/${selectedChild.classroom}/`);

        setClassroom(response.data);
      } catch (error) {
        console.error("Failed to load classroom:", error);
        setClassroom(null);
      }
    };

    loadClassroom();
  }, [selectedChildId, children]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading child information...</p>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800">My Child</h1>

        <div className="bg-white rounded-2xl border border-pink-100 p-6 mt-6">
          <p className="text-gray-500">
            No child has been assigned to your account yet.
          </p>
        </div>
      </div>
    );
  }

  const child = children.find((item) => item.id === selectedChildId);

  if (!child) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Child</h1>

        <p className="text-gray-500 mt-1">
          View your child's school information.
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
            onChange={(e) => setSelectedChildId(Number(e.target.value))}
            className="w-full md:w-80 border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
          >
            {children.map((item) => (
              <option key={item.id} value={item.id}>
                {item.first_name} {item.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Child Profile */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-8">
        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
          <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center text-3xl">
            👧
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {child.first_name} {child.last_name}
            </h2>

            <p className="text-gray-500 mt-1">
              {child.is_active ? "Active Student" : "Inactive Student"}
            </p>
          </div>
        </div>

        {/* Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>

            <p className="font-semibold text-gray-800 mt-1">
              {child.date_of_birth || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Roll Number</p>

            <p className="font-semibold text-gray-800 mt-1">
              {child.roll_number || "Not assigned"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Class</p>

            <p className="font-semibold text-gray-800 mt-1">
              {classroom?.name || "Not assigned"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Academic Year</p>

            <p className="font-semibold text-gray-800 mt-1">
              {classroom?.academic_year || "Not available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
