"use client";

import { useActionState } from "react";
import FormError from "@/components/FormError";
import SubmitButton from "@/components/SubmitButton";
import type { FormState } from "@/lib/actions/tasks";

type Option = { id: string; name: string };

function toDateInput(d?: Date | string | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export default function TaskForm({
  action,
  campaigns,
  users,
  defaultValues,
  submitLabel = "Save task",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  campaigns: Option[];
  users: Option[];
  defaultValues?: {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    dueDate?: Date | string | null;
    campaignId?: string | null;
    assigneeId?: string | null;
  };
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="card p-6 space-y-5 max-w-2xl">
      <FormError message={state?.error} />

      <div>
        <label className="field-label" htmlFor="title">Title</label>
        <input className="input" id="title" name="title" required defaultValue={defaultValues?.title} placeholder="Draft social copy for launch" />
      </div>

      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <textarea className="input" id="description" name="description" rows={3} defaultValue={defaultValues?.description ?? ""} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="campaignId">Campaign</label>
          <select className="input" id="campaignId" name="campaignId" defaultValue={defaultValues?.campaignId ?? ""}>
            <option value="">Unlinked</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="assigneeId">Assignee</label>
          <select className="input" id="assigneeId" name="assigneeId" defaultValue={defaultValues?.assigneeId ?? ""}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="status">Status</label>
          <select className="input" id="status" name="status" defaultValue={defaultValues?.status ?? "TODO"}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="priority">Priority</label>
          <select className="input" id="priority" name="priority" defaultValue={defaultValues?.priority ?? "MEDIUM"}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="dueDate">Due date</label>
          <input className="input" id="dueDate" name="dueDate" type="date" defaultValue={toDateInput(defaultValues?.dueDate)} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
