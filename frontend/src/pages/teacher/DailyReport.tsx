// // export default TeacherDailyReport;

// import { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import {
//   cardClass,
//   getErrorMessage,
//   getLocalDate,
//   inputClass,
//   maxClass,
//   PageHeader,
//   pageClass,
// } from "../../components/teacher/TeacherUI";

// type Child = {
//   id: number;
//   first_name: string;
//   last_name: string;
//   classroom_name?: string;
// };
// type Attendance = { child: number; status: "present" | "absent" };
// type Activity = { id: number; name: string; description?: string };
// type Report = {
//   id: number;
//   child: number;
//   report_date: string;
//   mood: string;
//   morning_snack: string;
//   lunch: string;
//   rest_status: string;
//   rest_start: string | null;
//   rest_end: string | null;
//   participation: string;
//   teacher_observation: string;
//   activities: number[];
//   submitted: boolean;
// };
// const Section = ({
//   icon,
//   title,
//   children,
// }: {
//   icon: string;
//   title: string;
//   children: any;
// }) => (
//   <div className="rounded-3xl border border-gray-100 bg-[#fffafd] p-5">
//     <div className="flex items-center gap-3 mb-5">
//       <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
//         {icon}
//       </div>
//       <h2 className="font-bold text-[#30435b] text-lg">{title}</h2>
//     </div>
//     {children}
//   </div>
// );
// const Choice = ({
//   value,
//   current,
//   label,
//   onClick,
// }: {
//   value: string;
//   current: string;
//   label: string;
//   onClick: () => void;
// }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className={`px-4 py-3 rounded-xl text-sm font-bold border transition ${current === value ? "bg-pink-500 text-white border-pink-500" : "bg-white text-gray-600 border-gray-200 hover:border-pink-200"}`}
//   >
//     {label}
//   </button>
// );
// export default function DailyReport() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const params = new URLSearchParams(location.search);
//   const childParam = Number(params.get("child"));
//   const dateParam = params.get("date") || getLocalDate();
//   const [children, setChildren] = useState<Child[]>([]);
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [attendance, setAttendance] = useState<Attendance[]>([]);
//   const [form, setForm] = useState({
//     child: childParam || 0,
//     report_date: dateParam,
//     mood: "",
//     morning_snack: "",
//     lunch: "",
//     rest_status: "",
//     rest_start: "",
//     rest_end: "",
//     participation: "",
//     teacher_observation: "",
//     activities: [] as number[],
//   });
//   const [existingId, setExistingId] = useState<number | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   useEffect(() => {
//     Promise.all([
//       api.get("/children/"),
//       api.get("/activities/"),
//       api.get(`/attendance/?date=${dateParam}`),
//     ])
//       .then(([c, a, att]) => {
//         const cd = c.data.results ?? c.data;
//         const ad = att.data.results ?? att.data;
//         setAttendance(ad);
//         setChildren(
//           cd.filter((x: Child) =>
//             ad.some(
//               (r: Attendance) => r.child === x.id && r.status === "present",
//             ),
//           ),
//         );
//         setActivities((a.data.results ?? a.data).filter((x: Activity) => x));
//       })
//       .catch((e) =>
//         setError(getErrorMessage(e, "Unable to load the report form.")),
//       )
//       .finally(() => setLoading(false));
//   }, []);
//   useEffect(() => {
//     if (!form.child) return;
//     api
//       .get(`/daily-reports/?date=${form.report_date}`)
//       .then((r) => {
//         const list = r.data.results ?? r.data;
//         const found = list.find((x: Report) => x.child === form.child);
//         if (found) {
//           setExistingId(found.id);
//           setForm((f) => ({
//             ...f,
//             mood: found.mood || "",
//             morning_snack: found.morning_snack || "",
//             lunch: found.lunch || "",
//             rest_status: found.rest_status || "",
//             rest_start: found.rest_start || "",
//             rest_end: found.rest_end || "",
//             participation: found.participation || "",
//             teacher_observation: found.teacher_observation || "",
//             activities: found.activities || [],
//           }));
//         }
//       })
//       .catch(() => {});
//   }, [form.child, form.report_date]);
//   const child = useMemo(
//     () => children.find((c) => c.id === form.child),
//     [children, form.child],
//   );
//   const set = (key: string, value: any) =>
//     setForm((f) => ({ ...f, [key]: value }));
//   const toggleActivity = (id: number) =>
//     setForm((f) => ({
//       ...f,
//       activities: f.activities.includes(id)
//         ? f.activities.filter((x) => x !== id)
//         : [...f.activities, id],
//     }));
//   const save = async (submitted = true) => {
//     if (!form.child) {
//       setError("Please select a child.");
//       return;
//     }
//     if (!form.mood || !form.participation) {
//       setError("Please complete mood and participation before saving.");
//       return;
//     }
//     try {
//       setSaving(true);
//       setError("");
//       setSuccess("");
//       const payload = { ...form, submitted };
//       if (existingId) await api.patch(`/daily-reports/${existingId}/`, payload);
//       else {
//         const r = await api.post("/daily-reports/", payload);
//         setExistingId(r.data.id);
//       }
//       setSuccess(
//         submitted
//           ? "Daily report submitted successfully."
//           : "Draft saved successfully.",
//       );
//     } catch (e) {
//       setError(getErrorMessage(e, "Unable to save the daily report."));
//     } finally {
//       setSaving(false);
//     }
//   };
//   if (loading)
//     return (
//       <div className={pageClass}>
//         <div className={maxClass}>
//           <div className="h-64 bg-white rounded-3xl animate-pulse" />
//         </div>
//       </div>
//     );
//   return (
//     <div className={pageClass}>
//       <div className={maxClass}>
//         <PageHeader
//           title={existingId ? "Edit Daily Report" : "Daily Report"}
//           subtitle="Record the child’s day with simple, meaningful observations."
//           action={
//             <button
//               onClick={() => navigate("/teacher/reports")}
//               className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold"
//             >
//               ← Back to Reports
//             </button>
//           }
//         />
//         <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
//           <div className="space-y-5">
//             <Section icon="👧" title="Child & Date">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-xs font-bold uppercase tracking-wide text-gray-400">
//                     Child
//                   </label>
//                   <select
//                     className={`${inputClass} mt-2`}
//                     value={form.child}
//                     onChange={(e) => {
//                       set("child", Number(e.target.value));
//                       setExistingId(null);
//                     }}
//                   >
//                     <option value={0}>Select child</option>
//                     {children.map((c) => (
//                       <option key={c.id} value={c.id}>
//                         {c.first_name} {c.last_name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-xs font-bold uppercase tracking-wide text-gray-400">
//                     Report Date
//                   </label>
//                   <input
//                     type="date"
//                     className={`${inputClass} mt-2`}
//                     value={form.report_date}
//                     onChange={(e) => set("report_date", e.target.value)}
//                   />
//                 </div>
//               </div>
//               {child && (
//                 <div className="mt-4 rounded-2xl bg-pink-50 p-4 text-sm">
//                   <span className="font-bold text-[#30435b]">
//                     {child.first_name} {child.last_name}
//                   </span>
//                   <span className="text-gray-500">
//                     {" "}
//                     · {child.classroom_name || "Assigned Classroom"}
//                   </span>
//                 </div>
//               )}
//             </Section>
//             <Section icon="🙂" title="Child's Mood">
//               <div className="flex flex-wrap gap-2">
//                 {[
//                   ["happy", "😊 Happy"],
//                   ["good", "🙂 Good"],
//                   ["normal", "😐 Normal"],
//                   ["tired", "😴 Tired"],
//                 ].map(([v, l]) => (
//                   <Choice
//                     key={v}
//                     value={v}
//                     current={form.mood}
//                     label={l}
//                     onClick={() => set("mood", v)}
//                   />
//                 ))}
//               </div>
//             </Section>
//             <Section icon="🍽️" title="Meals">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 {[
//                   ["morning_snack", "Morning Snack"],
//                   ["lunch", "Lunch"],
//                 ].map(([key, label]) => (
//                   <div key={key}>
//                     <p className="text-sm font-bold text-[#30435b] mb-3">
//                       {label}
//                     </p>
//                     <div className="flex flex-wrap gap-2">
//                       {[
//                         ["finished", "Finished"],
//                         ["partial", "Partly"],
//                         ["did_not_eat", "Did not eat"],
//                       ].map(([v, l]) => (
//                         <Choice
//                           key={v}
//                           value={v}
//                           current={(form as any)[key]}
//                           label={l}
//                           onClick={() => set(key, v)}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </Section>
//             <Section icon="😴" title="Rest / Sleep">
//               <div className="flex flex-wrap gap-2 mb-4">
//                 {[
//                   ["slept", "Slept"],
//                   ["rested", "Rested"],
//                   ["did_not_rest", "Did not rest"],
//                 ].map(([v, l]) => (
//                   <Choice
//                     key={v}
//                     value={v}
//                     current={form.rest_status}
//                     label={l}
//                     onClick={() => set("rest_status", v)}
//                   />
//                 ))}
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-xs text-gray-400 font-bold">
//                     Start
//                   </label>
//                   <input
//                     type="time"
//                     className={`${inputClass} mt-2`}
//                     value={form.rest_start}
//                     onChange={(e) => set("rest_start", e.target.value)}
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs text-gray-400 font-bold">End</label>
//                   <input
//                     type="time"
//                     className={`${inputClass} mt-2`}
//                     value={form.rest_end}
//                     onChange={(e) => set("rest_end", e.target.value)}
//                   />
//                 </div>
//               </div>
//             </Section>
//             <Section icon="🎨" title="Activities">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 {activities.map((a) => (
//                   <button
//                     type="button"
//                     key={a.id}
//                     onClick={() => toggleActivity(a.id)}
//                     className={`text-left rounded-2xl border p-4 transition ${form.activities.includes(a.id) ? "border-pink-300 bg-pink-50" : "border-gray-200 bg-white hover:border-pink-200"}`}
//                   >
//                     <p className="font-bold text-[#30435b]">{a.name}</p>
//                     {a.description && (
//                       <p className="text-xs text-gray-400 mt-1">
//                         {a.description}
//                       </p>
//                     )}
//                     <span className="text-xs font-bold text-pink-500 mt-2 inline-block">
//                       {form.activities.includes(a.id) ? "✓ Selected" : "Select"}
//                     </span>
//                   </button>
//                 ))}
//               </div>
//               {activities.length === 0 && (
//                 <p className="text-sm text-gray-400">
//                   No active activities have been created yet.
//                 </p>
//               )}
//             </Section>
//             <Section icon="✨" title="Participation">
//               <div className="flex flex-wrap gap-2">
//                 {[
//                   ["participated", "Participated"],
//                   ["partial", "Partially participated"],
//                   ["not_participated", "Did not participate"],
//                 ].map(([v, l]) => (
//                   <Choice
//                     key={v}
//                     value={v}
//                     current={form.participation}
//                     label={l}
//                     onClick={() => set("participation", v)}
//                   />
//                 ))}
//               </div>
//             </Section>
//             <Section icon="💬" title="Teacher Observation">
//               <textarea
//                 rows={5}
//                 className={`${inputClass} resize-none`}
//                 placeholder="Write a short observation about the child's day..."
//                 value={form.teacher_observation}
//                 onChange={(e) => set("teacher_observation", e.target.value)}
//               />
//             </Section>
//           </div>
//           <aside className="lg:sticky lg:top-6 h-fit">
//             <div className={`${cardClass} p-5`}>
//               <p className="text-xs uppercase tracking-wide text-pink-500 font-bold">
//                 Report Summary
//               </p>
//               <h2 className="text-xl font-bold text-[#30435b] mt-2">
//                 {child
//                   ? `${child.first_name} ${child.last_name}`
//                   : "Select a child"}
//               </h2>
//               <p className="text-sm text-gray-400 mt-1">{form.report_date}</p>
//               <div className="mt-5 space-y-3 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Mood</span>
//                   <b className="text-[#30435b] capitalize">
//                     {form.mood || "Not selected"}
//                   </b>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Meals</span>
//                   <b className="text-[#30435b]">
//                     {form.morning_snack || form.lunch
//                       ? "Recorded"
//                       : "Not recorded"}
//                   </b>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Activities</span>
//                   <b className="text-[#30435b]">{form.activities.length}</b>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Participation</span>
//                   <b className="text-[#30435b]">
//                     {form.participation ? "Recorded" : "Not selected"}
//                   </b>
//                 </div>
//               </div>
//               <div className="mt-6 space-y-2">
//                 <button
//                   disabled={saving}
//                   onClick={() => save(false)}
//                   className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-bold disabled:opacity-50"
//                 >
//                   {saving ? "Saving..." : "Save Draft"}
//                 </button>
//                 <button
//                   disabled={saving}
//                   onClick={() => save(true)}
//                   className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold disabled:opacity-50"
//                 >
//                   {saving ? "Saving..." : "Submit Report"}
//                 </button>
//               </div>
//               {error && (
//                 <p className="mt-4 rounded-xl bg-red-50 text-red-700 p-3 text-sm">
//                   {error}
//                 </p>
//               )}
//               {success && (
//                 <p className="mt-4 rounded-xl bg-green-50 text-green-700 p-3 text-sm">
//                   {success}
//                 </p>
//               )}
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

