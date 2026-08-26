"use client";

import { useTransition } from "react";
import { updateInvoiceStatus } from "@/lib/actions/invoices";
import { cn } from "@/lib/utils";

const OPTIONS = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"] as const;

export default function InvoiceStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className={cn(
        "text-sm font-medium rounded-lg border border-border py-1.5 px-2 bg-surface",
        pending && "opacity-60"
      )}
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as (typeof OPTIONS)[number];
        startTransition(() => updateInvoiceStatus(id, next));
      }}
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>{o.charAt(0) + o.slice(1).toLowerCase()}</option>
      ))}
    </select>
  );
}
