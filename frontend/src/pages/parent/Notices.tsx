// import { useEffect, useState } from "react";
// import api from "../../services/api";

// interface Notice {
//   id: number;
//   title: string;
//   content: string;
//   notice_date: string;
//   event_date: string | null;
//   is_active: boolean;
// }

// export default function ParentNotices() {
//   const [notices, setNotices] = useState<Notice[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedNotice, setSelectedNotice] =
//     useState<Notice | null>(null);

//   useEffect(() => {
//     const loadNotices = async () => {
//       try {
//         const response = await api.get("/notices/");
//         setNotices(response.data);
//       } catch (error) {
//         console.error("Failed to load notices:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadNotices();
//   }, []);

//   if (loading) {
//     return (
//       <div className="p-8">
//         <p className="text-gray-500">
//           Loading notices...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8">

//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">
//           Notices
//         </h1>

//         <p className="text-gray-500 mt-1">
//           Important announcements and updates from Lotus Montessori.
//         </p>
//       </div>

//       {/* Notices */}
//       {notices.length === 0 ? (
//         <div className="bg-white rounded-2xl border border-pink-100 p-8 text-center">
//           <p className="text-gray-500">
//             No notices are available at the moment.
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

//           {notices.map((notice) => (
//             <div
//               key={notice.id}
//               className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6"
//             >

//               <div className="flex justify-between items-start gap-4">

//                 <div>
//                   <h2 className="text-xl font-bold text-gray-800">
//                     {notice.title}
//                   </h2>

//                   <p className="text-sm text-gray-500 mt-1">
//                     Posted: {notice.notice_date}
//                   </p>
//                 </div>

//                 <span className="shrink-0 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
//                   Active
//                 </span>

//               </div>

//               <p className="text-gray-600 mt-4 line-clamp-3">
//                 {notice.content}
//               </p>

//               {notice.event_date && (
//                 <div className="mt-4 bg-pink-50 rounded-xl p-3">
//                   <p className="text-sm text-gray-500">
//                     Event Date
//                   </p>

//                   <p className="font-semibold text-pink-700 mt-1">
//                     {notice.event_date}
//                   </p>
//                 </div>
//               )}

//               <button
//                 onClick={() => setSelectedNotice(notice)}
//                 className="mt-5 px-4 py-2 rounded-lg bg-pink-100 text-pink-700 font-medium hover:bg-pink-200 transition"
//               >
//                 Read Full Notice
//               </button>

//             </div>
//           ))}

//         </div>
//       )}

//       {/* Notice Modal */}
//       {selectedNotice && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">

//             <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">

//               <div>
//                 <h2 className="text-2xl font-bold text-gray-800">
//                   {selectedNotice.title}
//                 </h2>

//                 <p className="text-sm text-gray-500 mt-1">
//                   Posted: {selectedNotice.notice_date}
//                 </p>
//               </div>

//               <button
//                 onClick={() => setSelectedNotice(null)}
//                 className="text-gray-400 hover:text-gray-700 text-2xl"
//               >
//                 ×
//               </button>

//             </div>

//             <div className="p-6">

//               {selectedNotice.event_date && (
//                 <div className="bg-pink-50 rounded-xl p-4 mb-5">

//                   <p className="text-sm text-gray-500">
//                     Event Date
//                   </p>

//                   <p className="font-semibold text-pink-700 mt-1">
//                     {selectedNotice.event_date}
//                   </p>

//                 </div>
//               )}

//               <div className="text-gray-700 leading-7 whitespace-pre-wrap">
//                 {selectedNotice.content}
//               </div>

//             </div>

//             <div className="px-6 py-4 border-t border-gray-100 flex justify-end">

//               <button
//                 onClick={() => setSelectedNotice(null)}
//                 className="px-5 py-2.5 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition"
//               >
//                 Close
//               </button>

//             </div>

//           </div>

//         </div>
//       )}

//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

