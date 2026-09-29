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

export default function ParentNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] =
    useState<Notice | null>(null);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const response = await api.get("/notices/");
        setNotices(response.data);
      } catch (error) {
        console.error("Failed to load notices:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">
          Loading notices...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Notices
        </h1>

        <p className="text-gray-500 mt-1">
          Important announcements and updates from Lotus Montessori.
        </p>
      </div>

      {/* Notices */}
      {notices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pink-100 p-8 text-center">
          <p className="text-gray-500">
            No notices are available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {notices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6"
            >

              <div className="flex justify-between items-start gap-4">

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {notice.title}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Posted: {notice.notice_date}
                  </p>
                </div>

                <span className="shrink-0 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  Active
                </span>

              </div>

              <p className="text-gray-600 mt-4 line-clamp-3">
                {notice.content}
              </p>

              {notice.event_date && (
                <div className="mt-4 bg-pink-50 rounded-xl p-3">
                  <p className="text-sm text-gray-500">
                    Event Date
                  </p>

                  <p className="font-semibold text-pink-700 mt-1">
                    {notice.event_date}
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedNotice(notice)}
                className="mt-5 px-4 py-2 rounded-lg bg-pink-100 text-pink-700 font-medium hover:bg-pink-200 transition"
              >
                Read Full Notice
              </button>

            </div>
          ))}

        </div>
      )}

      {/* Notice Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">

            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedNotice.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Posted: {selectedNotice.notice_date}
                </p>
              </div>

              <button
                onClick={() => setSelectedNotice(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl"
              >
                ×
              </button>

            </div>

            <div className="p-6">

              {selectedNotice.event_date && (
                <div className="bg-pink-50 rounded-xl p-4 mb-5">

                  <p className="text-sm text-gray-500">
                    Event Date
                  </p>

                  <p className="font-semibold text-pink-700 mt-1">
                    {selectedNotice.event_date}
                  </p>

                </div>
              )}

              <div className="text-gray-700 leading-7 whitespace-pre-wrap">
                {selectedNotice.content}
              </div>

            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">

              <button
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2.5 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition"
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