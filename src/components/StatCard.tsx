import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "brand",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  accent?: "brand" | "emerald" | "amber" | "rose";
}) {
  const accents: Record<string, string> = {
    brand: "bg-brand-light text-brand",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="card p-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-muted font-medium">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold text-foreground">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
      <div className={cn("rounded-lg p-2.5", accents[accent])}>
        <Icon size={20} />
      </div>
    </div>
  );
}
