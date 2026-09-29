import { useEffect, useState } from "react";
import api from "../../services/api";

interface Notice {
  id: number;
  title: string;
  content: string;
  notice_date: string;
  event_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NoticeForm {
  title: string;
  content: string;
  notice_date: string;
  event_date: string;
  is_active: boolean;
}

const emptyForm: NoticeForm = {
  title: "",
  content: "",
  notice_date: new Date().toISOString().split("T")[0],
  event_date: "",
  is_active: true,
};

function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] =
    useState<Notice | null>(null);

  const [form, setForm] = useState<NoticeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);

      const response = await api.get<Notice[]>("/notices/");

      setNotices(response.data);
    } catch (error) {
      console.error("Failed to load notices:", error);
      setError("Failed to load notices.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingNotice(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);

    setForm({
      title: notice.title,
      content: notice.content,
      notice_date: notice.notice_date,
      event_date: notice.event_date || "",
      is_active: notice.is_active,
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingNotice(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("Notice title is required.");
      return;
    }

    if (!form.content.trim()) {
      setError("Notice content is required.");
      return;
    }

    if (!form.notice_date) {
      setError("Notice date is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        notice_date: form.notice_date,
        event_date: form.event_date || null,
        is_active: form.is_active,
      };

      if (editingNotice) {
        await api.put(
          `/notices/${editingNotice.id}/`,
          payload
        );
      } else {
        await api.post("/notices/", payload);
      }

      await loadNotices();
      closeModal();
    } catch (error: any) {
      console.error("Failed to save notice:", error);

      const detail =
        error?.response?.data?.detail ||
        "Failed to save notice.";

      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  const toggleNotice = async (notice: Notice) => {
    try {
      await api.patch(`/notices/${notice.id}/`, {
        is_active: !notice.is_active,
      });

      await loadNotices();
    } catch (error) {
      console.error("Failed to update notice:", error);
    }
  };

  const deleteNotice = async (notice: Notice) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${notice.title}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/notices/${notice.id}/`);

      await loadNotices();
    } catch (error) {
      console.error("Failed to delete notice:", error);
      setError("Failed to delete notice.");
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Notices
          </h1>

          <p className="mt-2 text-gray-500">
            Create and manage school announcements.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="rounded-lg bg-pink-600 px-5 py-2.5 font-medium text-white hover:bg-pink-700 transition"
        >
          + Create Notice
        </button>

      </div>

      {/* Error */}
      {error && !showModal && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Notices */}
      <div className="rounded-2xl bg-white border border-pink-100 shadow-sm overflow-hidden">

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading notices...
          </div>
        ) : notices.length === 0 ? (
          <div className="p-12 text-center">

            <h3 className="text-lg font-semibold text-gray-700">
              No notices yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Create your first school notice.
            </p>

            <button
              onClick={openCreateModal}
              className="mt-5 rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-pink-700"
            >
              Create Notice
            </button>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Notice
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Notice Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Event Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {notices.map((notice) => (
                  <tr
                    key={notice.id}
                    className="hover:bg-pink-50/40"
                  >

                    <td className="px-6 py-5">
                      <div className="max-w-md">

                        <p className="font-semibold text-gray-800">
                          {notice.title}
                        </p>

                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {notice.content}
                        </p>

                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-700">
                      {formatDate(notice.notice_date)}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-700">
                      {formatDate(notice.event_date)}
                    </td>

                    <td className="px-6 py-5">

                      {notice.is_active ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          Inactive
                        </span>
                      )}

                    </td>

                    <td className="px-6 py-5">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            openEditModal(notice)
                          }
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            toggleNotice(notice)
                          }
                          className="rounded-lg border border-pink-200 px-3 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50"
                        >
                          {notice.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          onClick={() =>
                            deleteNotice(notice)
                          }
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingNotice
                    ? "Edit Notice"
                    : "Create Notice"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingNotice
                    ? "Update this school announcement."
                    : "Create a new school announcement."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>

            </div>

            {/* Form */}
            <div className="space-y-5 p-6">

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Notice Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Krishna Janmashtami Activity"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              {/* Content */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Notice Content
                </label>

                <textarea
                  rows={5}
                  value={form.content}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      content: e.target.value,
                    })
                  }
                  placeholder="Write the announcement here..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Notice Date
                  </label>

                  <input
                    type="date"
                    value={form.notice_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notice_date: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Event Date
                    <span className="ml-1 text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        event_date: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  />
                </div>

              </div>

              {/* Active */}
              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_active: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />

                <span className="text-sm text-gray-700">
                  Make this notice active
                </span>

              </label>

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t px-6 py-4">

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingNotice
                    ? "Update Notice"
                    : "Create Notice"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Notices;