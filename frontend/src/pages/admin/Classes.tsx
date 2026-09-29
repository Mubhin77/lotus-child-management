import { useEffect, useState } from "react";
import api from "../../services/api";

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
}

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  classroom: number | null;
}

interface Classroom {
  id: number;
  name: string;
  academic_year: string;
  teachers: number[];
}

interface FormData {
  name: string;
  academic_year: string;
  teachers: string[];
}

function Classes() {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [children, setChildren] = useState<Child[]>([]);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormData>({
    name: "",
    academic_year: "",
    teachers: [],
  });

  const loadData = async () => {
    try {
      const [classResponse, teacherResponse, childResponse] =
        await Promise.all([
          api.get("/classes/"),
          api.get("/teachers/"),
          api.get("/children/"),
        ]);

      setClasses(classResponse.data);
      setTeachers(teacherResponse.data);
      setChildren(childResponse.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load class information.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingClass(null);
    setForm({
      name: "",
      academic_year: "",
      teachers: [],
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (classroom: Classroom) => {
    setEditingClass(classroom);

    setForm({
      name: classroom.name,
      academic_year: classroom.academic_year,
      teachers: classroom.teachers.map(String),
    });

    setError("");
    setShowModal(true);
  };

  const handleTeacherChange = (teacherId: string) => {
    setForm((previous) => {
      const exists = previous.teachers.includes(teacherId);

      return {
        ...previous,
        teachers: exists
          ? previous.teachers.filter((id) => id !== teacherId)
          : [...previous.teachers, teacherId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.academic_year.trim()) {
      setError("Class name and academic year are required.");
      return;
    }

    try {
      const payload = {
        name: form.name,
        academic_year: form.academic_year,
        teachers: form.teachers.map(Number),
      };

      if (editingClass) {
        await api.put(`/classes/${editingClass.id}/`, payload);
      } else {
        await api.post("/classes/", payload);
      }

      setShowModal(false);
      await loadData();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Failed to save class."
      );
    }
  };

  const filteredClasses = classes.filter((classroom) => {
    const searchText = search.toLowerCase();

    return (
      classroom.name.toLowerCase().includes(searchText) ||
      classroom.academic_year.toLowerCase().includes(searchText)
    );
  });

  const getTeacherNames = (teacherIds: number[]) => {
    const names = teachers
      .filter((teacher) => teacherIds.includes(teacher.id))
      .map(
        (teacher) =>
          `${teacher.first_name} ${teacher.last_name}`.trim()
      );

    return names.length > 0 ? names.join(", ") : "No teacher assigned";
  };

  const getChildCount = (classId: number) => {
    return children.filter(
      (child) => child.classroom === classId
    ).length;
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Classes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage classrooms and teacher assignments.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          + Add Class
        </button>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
        />
      </div>

      {error && !showModal && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Classes */}
      <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-pink-50 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Class
                </th>

                <th className="px-6 py-4 font-semibold">
                  Academic Year
                </th>

                <th className="px-6 py-4 font-semibold">
                  Teachers
                </th>

                <th className="px-6 py-4 font-semibold">
                  Children
                </th>

                <th className="px-6 py-4 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredClasses.map((classroom) => (
                <tr
                  key={classroom.id}
                  className="transition hover:bg-pink-50/40"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">
                      {classroom.name}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {classroom.academic_year}
                  </td>

                  <td className="max-w-xs px-6 py-4 text-gray-600">
                    {getTeacherNames(classroom.teachers)}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                      {getChildCount(classroom.id)} children
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditModal(classroom)}
                      className="rounded-lg border border-pink-200 px-4 py-2 text-xs font-semibold text-pink-600 hover:bg-pink-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {filteredClasses.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingClass ? "Edit Class" : "Add Class"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {editingClass
                  ? "Update classroom information."
                  : "Create a new classroom."}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Class Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Montessori 1"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Academic Year
                </label>

                <input
                  type="text"
                  value={form.academic_year}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      academic_year: e.target.value,
                    })
                  }
                  placeholder="e.g. 2083"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Assign Teachers
                </label>

                <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3">
                  {teachers.map((teacher) => (
                    <label
                      key={teacher.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-pink-50"
                    >
                      <input
                        type="checkbox"
                        checked={form.teachers.includes(
                          String(teacher.id)
                        )}
                        onChange={() =>
                          handleTeacherChange(
                            String(teacher.id)
                          )
                        }
                        className="h-4 w-4 accent-pink-500"
                      />

                      <span className="text-sm text-gray-700">
                        {teacher.first_name}{" "}
                        {teacher.last_name}
                      </span>
                    </label>
                  ))}

                  {teachers.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No teachers available.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  {editingClass
                    ? "Save Changes"
                    : "Create Class"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Classes;