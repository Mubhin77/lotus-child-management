// import { useEffect, useMemo, useState } from "react";
// import api from "../../services/api";
// import {
//   cardClass,
//   EmptyState,
//   formatDate,
//   getErrorMessage,
//   initials,
//   LoadingCards,
//   maxClass,
//   PageHeader,
//   pageClass,
//   inputClass,
// } from "../../components/teacher/TeacherUI";

// type Child = {
//   id: number;
//   first_name: string;
//   last_name: string;
//   date_of_birth: string;
//   roll_number?: number | null;
//   classroom?: number | null;
//   classroom_name?: string;
//   is_active?: boolean;
// };

// export default function TeacherChildren() {
//   const [children, setChildren] = useState<Child[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState<Child | null>(null);
//   useEffect(() => {
//     api
//       .get("/children/")
//       .then((r) => setChildren(r.data.results ?? r.data))
//       .catch((e) =>
//         setError(getErrorMessage(e, "Unable to load your children.")),
//       )
//       .finally(() => setLoading(false));
//   }, []);
//   const filtered = useMemo(
//     () =>
//       children.filter((c) =>
//         `${c.first_name} ${c.last_name}`
//           .toLowerCase()
//           .includes(search.toLowerCase()),
//       ),
//     [children, search],
//   );
//   return (
//     <div className={pageClass}>
//       <div className={maxClass}>
//         <PageHeader
//           title="My Children"
//           subtitle="View the children assigned to your classroom and their basic information."
//           action={
//             <div className="rounded-2xl bg-white border border-pink-100 px-4 py-3 text-sm font-semibold text-[#30435b]">
//               {children.length} children
//             </div>
//           }
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
//               placeholder="Search children..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//         </div>
//         {loading ? (
//           <LoadingCards />
//         ) : filtered.length === 0 ? (
//           <div className={cardClass}>
//             <EmptyState
//               icon="👧"
//               title="No children found"
//               text={
//                 search
//                   ? "Try a different name."
//                   : "No children are currently assigned to you."
//               }
//             />
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
//             {filtered.map((c) => (
//               <button
//                 key={c.id}
//                 onClick={() => setSelected(c)}
//                 className={`${cardClass} text-left p-5 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(53,35,67,0.09)] transition-all`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-pink-600 font-bold">
//                     {initials(c.first_name, c.last_name)}
//                   </div>
//                   <span className="text-pink-400 text-lg">→</span>
//                 </div>
//                 <h2 className="mt-5 text-lg font-bold text-[#30435b]">
//                   {c.first_name} {c.last_name}
//                 </h2>
//                 <p className="text-sm text-gray-400 mt-1">
//                   {c.classroom_name || "Assigned Classroom"}
//                 </p>
//                 <div className="mt-5 grid grid-cols-2 gap-3">
//                   <div className="rounded-2xl bg-gray-50 p-3">
//                     <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">
//                       Roll No.
//                     </p>
//                     <p className="font-semibold text-[#30435b] mt-1">
//                       {c.roll_number ?? "—"}
//                     </p>
//                   </div>
//                   <div className="rounded-2xl bg-gray-50 p-3">
//                     <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">
//                       Status
//                     </p>
//                     <p className="font-semibold text-green-600 mt-1">
//                       {c.is_active === false ? "Inactive" : "Active"}
//                     </p>
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
//               className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-7 text-white">
//                 <div className="flex items-center gap-4">
//                   <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-lg">
//                     {initials(selected.first_name, selected.last_name)}
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-bold">
//                       {selected.first_name} {selected.last_name}
//                     </h2>
//                     <p className="text-white/80 mt-1">
//                       {selected.classroom_name || "Assigned Classroom"}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="p-6 space-y-4">
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="bg-gray-50 rounded-2xl p-4">
//                     <p className="text-xs text-gray-400 font-bold uppercase">
//                       Date of Birth
//                     </p>
//                     <p className="mt-2 font-semibold text-[#30435b]">
//                       {formatDate(selected.date_of_birth)}
//                     </p>
//                   </div>
//                   <div className="bg-gray-50 rounded-2xl p-4">
//                     <p className="text-xs text-gray-400 font-bold uppercase">
//                       Roll Number
//                     </p>
//                     <p className="mt-2 font-semibold text-[#30435b]">
//                       {selected.roll_number ?? "—"}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex justify-end">
//                   <button
//                     onClick={() => setSelected(null)}
//                     className="px-5 py-3 rounded-xl bg-gray-100 font-bold text-gray-600"
//                   >
//                     Close
//                   </button>
//                 </div>
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

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  roll_number?: number | null;
  classroom?: number | null;
  classroom_name?: string;
  is_active?: boolean;
};

export default function Children() {
  const [children, setChildren] = useState<Child[]>([]);
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChildren = async () => {
      try {
        const response = await api.get("/children/");

        setChildren(response.data.results ?? response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, []);

  const filteredChildren = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return children;

    return children.filter((child) =>
      `${child.first_name} ${child.last_name}`.toLowerCase().includes(value),
    );
  }, [children, search]);

  return (
    <div className="min-h-screen bg-[#fff8fb] p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <p className="text-sm font-semibold text-pink-600">
              YOUR CLASSROOM
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-[#30435b] mt-2">
              My Children
            </h1>

            <p className="text-gray-500 mt-2">
              View the children assigned to your classroom.
            </p>
          </div>

          <div className="bg-white border border-pink-100 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Children</p>

            <p className="text-2xl font-bold text-[#30435b]">
              {children.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-4 mb-6">
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search children..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
            Loading children...
          </div>
        ) : filteredChildren.length === 0 ? (
          <div className="bg-white rounded-3xl border border-pink-100 p-12 text-center">
            <div className="text-5xl mb-4">👧</div>

            <h2 className="font-bold text-xl text-[#30435b]">
              No children found
            </h2>

            <p className="text-gray-500 mt-2">Try another search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="text-left bg-white rounded-3xl border border-pink-100 shadow-sm p-6 hover:-translate-y-1 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xl font-bold text-pink-700">
                    {child.first_name.charAt(0)}
                  </div>

                  <span className="text-gray-300 text-xl">→</span>
                </div>

                <h2 className="font-bold text-lg text-[#30435b] mt-5">
                  {child.first_name} {child.last_name}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {child.classroom_name || "Assigned Classroom"}
                </p>

                {child.roll_number && (
                  <p className="text-sm text-gray-400 mt-2">
                    Roll No. {child.roll_number}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedChild && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-7 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {selectedChild.first_name.charAt(0)}
              </div>

              <h2 className="text-2xl font-bold mt-4">
                {selectedChild.first_name} {selectedChild.last_name}
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <Info
                label="Classroom"
                value={selectedChild.classroom_name || "Assigned Classroom"}
              />

              <Info
                label="Roll Number"
                value={
                  selectedChild.roll_number
                    ? String(selectedChild.roll_number)
                    : "Not assigned"
                }
              />

              <Info
                label="Date of Birth"
                value={selectedChild.date_of_birth || "Not available"}
              />

              <button
                onClick={() => setSelectedChild(null)}
                className="w-full py-3 rounded-xl bg-pink-600 text-white font-semibold hover:bg-pink-700 transition"
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-400">{label}</p>

      <p className="font-semibold text-[#30435b] mt-1">{value}</p>
    </div>
  );
}
