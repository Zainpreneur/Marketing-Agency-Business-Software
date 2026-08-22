import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  // client / campaign status
  LEAD: "bg-sky-50 text-sky-700 ring-sky-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PAUSED: "bg-amber-50 text-amber-700 ring-amber-200",
  CHURNED: "bg-rose-50 text-rose-700 ring-rose-200",
  PLANNING: "bg-violet-50 text-violet-700 ring-violet-200",
  COMPLETED: "bg-slate-100 text-slate-700 ring-slate-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
  // task status
  TODO: "bg-slate-100 text-slate-700 ring-slate-200",
  IN_PROGRESS: "bg-sky-50 text-sky-700 ring-sky-200",
  IN_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  // priority
  LOW: "bg-slate-100 text-slate-600 ring-slate-200",
  MEDIUM: "bg-sky-50 text-sky-700 ring-sky-200",
  HIGH: "bg-amber-50 text-amber-700 ring-amber-200",
  URGENT: "bg-rose-50 text-rose-700 ring-rose-200",
  // invoice status
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
  SENT: "bg-sky-50 text-sky-700 ring-sky-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OVERDUE: "bg-rose-50 text-rose-700 ring-rose-200",
  // roles
  ADMIN: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  MANAGER: "bg-violet-50 text-violet-700 ring-violet-200",
  EMPLOYEE: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        COLOR_MAP[value] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      )}
    >
      {label ?? value}
    </span>
  );
}