type Child = {
  id: number;
  first_name: string;
  last_name: string;
  classroom_name?: string;
};

type Activity = {
  id: number;
  name: string;
  description?: string;
};

type Report = {
  id: number;
  child: number;
  report_date: string;
  mood: string;
  morning_snack: string;
  lunch: string;
  rest_status: string;
  rest_start: string | null;
  rest_end: string | null;
  participation: string;
  teacher_observation: string;
  activities: number[];
  submitted: boolean;
};

export default function DailyReport() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const childId = Number(params.get("child"));
  const reportId = params.get("id");
  const date = params.get("date") || new Date().toISOString().split("T")[0];

  const [children, setChildren] = useState<Child[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [child, setChild] = useState<Child | null>(null);

  const [report, setReport] = useState<Report | null>(null);

  const [mood, setMood] = useState("");
  const [morningSnack, setMorningSnack] = useState("");
  const [lunch, setLunch] = useState("");
  const [restStatus, setRestStatus] = useState("");
  const [restStart, setRestStart] = useState("");
  const [restEnd, setRestEnd] = useState("");
  const [participation, setParticipation] = useState("");
  const [observation, setObservation] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [childrenRes, activitiesRes] = await Promise.all([
        api.get("/children/"),
        api.get("/activities/"),
      ]);

      const childList = childrenRes.data.results ?? childrenRes.data;

      const activityList = activitiesRes.data.results ?? activitiesRes.data;

      setChildren(childList);
      setActivities(activityList);

      const selected =
        childList.find((item: Child) => item.id === childId) || null;

      setChild(selected);

      if (reportId) {
        const reportRes = await api.get(`/daily-reports/${reportId}/`);

        const existing = reportRes.data;

        setReport(existing);
        setMood(existing.mood || "");
        setMorningSnack(existing.morning_snack || "");
        setLunch(existing.lunch || "");
        setRestStatus(existing.rest_status || "");
        setRestStart(existing.rest_start || "");
        setRestEnd(existing.rest_end || "");
        setParticipation(existing.participation || "");
        setObservation(existing.teacher_observation || "");
        setSelectedActivities(existing.activities || []);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load the daily report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleActivity = (id: number) => {
    setSelectedActivities((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const formData = useMemo(
    () => ({
      child: childId,
      report_date: date,
      mood,
      morning_snack: morningSnack,
      lunch,
      rest_status: restStatus,
      rest_start: restStatus === "slept" ? restStart || null : null,
      rest_end: restStatus === "slept" ? restEnd || null : null,
      participation,
      teacher_observation: observation,
      activities: selectedActivities,
    }),
    [
      childId,
      date,
      mood,
      morningSnack,
      lunch,
      restStatus,
      restStart,
      restEnd,
      participation,
      observation,
      selectedActivities,
    ],
  );

  const save = async (submit: boolean) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        ...formData,
        submitted: submit,
      };

      if (report) {
        const response = await api.patch(
          `/daily-reports/${report.id}/`,
          payload,
        );

        setReport(response.data);
      } else {
        const response = await api.post("/daily-reports/", payload);

        setReport(response.data);
      }

      setMessage(
        submit
          ? "Daily report submitted successfully."
          : "Draft saved successfully.",
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to save the report. Please check attendance and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8fb] p-8 flex items-center justify-center text-gray-500">
        Loading daily report...
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-[#fff8fb] p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 text-center">
          <div className="text-5xl mb-4">👧</div>

          <h2 className="text-xl font-bold text-[#30435b]">Child not found</h2>

          <p className="text-gray-500 mt-2">
            This child is not assigned to you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8fb] p-5 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/teacher/reports")}
          className="text-sm font-semibold text-pink-600 hover:text-pink-700 mb-6"
        >
          ← Back to Reports
        </button>

        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-7 text-white">
            <p className="text-sm text-white/80">Daily Report</p>

            <h1 className="text-2xl md:text-3xl font-bold mt-2">
              {child.first_name} {child.last_name}
            </h1>

            <p className="text-white/80 mt-1">{date}</p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl px-5 py-4">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-100 text-green-700 rounded-2xl px-5 py-4">
                ✓ {message}
              </div>
            )}

            {/* Mood */}
            <Section
              title="How was the child today?"
              description="Select the mood that best describes the child's day."
            >
              <ChoiceGroup
                value={mood}
                onChange={setMood}
                options={[
                  ["happy", "😊", "Happy"],
                  ["good", "🙂", "Good"],
                  ["normal", "😐", "Normal"],
                  ["tired", "😴", "Tired"],
                ]}
              />
            </Section>

            {/* Meals */}
            <Section
              title="Meals"
              description="Record how the child ate during the day."
            >
              <div className="space-y-6">
                <ChoiceRow
                  label="Morning Snack"
                  value={morningSnack}
                  onChange={setMorningSnack}
                />

                <ChoiceRow label="Lunch" value={lunch} onChange={setLunch} />
              </div>
            </Section>

            {/* Rest */}
            <Section
              title="Rest / Sleep"
              description="Record the child's rest period."
            >
              <ChoiceGroup
                value={restStatus}
                onChange={setRestStatus}
                options={[
                  ["slept", "😴", "Slept"],
                  ["rested", "🧘", "Rested"],
                  ["did_not_rest", "☀️", "Did Not Rest"],
                ]}
              />

              {restStatus === "slept" && (
                <div className="grid md:grid-cols-2 gap-4 mt-5">
                  <Field
                    label="Start Time"
                    type="time"
                    value={restStart}
                    onChange={setRestStart}
                  />

                  <Field
                    label="End Time"
                    type="time"
                    value={restEnd}
                    onChange={setRestEnd}
                  />
                </div>
              )}
            </Section>

            {/* Participation */}
            <Section
              title="Participation"
              description="How actively did the child participate?"
            >
              <ChoiceGroup
                value={participation}
                onChange={setParticipation}
                options={[
                  ["participated", "✓", "Participated"],
                  ["partial", "◐", "Partially Participated"],
                  ["not_participated", "—", "Not Participated"],
                ]}
              />
            </Section>

            {/* Activities */}
            <Section
              title="Activities"
              description="Select the activities the child participated in."
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {activities.map((activity) => {
                  const selected = selectedActivities.includes(activity.id);

                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => toggleActivity(activity.id)}
                      className={`text-left px-4 py-4 rounded-xl border transition ${
                        selected
                          ? "bg-pink-50 border-pink-300 text-pink-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-pink-200"
                      }`}
                    >
                      <span className="font-semibold">
                        {selected ? "✓ " : ""}
                        {activity.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Observation */}
            <Section
              title="Teacher's Observation"
              description="Add anything important about the child's day."
            >
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={5}
                placeholder="Write a short observation..."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 outline-none resize-none focus:ring-2 focus:ring-pink-200"
              />
            </Section>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => save(false)}
                disabled={saving || report?.submitted}
                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                onClick={() => save(true)}
                disabled={saving || report?.submitted}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-sm hover:shadow-md transition disabled:opacity-50"
              >
                {report?.submitted
                  ? "✓ Submitted"
                  : saving
                    ? "Submitting..."
                    : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-bold text-[#30435b]">{title}</h2>

      <p className="text-sm text-gray-500 mt-1 mb-4">{description}</p>

      {children}
    </section>
  );
}

function ChoiceGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: [string, string, string][];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {options.map(([key, icon, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`p-4 rounded-2xl border text-center transition ${
            value === key
              ? "border-pink-300 bg-pink-50 text-pink-700 ring-2 ring-pink-100"
              : "border-gray-200 hover:border-pink-200"
          }`}
        >
          <div className="text-2xl">{icon}</div>

          <div className="font-semibold text-sm mt-2">{label}</div>
        </button>
      ))}
    </div>
  );
}

function ChoiceRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="font-semibold text-[#30435b] mb-3">{label}</p>

      <div className="grid grid-cols-3 gap-2">
        {[
          ["finished", "✓ Finished"],
          ["partial", "Partly"],
          ["did_not_eat", "Did Not Eat"],
        ].map(([key, text]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`py-3 px-2 rounded-xl border text-sm font-semibold transition ${
              value === key
                ? "bg-pink-50 border-pink-300 text-pink-700"
                : "border-gray-200 text-gray-600 hover:border-pink-200"
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-pink-200"
      />
    </div>
  );
}
