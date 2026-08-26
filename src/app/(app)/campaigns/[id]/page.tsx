import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/Badge";
import Avatar from "@/components/Avatar";
import DeleteButton from "@/components/DeleteButton";
import TaskStatusSelect from "@/components/TaskStatusSelect";
import { deleteCampaign } from "@/lib/actions/campaigns";
import {
  STATUS_LABELS,
  CHANNEL_LABELS,
  formatCurrency,
  formatDate,
  calcInvoiceTotals,
} from "@/lib/utils";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      client: true,
      manager: true,
      tasks: { include: { assignee: true }, orderBy: { dueDate: "asc" } },
      invoices: { include: { items: true } },
    },
  });

  if (!campaign) notFound();

  const pct = campaign.budget > 0 ? Math.min(100, Math.round((campaign.spent / campaign.budget) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold text-foreground">{campaign.name}</h1>
            <Badge value={campaign.status} label={STATUS_LABELS[campaign.status]} />
          </div>
          <p className="text-sm text-muted mt-1">
            <Link href={`/clients/${campaign.client.id}`} className="hover:text-brand">{campaign.client.company}</Link>
            {" · "}{CHANNEL_LABELS[campaign.channel]}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/campaigns/${campaign.id}/edit`} className="btn btn-secondary">
            <Pencil size={15} /> Edit
          </Link>
          <DeleteButton
            action={async () => {
              "use server";
              await deleteCampaign(campaign.id);
            }}
            confirmText={`Delete ${campaign.name}? This removes its tasks too.`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-foreground">Overview</h2>
          {campaign.description && <p className="text-sm text-muted whitespace-pre-wrap">{campaign.description}</p>}
          <div className="text-sm text-muted">
            Manager: <span className="text-foreground font-medium">{campaign.manager?.name ?? "Unassigned"}</span>
          </div>
          <div className="text-sm text-muted">
            {formatDate(campaign.startDate)} → {formatDate(campaign.endDate)}
          </div>
          <div className="pt-2 border-t border-border space-y-1">
            <div className="flex justify-between text-xs text-muted">
              <span>{formatCurrency(campaign.spent)} spent</span>
              <span>{formatCurrency(campaign.budget)} budget</span>
            </div>
            <div className="h-1.5 rounded-full bg-background overflow-hidden">
              <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Tasks</h2>
            <Link href={`/tasks/new?campaignId=${campaign.id}`} className="btn btn-secondary">
              <Plus size={15} /> New
            </Link>
          </div>
          {campaign.tasks.length === 0 && <p className="text-sm text-muted py-6 text-center">No tasks yet.</p>}
          <ul className="divide-y divide-border">
            {campaign.tasks.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-3">
                  {t.assignee && <Avatar name={t.assignee.name} color={t.assignee.avatarColor} size={26} />}
                  <div className="min-w-0">
                    <Link href={`/tasks/${t.id}`} className="text-sm font-medium text-foreground hover:text-brand truncate block">
                      {t.title}
                    </Link>
                    <p className="text-xs text-muted">{formatDate(t.dueDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge value={t.priority} />
                  <TaskStatusSelect id={t.id} status={t.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Invoices</h2>
          <Link href={`/invoices/new?clientId=${campaign.client.id}&campaignId=${campaign.id}`} className="btn btn-secondary">
            <Plus size={15} /> New invoice
          </Link>
        </div>
        {campaign.invoices.length === 0 && <p className="text-sm text-muted py-6 text-center">No invoices linked to this campaign.</p>}
        <ul className="divide-y divide-border">
          {campaign.invoices.map((inv) => {
            const { total } = calcInvoiceTotals(inv.items, inv.tax);
            return (
              <li key={inv.id} className="py-3 flex items-center justify-between">
                <Link href={`/invoices/${inv.id}`} className="text-sm font-medium text-foreground hover:text-brand">{inv.number}</Link>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{formatCurrency(total)}</span>
                  <Badge value={inv.status} label={STATUS_LABELS[inv.status]} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
