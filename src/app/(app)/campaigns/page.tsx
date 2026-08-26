import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/Badge";
import { STATUS_LABELS, CHANNEL_LABELS, formatCurrency, formatDate } from "@/lib/utils";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const campaigns = await prisma.campaign.findMany({
    where: status ? { status: status as never } : {},
    include: { client: true, manager: true, tasks: true },
    orderBy: { createdAt: "desc" },
  });

  const statuses = ["PLANNING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link href="/campaigns" className={`btn ${!status ? "btn-primary" : "btn-secondary"}`}>All</Link>
          {statuses.map((s) => (
            <Link key={s} href={`/campaigns?status=${s}`} className={`btn ${status === s ? "btn-primary" : "btn-secondary"}`}>
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
        <Link href="/campaigns/new" className="btn btn-primary shrink-0">
          <Plus size={16} /> New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((c) => {
          const pct = c.budget > 0 ? Math.min(100, Math.round((c.spent / c.budget) * 100)) : 0;
          const doneTasks = c.tasks.filter((t) => t.status === "DONE").length;
          return (
            <Link key={c.id} href={`/campaigns/${c.id}`} className="card p-5 hover:border-brand transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground leading-tight">{c.name}</h3>
                <Badge value={c.status} label={STATUS_LABELS[c.status]} />
              </div>
              <p className="text-xs text-muted mb-3">{c.client.company} · {CHANNEL_LABELS[c.channel]}</p>

              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs text-muted">
                  <span>{formatCurrency(c.spent)} spent</span>
                  <span>{formatCurrency(c.budget)} budget</span>
                </div>
                <div className="h-1.5 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted">
                <span>{doneTasks}/{c.tasks.length} tasks done</span>
                <span>{formatDate(c.endDate)}</span>
              </div>
            </Link>
          );
        })}
      </div>
      {campaigns.length === 0 && (
        <p className="text-sm text-muted text-center py-10 card">No campaigns found.</p>
      )}
    </div>
  );
}
