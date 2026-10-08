import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  roll_number: number | null;
  parents: number[];
  classroom: number | null;
  is_active: boolean;
}

interface Classroom {
  id: number;
  name: string;
  academic_year: string;
}

// interface Parent {
//   id: number;
//   user: number;
//   phone: string;
//   address: string;
// }
interface Parent {
  id: number;
  user: number;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  address: string;
}
// interface User {
//   id: number;
//   first_name: string;
//   last_name: string;
//   username: string;
// }

interface ChildForm {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  roll_number: string;
  classroom: string;
  parent: string;
}

const emptyForm: ChildForm = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  roll_number: "",
  classroom: "",
  parent: "",
};

function Children() {
  const [children, setChildren] = useState<Child[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  const [form, setForm] = useState<ChildForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [childrenResponse, classesResponse, parentsResponse] =
        await Promise.all([
          api.get("/children/"),
          api.get("/classes/"),
          api.get("/parents/"),
        ]);

      setChildren(childrenResponse.data);
      setClasses(classesResponse.data);
      setParents(parentsResponse.data);

      // Parent currently stores the Django User ID.
      // Load users so we can display parent names.
      //   const usersResponse = await api.get("/parents/");

      //   const parentUserIds = usersResponse.data.map(
      //     (parent: Parent) => parent.user
      //   );

      //   if (parentUserIds.length > 0) {
      //     const userResponses = await Promise.all(
      //       parentUserIds.map((id: number) =>
      //         api.get(`/users/${id}/`).catch(() => null)
      //       )
      //     );

      //     setUsers(
      //       userResponses
      //         .filter(Boolean)
      //         .map((response) => response!.data)
      //     );
      //   } else {
      //     setUsers([]);
      //   }
    } catch (err) {
      console.error(err);
      setError("Failed to load children data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const fullName = `${child.first_name} ${child.last_name}`.toLowerCase();

      const matchesSearch = fullName.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && child.is_active) ||
        (statusFilter === "inactive" && !child.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [children, search, statusFilter]);

  const getClassName = (classroomId: number | null) => {
    const classroom = classes.find((item) => item.id === classroomId);

    if (!classroom) return "Not assigned";

    return `${classroom.name} - ${classroom.academic_year}`;
  };

  const getParentName = (parentId: number) => {
    const parent = parents.find((item) => item.id === parentId);

    if (!parent) return "Unknown parent";

    return `${parent.first_name} ${parent.last_name}`.trim() || parent.username;
  };

  const openAddForm = () => {
    setEditingChild(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (child: Child) => {
    setEditingChild(child);

    setForm({
      first_name: child.first_name,
      last_name: child.last_name,
      date_of_birth: child.date_of_birth,
      roll_number: child.roll_number !== null ? String(child.roll_number) : "",
      classroom: child.classroom !== null ? String(child.classroom) : "",
      parent: child.parents.length > 0 ? String(child.parents[0]) : "",
    });

    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth,
        roll_number: form.roll_number ? Number(form.roll_number) : null,
        classroom: form.classroom ? Number(form.classroom) : null,
        parents: form.parent ? [Number(form.parent)] : [],
        is_active: editingChild ? editingChild.is_active : true,
      };

      if (editingChild) {
        await api.put(`/children/${editingChild.id}/`, payload);
      } else {
        await api.post("/children/", payload);
      }

      setShowForm(false);
      setEditingChild(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Failed to save child. Please check the information.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (child: Child) => {
    try {
      await api.patch(`/children/${child.id}/`, {
        is_active: !child.is_active,
      });

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Failed to update child status.");
    }
  };

  return (
    // <div className="min-h-screen p-8">
    <div className="w-full space-y-6">
      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Children</h1>

          <p className="mt-1 text-gray-500">
            Manage children enrolled at Lotus Montessori.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 font-semibold text-white shadow-md transition hover:opacity-90"
        >
          + Add Child
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
            placeholder="Search children..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
          >
            <option value="all">All Children</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Child
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Class
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Roll No.
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Parent
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
                    Loading children...
                  </td>
                </tr>
              ) : filteredChildren.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No children found.
                  </td>
                </tr>
              ) : (
                filteredChildren.map((child) => (
                  <tr key={child.id} className="transition hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                          {child.first_name.charAt(0)}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800">
                            {child.first_name} {child.last_name}
                          </p>

                          <p className="text-xs text-gray-400">
                            DOB: {child.date_of_birth}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getClassName(child.classroom)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {child.roll_number ?? "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {child.parents.length > 0
                        ? getParentName(child.parents[0])
                        : "Not assigned"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          child.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {child.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(child)}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => toggleStatus(child)}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                          {child.is_active ? "Deactivate" : "Activate"}
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

      {/* Add/Edit Modal */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingChild ? "Edit Child" : "Add Child"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the child's information below.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-full px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    First Name
                  </label>

                  <input
                    required
                    value={form.first_name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        first_name: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Last Name
                  </label>

                  <input
                    required
                    value={form.last_name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        last_name: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>

                  <input
                    required
                    type="date"
                    value={form.date_of_birth}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        date_of_birth: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Roll Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.roll_number}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        roll_number: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Class
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
                  <option value="">Select class</option>

                  {classes.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name} - {classroom.academic_year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Parent
                </label>

                <select
                  value={form.parent}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      parent: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="">Select parent</option>

                  {parents.map((parent) => (
                    <option
                        key={parent.id}
                        value={parent.id}
                    >
                        {`${parent.first_name} ${parent.last_name}`.trim() ||
                        parent.username}
                    </option>
                    ))}
                </select>
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
                    : editingChild
                      ? "Save Changes"
                      : "Add Child"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Children;
