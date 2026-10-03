// import { useEffect, useMemo, useState } from "react";
// import api from "../../services/api";
// import {
//   cardClass,
//   EmptyState,
//   formatDate,
//   getErrorMessage,
//   inputClass,
//   maxClass,
//   PageHeader,
//   pageClass,
// } from "../../components/teacher/TeacherUI";

// type Notice = {
//   id: number;
//   title: string;
//   content: string;
//   notice_date: string;
//   event_date?: string | null;
//   is_active?: boolean;
// };

// export default function TeacherNotices() {
//   const [notices, setNotices] = useState<Notice[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState<Notice | null>(null);

//   useEffect(() => {
//     api
//       .get("/notices/")
//       .then((r) => setNotices(r.data.results ?? r.data))
//       .catch((e) => setError(getErrorMessage(e, "Unable to load notices.")))
//       .finally(() => setLoading(false));
//   }, []);

//   const filtered = useMemo(
//     () =>
//       notices.filter((n) =>
//         `${n.title} ${n.content}`.toLowerCase().includes(search.toLowerCase()),
//       ),
//     [notices, search],
//   );

//   return (
//     <div className={pageClass}>
//       <div className={maxClass}>
//         <PageHeader
//           title="Notices"
//           subtitle="Stay up to date with school announcements and upcoming activities."
//         />

//         {error && (
//           <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
//             {error}
//           </div>
//         )}

//         <div className={`${cardClass} p-4 mb-6`}>
//           <div className="relative max-w-xl">
//             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
//               ⌕
//             </span>

//             <input
//               className={`${inputClass} pl-10`}
//               placeholder="Search notices..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>

//         {loading ? (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-pulse">
//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="h-44 bg-white rounded-3xl" />
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className={cardClass}>
//             <EmptyState
//               icon="📭"
//               title="No notices found"
//               text={
//                 search
//                   ? "Try another search."
//                   : "School notices will appear here when published."
//               }
//             />
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             {filtered.map((n, i) => (
//               <button
//                 key={n.id}
//                 onClick={() => setSelected(n)}
//                 className={`${cardClass} p-6 text-left hover:-translate-y-1 transition-all`}
//               >
//                 <div className="flex items-start gap-4">
//                   <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-xl shrink-0">
//                     {["📢", "🏃", "👨‍👩‍👧", "🎨", "🌸"][i % 5]}
//                   </div>

//                   <div className="min-w-0 flex-1">
//                     <div className="flex items-start justify-between gap-3">
//                       <h2 className="font-bold text-[#30435b] text-lg">
//                         {n.title}
//                       </h2>

//                       <span className="text-pink-400">→</span>
//                     </div>

//                     <p className="text-sm text-gray-400 mt-2 line-clamp-2">
//                       {n.content}
//                     </p>

//                     <div className="flex flex-wrap gap-2 mt-5">
//                       <span className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 text-xs font-bold">
//                         Posted {formatDate(n.notice_date)}
//                       </span>

//                       {n.event_date && (
//                         <span className="px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
//                           Event {formatDate(n.event_date)}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         )}

//         {selected && (
//           <div
//             className="fixed inset-0 z-50 bg-[#263238]/40 backdrop-blur-sm flex items-center justify-center p-4"
//             onClick={() => setSelected(null)}
//           >
//             <div
//               className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="p-7 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
//                 <div className="flex justify-between gap-4">
//                   <div>
//                     <p className="text-white/75 text-sm">School Notice</p>

//                     <h2 className="text-2xl font-bold mt-1">
//                       {selected.title}
//                     </h2>
//                   </div>

//                   <button
//                     onClick={() => setSelected(null)}
//                     className="w-9 h-9 rounded-xl bg-white/15"
//                   >
//                     ×
//                   </button>
//                 </div>
//               </div>

//               <div className="p-7">
//                 <div className="flex flex-wrap gap-2 mb-5">
//                   <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
//                     Posted {formatDate(selected.notice_date)}
//                   </span>

//                   {selected.event_date && (
//                     <span className="px-3 py-1.5 rounded-full bg-pink-50 text-pink-600 text-xs font-bold">
//                       Event {formatDate(selected.event_date)}
//                     </span>
//                   )}
//                 </div>

//                 <p className="text-[#4a5b70] leading-8 whitespace-pre-wrap">
//                   {selected.content}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
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
  event_date: string | null;
  is_active: boolean;
  created_at: string;
};

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] =
    useState<Notice | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const response = await api.get("/notices/");

        setNotices(
          response.data.results ?? response.data,
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  const filteredNotices = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return notices;

    return notices.filter(
      (notice) =>
        notice.title
          .toLowerCase()
          .includes(value) ||
        notice.content
          .toLowerCase()
          .includes(value),
    );
  }, [notices, search]);

  return (
    <div className="min-h-screen bg-[#fff8fb] p-5 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <p className="text-sm font-semibold text-pink-600">
            SCHOOL UPDATES
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-[#30435b] mt-2">
            Notices
          </h1>

          <p className="text-gray-500 mt-2">
            Stay updated with important school announcements and activities.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-4 mb-6">
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search notices..."
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
            Loading notices...
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center">
            <div className="text-5xl mb-4">📢</div>

            <h2 className="text-xl font-bold text-[#30435b]">
              No notices found
            </h2>

            <p className="text-gray-500 mt-2">
              There are currently no notices to display.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-5">

            {filteredNotices.map((notice) => (
              <button
                key={notice.id}
                onClick={() =>
                  setSelectedNotice(notice)
                }
                className="text-left bg-white rounded-3xl border border-pink-100 shadow-sm p-6 hover:-translate-y-1 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center text-xl">
                    📢
                  </div>

                  <span className="text-xs text-gray-400">
                    {notice.notice_date}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-[#30435b] mt-5">
                  {notice.title}
                </h2>

                <p className="text-gray-500 mt-2 line-clamp-3">
                  {notice.content}
                </p>

                {notice.event_date && (
                  <div className="mt-5 px-4 py-3 rounded-xl bg-purple-50 text-purple-700 text-sm font-semibold">
                    📅 Event Date: {notice.event_date}
                  </div>
                )}

                <div className="mt-5 text-pink-600 font-semibold text-sm">
                  View notice →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-7 text-white">

              <div className="flex justify-between items-start gap-5">

                <div>
                  <p className="text-sm text-white/80">
                    School Notice
                  </p>

                  <h2 className="text-2xl font-bold mt-2">
                    {selectedNotice.title}
                  </h2>
                </div>

                <button
                  onClick={() =>
                    setSelectedNotice(null)
                  }
                  className="text-2xl text-white/80 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-7">

              <div className="flex flex-wrap gap-3 mb-6">

                <span className="px-3 py-2 rounded-xl bg-pink-50 text-pink-700 text-sm font-semibold">
                  Posted: {selectedNotice.notice_date}
                </span>

                {selectedNotice.event_date && (
                  <span className="px-3 py-2 rounded-xl bg-purple-50 text-purple-700 text-sm font-semibold">
                    Event: {selectedNotice.event_date}
                  </span>
                )}
              </div>

              <div className="text-gray-700 leading-7 whitespace-pre-wrap">
                {selectedNotice.content}
              </div>

              <button
                onClick={() =>
                  setSelectedNotice(null)
                }
                className="mt-8 w-full py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition"
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