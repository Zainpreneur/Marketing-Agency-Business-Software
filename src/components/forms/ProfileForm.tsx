"use client";

import { useActionState } from "react";
import FormError from "@/components/FormError";
import SubmitButton from "@/components/SubmitButton";
import { updateProfile, updatePassword } from "@/lib/actions/users";

export function ProfileDetailsForm({ name, title }: { name: string; title: string | null }) {
  const [state, formAction] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="card p-6 space-y-4 max-w-md">
      <h2 className="font-semibold text-foreground">Your details</h2>
      <FormError message={state?.error} />
      {state?.success && <p className="text-sm text-emerald-600">Saved.</p>}
      <div>
        <label className="field-label" htmlFor="name">Full name</label>
        <input className="input" id="name" name="name" required defaultValue={name} />
      </div>
      <div>
        <label className="field-label" htmlFor="title">Title</label>
        <input className="input" id="title" name="title" defaultValue={title ?? ""} placeholder="Account Manager" />
      </div>
      <div className="flex justify-end">
        <SubmitButton pendingText="Saving…">Save</SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(updatePassword, undefined);

  return (
    <form action={formAction} className="card p-6 space-y-4 max-w-md">
      <h2 className="font-semibold text-foreground">Change password</h2>
      <FormError message={state?.error} />
      {state?.success && <p className="text-sm text-emerald-600">Password updated.</p>}
      <div>
        <label className="field-label" htmlFor="currentPassword">Current password</label>
        <input className="input" id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div>
        <label className="field-label" htmlFor="newPassword">New password</label>
        <input className="input" id="newPassword" name="newPassword" type="password" required minLength={8} />
      </div>
      <div className="flex justify-end">
        <SubmitButton pendingText="Updating…">Update password</SubmitButton>
      </div>
    </form>
  );
}