type Notice = {
  id: number;
  title: string;
  content: string;
  notice_date: string;
  event_date?: string | null;
  is_active: boolean;
  created_at: string;
};

function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLongDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ParentNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadNotices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/notices/");

        const data = response.data.results ?? response.data;

        setNotices(data);
      } catch (err) {
        console.error(err);

        setError("We couldn't load school notices.");
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  const filteredNotices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return notices;

    return notices.filter(
      (notice) =>
        notice.title.toLowerCase().includes(query) ||
        notice.content.toLowerCase().includes(query),
    );
  }, [notices, search]);

  return (
    <div className="min-h-screen bg-[#fff8fb] p-5 md:p-7 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}

        <section className="relative overflow-hidden rounded-[2rem] bg-white border border-pink-100/80 shadow-[0_12px_40px_rgba(53,35,67,0.06)]">
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-pink-100/60 blur-3xl pointer-events-none" />

          <div className="absolute -bottom-24 right-48 w-56 h-56 rounded-full bg-purple-100/50 blur-3xl pointer-events-none" />

          <div className="relative p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 items-center justify-center text-white text-xl shadow-lg shadow-pink-200">
                📢
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    School Notices
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#30435b]">
                  Notices & Announcements
                </h1>

                <p className="mt-2 text-sm md:text-base text-gray-500 max-w-xl">
                  Stay updated with important information, events, and
                  activities from Lotus Montessori.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* SEARCH */}

        {!loading && notices.length > 0 && (
          <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notices..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-[#fffafd] text-sm text-[#30435b] outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition"
              />
            </div>
          </section>
        )}

        {/* CONTENT */}

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-40 bg-white rounded-3xl" />
            ))}
          </div>
        ) : filteredNotices.length === 0 ? (
          <section className="bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-10 text-center">
            <div className="text-4xl mb-4">📭</div>

            <h2 className="text-xl font-bold text-[#30435b]">
              {search ? "No notices found" : "No notices available"}
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              {search
                ? "Try searching for something else."
                : "School announcements will appear here."}
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {filteredNotices.map((notice) => (
              <button
                key={notice.id}
                type="button"
                onClick={() => setSelectedNotice(notice)}
                className="w-full text-left bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5 md:p-6 hover:shadow-[0_12px_35px_rgba(53,35,67,0.08)] hover:border-pink-200 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-xl">
                    📢
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h2 className="text-lg font-bold text-[#30435b]">
                        {notice.title}
                      </h2>

                      <span className="text-xs text-gray-400">
                        {formatDate(notice.notice_date)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500 leading-6 line-clamp-2">
                      {notice.content}
                    </p>

                    {notice.event_date && (
                      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 text-xs font-bold">
                        📅 Event: {formatDate(notice.event_date)}
                      </div>
                    )}
                  </div>

                  <span className="hidden sm:block text-gray-300 text-xl">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* NOTICE DETAIL MODAL */}

        {selectedNotice && (
          <div
            className="fixed inset-0 z-50 bg-[#30435b]/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedNotice(null)}
          >
            <div
              className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex px-2.5 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
                    School Notice
                  </span>

                  <h2 className="text-xl md:text-2xl font-bold text-[#30435b] mt-2">
                    {selectedNotice.title}
                  </h2>

                  <p className="text-sm text-gray-400 mt-1">
                    Published {formatLongDate(selectedNotice.notice_date)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNotice(null)}
                  className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 hover:bg-pink-50 hover:text-pink-500 transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                {selectedNotice.event_date && (
                  <div className="rounded-2xl bg-purple-50 border border-purple-100 p-5">
                    <p className="text-xs uppercase tracking-widest font-bold text-purple-400">
                      Event Date
                    </p>

                    <p className="mt-2 text-lg font-bold text-purple-700">
                      {formatLongDate(selectedNotice.event_date)}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl bg-[#fff8fb] p-5">
                  <p className="text-[#30435b] leading-7 whitespace-pre-wrap">
                    {selectedNotice.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
