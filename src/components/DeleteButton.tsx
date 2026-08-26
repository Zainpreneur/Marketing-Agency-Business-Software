"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeleteButton({
  action,
  confirmText = "Are you sure? This cannot be undone.",
  label = "Delete",
  iconOnly = false,
}: {
  action: () => Promise<void>;
  confirmText?: string;
  label?: string;
  iconOnly?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className={cn("btn btn-danger", iconOnly && "px-2")}
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) {
          startTransition(() => action());
        }
      }}
    >
      <Trash2 size={15} />
      {!iconOnly && (pending ? "Deleting…" : label)}
    </button>
  );
}
