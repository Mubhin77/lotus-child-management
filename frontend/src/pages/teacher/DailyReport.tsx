import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  roll_number: number | null;
}

interface Activity {
  id: number;
  name: string;
}

interface DailyReport {
  id: number;
  child: number;
  report_date: string;
  attendance_present: boolean;
  arrival_time: string | null;
  departure_time: string | null;
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
}

interface ReportForm {
  attendance_present: boolean;
  arrival_time: string;
  departure_time: string;
  mood: string;
  morning_snack: string;
  lunch: string;
  rest_status: string;
  rest_start: string;
  rest_end: string;
  participation: string;
  teacher_observation: string;
  activities: number[];
}

function TeacherDailyReport() {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState<Child | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [existingReport, setExistingReport] =
    useState<DailyReport | null>(null);

  const [reportDate, setReportDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [form, setForm] = useState<ReportForm>({
    attendance_present: true,
    arrival_time: "",
    departure_time: "",
    mood: "",
    morning_snack: "",
    lunch: "",
    rest_status: "",
    rest_start: "",
    rest_end: "",
    participation: "",
    teacher_observation: "",
    activities: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [childResponse, activityResponse, reportResponse] =
          await Promise.all([
            api.get(`/children/${childId}/`),
            api.get("/activities/"),
            api.get(`/daily-reports/?date=${reportDate}`),
          ]);

        setChild(childResponse.data);
        setActivities(activityResponse.data);

        const report = reportResponse.data.find(
          (item: DailyReport) =>
            item.child === Number(childId)
        );

        if (report) {
          setExistingReport(report);

          setForm({
            attendance_present: report.attendance_present,
            arrival_time: report.arrival_time || "",
            departure_time: report.departure_time || "",
            mood: report.mood || "",
            morning_snack: report.morning_snack || "",
            lunch: report.lunch || "",
            rest_status: report.rest_status || "",
            rest_start: report.rest_start || "",
            rest_end: report.rest_end || "",
            participation: report.participation || "",
            teacher_observation:
              report.teacher_observation || "",
            activities: report.activities || [],
          });
        } else {
          setExistingReport(null);

          setForm({
            attendance_present: true,
            arrival_time: "",
            departure_time: "",
            mood: "",
            morning_snack: "",
            lunch: "",
            rest_status: "",
            rest_start: "",
            rest_end: "",
            participation: "",
            teacher_observation: "",
            activities: [],
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load the daily report.");
      } finally {
        setLoading(false);
      }
    };
      
    loadData();
  }, [childId, reportDate]);

  const updateField = (
    field: keyof ReportForm,
    value: any
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleActivity = (activityId: number) => {
    setForm((previous) => ({
      ...previous,
      activities: previous.activities.includes(activityId)
        ? previous.activities.filter(
            (id) => id !== activityId
          )
        : [...previous.activities, activityId],
    }));
  };

  const saveReport = async (submitted: boolean) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        child: Number(childId),
        report_date: reportDate,
        attendance_present: form.attendance_present,
        arrival_time:
          form.arrival_time || null,
        departure_time:
          form.departure_time || null,
        mood: form.mood,
        morning_snack: form.morning_snack,
        lunch: form.lunch,
        rest_status: form.rest_status,
        rest_start:
          form.rest_start || null,
        rest_end:
          form.rest_end || null,
        participation: form.participation,
        teacher_observation:
          form.teacher_observation,
        activities: form.activities,
        submitted,
      };

      let response;

      if (existingReport) {
        response = await api.put(
          `/daily-reports/${existingReport.id}/`,
          payload
        );
      } else {
        response = await api.post(
          "/daily-reports/",
          payload
        );
      }

      setExistingReport(response.data);

      setMessage(
        submitted
          ? "Daily report submitted successfully."
          : "Daily report saved as draft."
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Failed to save the daily report."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8fb] p-8">
        <p className="text-sm text-gray-500">
          Loading daily report...
        </p>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-[#fff8fb] p-8">
        <p className="text-red-600">
          Child could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8fb] p-6 md:p-8">

      {/* Header */}
      <div className="mb-6">

        <button
          onClick={() => navigate("/teacher")}
          className="mb-4 text-sm font-medium text-pink-600 hover:text-pink-700"
        >
          ← Back to My Children
        </button>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-sm font-medium text-pink-500">
              Daily Report
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-800">
              {child.first_name} {child.last_name}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {child.roll_number
                ? `Roll No. ${child.roll_number}`
                : "No roll number"}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-600">
              Report Date
            </label>

            <input
              type="date"
              value={reportDate}
              onChange={(e) =>
                setReportDate(e.target.value)
              }
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
            />
          </div>

        </div>
      </div>

      {message && (
        <div className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6">

        {/* Attendance */}
        <section className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-800">
            1. Attendance
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                updateField(
                  "attendance_present",
                  true
                )
              }
              className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                form.attendance_present
                  ? "bg-green-500 text-white"
                  : "border border-gray-200 text-gray-600"
              }`}
            >
              Present
            </button>

            <button
              type="button"
              onClick={() =>
                updateField(
                  "attendance_present",
                  false
                )
              }
              className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                !form.attendance_present
                  ? "bg-red-500 text-white"
                  : "border border-gray-200 text-gray-600"
              }`}
            >
              Absent
            </button>

          </div>

          {form.attendance_present && (
            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Arrival Time
                </label>

                <input
                  type="time"
                  value={form.arrival_time}
                  onChange={(e) =>
                    updateField(
                      "arrival_time",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Departure Time
                </label>

                <input
                  type="time"
                  value={form.departure_time}
                  onChange={(e) =>
                    updateField(
                      "departure_time",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                />
              </div>

            </div>
          )}

        </section>

        {/* Mood */}
        <section className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-800">
            2. Mood / Behaviour
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">

            {[
              ["happy", "Happy"],
              ["good", "Good"],
              ["normal", "Normal"],
              ["tired", "Tired"],
            ].map(([value, label]) => (

              <button
                key={value}
                type="button"
                onClick={() =>
                  updateField("mood", value)
                }
                className={`rounded-xl border px-4 py-4 text-sm font-semibold ${
                  form.mood === value
                    ? "border-pink-500 bg-pink-50 text-pink-600"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {label}
              </button>

            ))}

          </div>

        </section>

        {/* Meals */}
        <section className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-800">
            3. Meals
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            {[
              ["morning_snack", "Morning Snack"],
              ["lunch", "Lunch"],
            ].map(([field, label]) => (

              <div key={field}>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {label}
                </label>

                <select
                  value={
                    form[field as keyof ReportForm] as string
                  }
                  onChange={(e) =>
                    updateField(
                      field as keyof ReportForm,
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="">
                    Select
                  </option>
                  <option value="finished">
                    Finished
                  </option>
                  <option value="partial">
                    Partly
                  </option>
                  <option value="did_not_eat">
                    Did Not Eat
                  </option>
                </select>

              </div>

            ))}

          </div>

        </section>

        {/* Rest */}
        <section className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-800">
            4. Rest / Sleep
          </h2>

          <select
            value={form.rest_status}
            onChange={(e) =>
              updateField(
                "rest_status",
                e.target.value
              )
            }
            className="mt-5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm md:w-1/2"
          >
            <option value="">
              Select
            </option>
            <option value="slept">
              Slept
            </option>
            <option value="rested">
              Rested
            </option>
            <option value="did_not_rest">
              Did Not Rest
            </option>
          </select>

          {(form.rest_status === "slept" ||
            form.rest_status === "rested") && (
            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <input
                type="time"
                value={form.rest_start}
                onChange={(e) =>
                  updateField(
                    "rest_start",
                    e.target.value
                  )
                }
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm"
              />

              <input
                type="time"
                value={form.rest_end}
                onChange={(e) =>
                  updateField(
                    "rest_end",
                    e.target.value
                  )
                }
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm"
              />

            </div>
          )}

        </section>

        {/* Activities */}
        <section className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-800">
            5. Activities
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select all activities the child participated in.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">

            {activities.map((activity) => {

              const selected =
                form.activities.includes(activity.id);

              return (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() =>
                    toggleActivity(activity.id)
                  }
                  className={`rounded-xl border px-4 py-4 text-left text-sm font-medium ${
                    selected
                      ? "border-purple-500 bg-purple-50 text-purple-600"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {activity.name}
                </button>
              );
            })}

          </div>

        </section>

        {/* Participation */}
        <section className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-800">
            6. Participation
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-3">

            {[
              ["participated", "Participated"],
              ["partial", "Partially Participated"],
              ["not_participated", "Not Participated"],
            ].map(([value, label]) => (

              <button
                key={value}
                type="button"
                onClick={() =>
                  updateField(
                    "participation",
                    value
                  )
                }
                className={`rounded-xl border px-4 py-4 text-sm font-semibold ${
                  form.participation === value
                    ? "border-pink-500 bg-pink-50 text-pink-600"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {label}
              </button>

            ))}

          </div>

        </section>

        {/* Observation */}
        <section className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-gray-800">
            7. Teacher Observation
          </h2>

          <textarea
            rows={5}
            value={form.teacher_observation}
            onChange={(e) =>
              updateField(
                "teacher_observation",
                e.target.value
              )
            }
            placeholder="Write any important observation about the child's day..."
            className="mt-5 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
          />

        </section>

        {/* Actions */}
        <section className="sticky bottom-4 rounded-2xl border border-pink-100 bg-white p-4 shadow-lg">

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              disabled={saving}
              onClick={() => saveReport(false)}
              className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => saveReport(true)}
              className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Submit Daily Report"}
            </button>

          </div>

        </section>

      </div>

    </div>
  );
}

export default TeacherDailyReport;