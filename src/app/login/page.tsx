"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import FormError from "@/components/FormError";
import SubmitButton from "@/components/SubmitButton";

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white mb-3">
            <Compass size={24} />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted mt-1">Sign in to Northstar</p>
        </div>

        <form action={formAction} className="card p-6 space-y-4">
          <FormError message={state?.error} />
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" required placeholder="you@agency.com" />
          </div>
          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" required placeholder="••••••••" />
          </div>
          <SubmitButton className="w-full" pendingText="Signing in…">Sign in</SubmitButton>
        </form>

        <p className="text-center text-sm text-muted mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
