import { FormEvent, useEffect, useMemo, useState } from "react";
import api from "../../services/api";

interface Teacher {
  id: number;
  user: number;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  address: string;
  is_active: boolean;
}

interface Classroom {
  id: number;
  name: string;
  academic_year: string;
  teachers: number[];
}

interface TeacherForm {
  first_name: string;
  last_name: string;
  username: string;
  password: string;
  phone: string;
  address: string;
  classroom: string;
}

const emptyForm: TeacherForm = {
  first_name: "",
  last_name: "",
  username: "",
  password: "",
  phone: "",
  address: "",
  classroom: "",
};

function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] =
    useState<Teacher | null>(null);

  const [form, setForm] = useState<TeacherForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        teachersResponse,
        classesResponse,
      ] = await Promise.all([
        api.get("/teachers/"),
        api.get("/classes/"),
      ]);

      setTeachers(teachersResponse.data);
      setClasses(classesResponse.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load teacher data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const fullName =
        `${teacher.first_name} ${teacher.last_name}`.toLowerCase();

      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        teacher.username
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && teacher.is_active) ||
        (statusFilter === "inactive" && !teacher.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [teachers, search, statusFilter]);

  const getTeacherClasses = (teacherId: number) => {
    return classes
      .filter((classroom) =>
        classroom.teachers.includes(teacherId)
      )
      .map(
        (classroom) =>
          `${classroom.name} - ${classroom.academic_year}`
      )
      .join(", ");
  };

  const openAddForm = () => {
    setEditingTeacher(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (teacher: Teacher) => {
    const teacherClass = classes.find((classroom) =>
      classroom.teachers.includes(teacher.id)
    );

    setEditingTeacher(teacher);

    setForm({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      username: teacher.username,
      password: "",
      phone: teacher.phone,
      address: teacher.address,
      classroom: teacherClass
        ? String(teacherClass.id)
        : "",
    });

    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingTeacher) {
        await api.patch(
          `/teachers/${editingTeacher.id}/`,
          {
            phone: form.phone,
            address: form.address,
          }
        );

        if (form.classroom) {
          await api.patch(
            `/classes/${form.classroom}/`,
            {
              teachers: [editingTeacher.id],
            }
          );
        }
      } else {
        if (!form.password) {
          setError("Password is required when creating a teacher.");
          setSaving(false);
          return;
        }

        const response = await api.post(
          "/teachers/create-account/",
          {
            first_name: form.first_name,
            last_name: form.last_name,
            username: form.username,
            password: form.password,
            phone: form.phone,
            address: form.address,
          }
        );

        const teacherId = response.data.id;

        if (form.classroom) {
          await api.patch(
            `/classes/${form.classroom}/`,
            {
              teachers: [teacherId],
            }
          );
        }
      }

      setShowForm(false);
      setEditingTeacher(null);
      setForm(emptyForm);

      await loadData();
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.detail ||
        "Failed to save teacher.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (teacher: Teacher) => {
    try {
      await api.patch(`/teachers/${teacher.id}/`, {
        is_active: !teacher.is_active,
      });

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Failed to update teacher status.");
    }
  };

  return (
    <div className="min-h-screen p-8">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Teachers
          </h1>

          <p className="mt-1 text-gray-500">
            Manage teachers and their classroom assignments.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 font-semibold text-white shadow-md hover:opacity-90"
        >
          + Add Teacher
        </button>

      </div>

      {/* Error */}

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filters */}

      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-2">

          <input
            type="text"
            placeholder="Search teachers..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          >
            <option value="all">All Teachers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead className="border-b border-gray-100 bg-gray-50">

              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Teacher
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Username
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Phone
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Class
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading teachers...
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No teachers found.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 font-semibold text-pink-700">
                          {teacher.first_name.charAt(0)}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {teacher.first_name}{" "}
                            {teacher.last_name}
                          </p>

                          <p className="text-xs text-gray-400">
                            Teacher
                          </p>
                        </div>

                      </div>

                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {teacher.username}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {teacher.phone || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getTeacherClasses(teacher.id) ||
                        "Not assigned"}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          teacher.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {teacher.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            openEditForm(teacher)
                          }
                          className="rounded-lg px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            toggleStatus(teacher)
                          }
                          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                          {teacher.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Modal */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingTeacher
                    ? "Edit Teacher"
                    : "Add Teacher"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingTeacher
                    ? "Update teacher information."
                    : "Create a teacher account and profile."}
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-full px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    First Name
                  </label>

                  <input
                    required
                    disabled={!!editingTeacher}
                    value={form.first_name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        first_name: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Last Name
                  </label>

                  <input
                    disabled={!!editingTeacher}
                    value={form.last_name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        last_name: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
                  />
                </div>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Username
                  </label>

                  <input
                    required
                    disabled={!!editingTeacher}
                    value={form.username}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        username: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {editingTeacher
                      ? "New Password (not available yet)"
                      : "Password"}
                  </label>

                  <input
                    required={!editingTeacher}
                    disabled={!!editingTeacher}
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        password: event.target.value,
                      })
                    }
                    placeholder={
                      editingTeacher
                        ? "Password reset will be added later"
                        : "Create temporary password"
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
                  />
                </div>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone
                  </label>

                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        phone: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Assigned Class
                  </label>

                  <select
                    value={form.classroom}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        classroom: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="">
                      No class assigned
                    </option>

                    {classes.map((classroom) => (
                      <option
                        key={classroom.id}
                        value={classroom.id}
                      >
                        {classroom.name} -{" "}
                        {classroom.academic_year}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Address
                </label>

                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      address: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-md disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingTeacher
                    ? "Save Changes"
                    : "Create Teacher"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Teachers;