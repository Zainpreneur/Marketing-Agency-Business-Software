"use client";

import { useActionState } from "react";
import FormError from "@/components/FormError";
import SubmitButton from "@/components/SubmitButton";
import type { FormState } from "@/lib/actions/clients";

type Option = { id: string; name: string };

export default function ClientForm({
  action,
  users,
  defaultValues,
  submitLabel = "Save client",
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  users: Option[];
  defaultValues?: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string | null;
    address?: string | null;
    industry?: string | null;
    website?: string | null;
    status?: string;
    notes?: string | null;
    ownerId?: string | null;
  };
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="card p-6 space-y-5 max-w-3xl">
      <FormError message={state?.error} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="company">Company</label>
          <input className="input" id="company" name="company" required defaultValue={defaultValues?.company} placeholder="Acme Corp" />
        </div>
        <div>
          <label className="field-label" htmlFor="name">Primary contact</label>
          <input className="input" id="name" name="name" required defaultValue={defaultValues?.name} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required defaultValue={defaultValues?.email} placeholder="jane@acme.com" />
        </div>
        <div>
          <label className="field-label" htmlFor="phone">Phone</label>
          <input className="input" id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} placeholder="(555) 010-0000" />
        </div>
        <div>
          <label className="field-label" htmlFor="industry">Industry</label>
          <input className="input" id="industry" name="industry" defaultValue={defaultValues?.industry ?? ""} placeholder="E-commerce" />
        </div>
        <div>
          <label className="field-label" htmlFor="website">Website</label>
          <input className="input" id="website" name="website" defaultValue={defaultValues?.website ?? ""} placeholder="https://acme.com" />
        </div>
        <div>
          <label className="field-label" htmlFor="status">Status</label>
          <select className="input" id="status" name="status" defaultValue={defaultValues?.status ?? "LEAD"}>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="CHURNED">Churned</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="ownerId">Account owner</label>
          <select className="input" id="ownerId" name="ownerId" defaultValue={defaultValues?.ownerId ?? ""}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="address">Address</label>
        <input className="input" id="address" name="address" defaultValue={defaultValues?.address ?? ""} placeholder="123 Market St, San Francisco, CA" />
      </div>

      <div>
        <label className="field-label" htmlFor="notes">Notes</label>
        <textarea className="input" id="notes" name="notes" rows={3} defaultValue={defaultValues?.notes ?? ""} placeholder="Anything the team should know…" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
