import { useEffect, useState } from "react";
import api from "../../services/api";

interface Notice {
  id: number;
  title: string;
  content: string;
  notice_date: string;
  event_date: string | null;
  is_active: boolean;
}

export default function TeacherNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);

      const response = await api.get("/notices/");

      setNotices(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load notices.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Notices
        </h1>

        <p className="text-gray-500 mt-2">
          View important announcements and upcoming school activities.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-pink-100 p-8 text-center">
          <p className="text-gray-500">
            Loading notices...
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
      {!loading && !error && notices.length === 0 && (
        <div className="bg-white rounded-2xl border border-pink-100 p-10 text-center">
          <div className="text-4xl mb-4">
            📢
          </div>

          <h2 className="text-lg font-semibold text-gray-700">
            No notices available
          </h2>

          <p className="text-gray-500 mt-2">
            There are currently no active school notices.
          </p>
        </div>
      )}

      {/* Notice Cards */}
      {!loading && !error && notices.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm"
            >

              {/* Icon + Title */}
              <div className="flex items-start gap-4">

                <div className="w-12 h-12 shrink-0 rounded-xl bg-pink-100 flex items-center justify-center text-xl">
                  📢
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {notice.title}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Posted on {formatDate(notice.notice_date)}
                  </p>
                </div>

              </div>

              {/* Content Preview */}
              <p className="text-gray-600 mt-5 line-clamp-3 leading-relaxed">
                {notice.content}
              </p>

              {/* Event Date */}
              {notice.event_date && (
                <div className="mt-5 px-4 py-3 rounded-xl bg-purple-50">
                  <p className="text-xs text-purple-600 font-medium uppercase">
                    Event Date
                  </p>

                  <p className="text-sm font-semibold text-purple-800 mt-1">
                    {formatDate(notice.event_date)}
                  </p>
                </div>
              )}

              {/* Button */}
              <button
                onClick={() => setSelectedNotice(notice)}
                className="mt-5 w-full px-4 py-3 rounded-xl bg-pink-600 text-white font-medium hover:bg-pink-700 transition"
              >
                Read Full Notice
              </button>

            </div>
          ))}

        </div>
      )}

      {/* Full Notice Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedNotice.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Posted on {formatDate(selectedNotice.notice_date)}
                </p>
              </div>

              <button
                onClick={() => setSelectedNotice(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl"
              >
                ×
              </button>

            </div>

            {/* Modal Content */}
            <div className="p-6">

              {selectedNotice.event_date && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-purple-50">
                  <p className="text-xs text-purple-600 font-medium uppercase">
                    Event Date
                  </p>

                  <p className="text-sm font-semibold text-purple-800 mt-1">
                    {formatDate(selectedNotice.event_date)}
                  </p>
                </div>
              )}

              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedNotice.content}
              </p>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end">

              <button
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}