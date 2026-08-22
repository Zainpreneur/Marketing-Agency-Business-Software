"use client";

import { useTransition } from "react";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
];

export default function TaskStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className={cn(
        "text-xs font-medium rounded-full border-0 py-1 pl-2 pr-6 ring-1 ring-inset ring-border bg-background",
        pending && "opacity-60"
      )}
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
        startTransition(() => updateTaskStatus(id, next));
      }}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
