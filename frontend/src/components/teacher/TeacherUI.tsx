import type { ReactNode } from "react";

export const pageClass = "min-h-screen bg-[#fff8fb] p-5 md:p-7 xl:p-8";
export const maxClass = "max-w-7xl mx-auto";
export const cardClass =
  "bg-white rounded-3xl border border-pink-100/80 shadow-[0_8px_30px_rgba(53,35,67,0.05)]";
export const inputClass =
  "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#30435b] outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        <p className="text-sm font-semibold text-pink-500 mb-1">
          Teacher Portal
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#30435b]">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-[#718096]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  note,
  icon,
  tone = "pink",
}: {
  label: string;
  value: string | number;
  note?: string;
  icon: string;
  tone?: "pink" | "green" | "purple" | "amber";
}) {
  const tones = {
    pink: "bg-pink-50 border-pink-100 text-pink-600",
    green: "bg-green-50 border-green-100 text-green-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
    amber: "bg-amber-50 border-amber-100 text-amber-600",
  };
  return (
    <div
      className={`rounded-3xl border ${tones[tone]
        .split(" ")
        .filter((x) => x.startsWith("border"))
        .join(" ")} bg-white shadow-[0_8px_30px_rgba(53,35,67,0.05)] p-5`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-[#30435b]">{value}</p>
          {note && (
            <p
              className={`mt-1 text-xs font-semibold ${tones[tone].split(" ").find((x) => x.startsWith("text-"))}`}
            >
              {note}
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${tones[
            tone
          ]
            .split(" ")
            .filter((x) => x.startsWith("bg-"))
            .join(" ")}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon = "🌸",
  title,
  text,
}: {
  icon?: string;
  title: string;
  text: string;
}) {
  return (
    <div className="py-14 px-6 text-center">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-50 flex items-center justify-center text-2xl mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-[#30435b]">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">{text}</p>
    </div>
  );
}

export function LoadingCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-48 bg-white rounded-3xl border border-pink-100"
        />
      ))}
    </div>
  );
}

export function formatDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getLocalDate() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().split("T")[0];
}

export function initials(first: string, last: string) {
  return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();
}

export function getErrorMessage(
  error: any,
  fallback = "Something went wrong. Please try again.",
) {
  return (
    error?.response?.data?.detail || error?.response?.data?.message || fallback
  );
}
