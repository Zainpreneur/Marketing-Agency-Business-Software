"use client";

import { useActionState } from "react";
import FormError from "@/components/FormError";
import SubmitButton from "@/components/SubmitButton";
import { createTeamMember, type FormState } from "@/lib/actions/users";

export default function TeamMemberForm() {
  const [state, formAction] = useActionState(createTeamMember, undefined satisfies FormState);

  return (
    <form action={formAction} className="card p-6 space-y-5 max-w-xl">
      <FormError message={state?.error} />

      <div>
        <label className="field-label" htmlFor="name">Full name</label>
        <input className="input" id="name" name="name" required placeholder="Jordan Lee" />
      </div>
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" required placeholder="jordan@agency.com" />
      </div>
      <div>
        <label className="field-label" htmlFor="password">Temporary password</label>
        <input className="input" id="password" name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="title">Title</label>
          <input className="input" id="title" name="title" placeholder="Account Manager" />
        </div>
        <div>
          <label className="field-label" htmlFor="role">Role</label>
          <select className="input" id="role" name="role" defaultValue="EMPLOYEE">
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton pendingText="Creating…">Create team member</SubmitButton>
      </div>
    </form>
  );
}
