"use client";

import { useTransition } from "react";
import { updateUserRole } from "@/lib/actions/users";
import { ROLE_LABELS, cn } from "@/lib/utils";

export default function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      className={cn(
        "text-xs font-medium rounded-full border-0 py-1 pl-2 pr-6 ring-1 ring-inset ring-border bg-background",
        (pending || disabled) && "opacity-60"
      )}
      value={role}
      disabled={pending || disabled}
      onChange={(e) => {
        const next = e.target.value as "ADMIN" | "MANAGER" | "EMPLOYEE";
        startTransition(() => updateUserRole(userId, next));
      }}
    >
      {Object.entries(ROLE_LABELS).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}
