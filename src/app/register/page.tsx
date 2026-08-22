"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { registerUser } from "@/lib/actions/users";
import FormError from "@/components/FormError";
import SubmitButton from "@/components/SubmitButton";

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white mb-3">
            <Compass size={24} />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Create your workspace</h1>
          <p className="text-sm text-muted mt-1 text-center">
            The first account created becomes the workspace admin.
          </p>
        </div>

        <form action={formAction} className="card p-6 space-y-4">
          <FormError message={state?.error} />
          <div>
            <label className="field-label" htmlFor="name">Full name</label>
            <input className="input" id="name" name="name" required placeholder="Jordan Lee" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" required placeholder="you@agency.com" />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
          </div>
          <SubmitButton className="w-full" pendingText="Creating account…">Create account</SubmitButton>
        </form>

        <p className="text-center text-sm text-muted mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-brand font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
