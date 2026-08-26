"use client";

import { useActionState } from "react";
import FormError from "@/components/FormError";
import SubmitButton from "@/components/SubmitButton";
import type { FormState } from "@/lib/actions/campaigns";
import { CHANNEL_LABELS } from "@/lib/utils";

type Option = { id: string; name: string };

function toDateInput(d?: Date | string | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export default function CampaignForm({
  action,
  clients,
  users,
  defaultValues,
  submitLabel = "Save campaign",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  clients: Option[];
  users: Option[];
  defaultValues?: {
    name?: string;
    description?: string | null;
    status?: string;
    channel?: string;
    budget?: number;
    spent?: number;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    clientId?: string;
    managerId?: string | null;
  };
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="card p-6 space-y-5 max-w-3xl">
      <FormError message={state?.error} />

      <div>
        <label className="field-label" htmlFor="name">Campaign name</label>
        <input className="input" id="name" name="name" required defaultValue={defaultValues?.name} placeholder="Spring Product Launch" />
      </div>

      <div>
        <label className="field-label" htmlFor="description">Description</label>
        <textarea className="input" id="description" name="description" rows={3} defaultValue={defaultValues?.description ?? ""} placeholder="Goals, scope, deliverables…" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="clientId">Client</label>
          <select className="input" id="clientId" name="clientId" required defaultValue={defaultValues?.clientId ?? ""}>
            <option value="" disabled>Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="managerId">Campaign manager</label>
          <select className="input" id="managerId" name="managerId" defaultValue={defaultValues?.managerId ?? ""}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="status">Status</label>
          <select className="input" id="status" name="status" defaultValue={defaultValues?.status ?? "PLANNING"}>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="channel">Channel</label>
          <select className="input" id="channel" name="channel" defaultValue={defaultValues?.channel ?? "OTHER"}>
            {Object.entries(CHANNEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="budget">Budget ($)</label>
          <input className="input" id="budget" name="budget" type="number" min={0} step="0.01" defaultValue={defaultValues?.budget ?? 0} />
        </div>
        <div>
          <label className="field-label" htmlFor="spent">Spent so far ($)</label>
          <input className="input" id="spent" name="spent" type="number" min={0} step="0.01" defaultValue={defaultValues?.spent ?? 0} />
        </div>
        <div>
          <label className="field-label" htmlFor="startDate">Start date</label>
          <input className="input" id="startDate" name="startDate" type="date" defaultValue={toDateInput(defaultValues?.startDate)} />
        </div>
        <div>
          <label className="field-label" htmlFor="endDate">End date</label>
          <input className="input" id="endDate" name="endDate" type="date" defaultValue={toDateInput(defaultValues?.endDate)} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
