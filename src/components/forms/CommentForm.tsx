"use client";

import { useActionState, useRef } from "react";
import FormError from "@/components/FormError";
import SubmitButton from "@/components/SubmitButton";
import type { FormState } from "@/lib/actions/tasks";

export default function CommentForm({
  action,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(async (prev: FormState, formData: FormData) => {
    const result = await action(prev, formData);
    if (!result?.error) formRef.current?.reset();
    return result;
  }, undefined);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <FormError message={state?.error} />
      <textarea className="input" name="body" rows={2} placeholder="Add a comment…" required />
      <div className="flex justify-end">
        <SubmitButton pendingText="Posting…">Comment</SubmitButton>
      </div>
    </form>
  );
}
