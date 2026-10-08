import { useEffect, useState } from "react";
import api from "../../services/api";

interface Activity {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

const emptyForm = {
  name: "",
  description: "",
  is_active: true,
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchActivities = async () => {
    try {
      const response = await api.get("/activities/");
      setActivities(response.data);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const openAddModal = () => {
    setEditingActivity(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setForm({
      name: activity.name,
      description: activity.description || "",
      is_active: activity.is_active,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      setEditingActivity(null);
      setForm(emptyForm);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Activity name is required.");
      return;
    }

    setSaving(true);

    try {
      if (editingActivity) {
        await api.patch(`/activities/${editingActivity.id}/`, {
          name: form.name.trim(),
          description: form.description.trim(),
          is_active: form.is_active,
        });
      } else {
        await api.post("/activities/", {
          name: form.name.trim(),
          description: form.description.trim(),
          is_active: form.is_active,
        });
      }

      await fetchActivities();
      closeModal();
    } catch (error) {
      console.error("Failed to save activity:", error);
      alert("Failed to save activity. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActivity = async (activity: Activity) => {
    try {
      await api.patch(`/activities/${activity.id}/`, {
        is_active: !activity.is_active,
      });

      await fetchActivities();
    } catch (error) {
      console.error("Failed to update activity:", error);
      alert("Failed to update activity.");
    }
  };

  const deleteActivity = async (activity: Activity) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${activity.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/activities/${activity.id}/`);
      await fetchActivities();
    } catch (error) {
      console.error("Failed to delete activity:", error);
      alert("Failed to delete activity.");
    }
  };

  const activeCount = activities.filter(
    (activity) => activity.is_active
  ).length;

  const inactiveCount = activities.filter(
    (activity) => !activity.is_active
  ).length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Activities
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage activities available for daily child reports.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-lg bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-600 transition"
        >
          + Add Activity
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Activities</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {activities.length}
          </p>
        </div>

        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {activeCount}
          </p>
        </div>

        <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-500 mt-1">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Activities table */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No activities found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Description
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {activities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {activity.name}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {activity.description || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          activity.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {activity.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(activity)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => toggleActivity(activity)}
                          className={`rounded-lg px-3 py-1.5 text-sm ${
                            activity.is_active
                              ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {activity.is_active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => deleteActivity(activity)}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="border-b px-6 py-5">
              <h2 className="text-xl font-bold text-gray-800">
                {editingActivity ? "Edit Activity" : "Add Activity"}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {editingActivity
                  ? "Update the activity information."
                  : "Add an activity for teachers to use in daily reports."}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Name
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
                    placeholder="e.g. Storytelling"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description of the activity"
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_active: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm text-gray-700">
                    Activity is active
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-pink-500 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingActivity
                    ? "Update Activity"
                    : "Add Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}