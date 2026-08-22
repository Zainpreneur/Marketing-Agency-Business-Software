import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Mail, Phone, Globe, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import DeleteButton from "@/components/DeleteButton";
import { deleteClient } from "@/lib/actions/clients";
import { formatCurrency, formatDate, calcInvoiceTotals, STATUS_LABELS, CHANNEL_LABELS } from "@/lib/utils";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      owner: true,
      campaigns: { include: { manager: true, tasks: true }, orderBy: { createdAt: "desc" } },
      invoices: { include: { items: true }, orderBy: { issueDate: "desc" } },
      activities: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 8 },
    },
  });

  if (!client) notFound();

  const totalBudget = client.campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = client.campaigns.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={client.company} color={client.logoColor} size={52} />
          <div>
            <h1 className="text-xl font-semibold text-foreground">{client.company}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge value={client.status} label={STATUS_LABELS[client.status]} />
              {client.industry && <span className="text-sm text-muted">{client.industry}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${client.id}/edit`} className="btn btn-secondary">
            <Pencil size={15} /> Edit
          </Link>
          <DeleteButton
            action={async () => {
              "use server";
              await deleteClient(client.id);
            }}
            confirmText={`Delete ${client.company}? This removes all related campaigns, tasks, and invoices.`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-foreground mb-1">Contact</h2>
          <div className="flex items-center gap-2 text-sm text-muted"><Mail size={15} /> {client.email}</div>
          {client.phone && <div className="flex items-center gap-2 text-sm text-muted"><Phone size={15} /> {client.phone}</div>}
          {client.website && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Globe size={15} />
              <a href={client.website} target="_blank" className="hover:text-brand truncate">{client.website}</a>
            </div>
          )}
          {client.address && <div className="flex items-center gap-2 text-sm text-muted"><MapPin size={15} /> {client.address}</div>}
          <div className="pt-2 border-t border-border text-sm text-muted">
            Primary contact: <span className="text-foreground font-medium">{client.name}</span>
          </div>
          <div className="text-sm text-muted">
            Account owner: <span className="text-foreground font-medium">{client.owner?.name ?? "Unassigned"}</span>
          </div>
          {client.notes && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted font-semibold mb-1">Notes</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Campaigns</h2>
            <Link href={`/campaigns/new?clientId=${client.id}`} className="btn btn-secondary">
              <Plus size={15} /> New
            </Link>
          </div>
          {client.campaigns.length === 0 && <p className="text-sm text-muted py-6 text-center">No campaigns yet.</p>}
          <ul className="divide-y divide-border">
            {client.campaigns.map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/campaigns/${c.id}`} className="text-sm font-medium text-foreground hover:text-brand truncate block">
                    {c.name}
                  </Link>
                  <p className="text-xs text-muted">{CHANNEL_LABELS[c.channel]} · {c.tasks.length} tasks</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted">{formatCurrency(c.spent)} / {formatCurrency(c.budget)}</span>
                  <Badge value={c.status} label={STATUS_LABELS[c.status]} />
                </div>
              </li>
            ))}
          </ul>
          {client.campaigns.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border text-xs text-muted">
              Total budget {formatCurrency(totalBudget)} · spent {formatCurrency(totalSpent)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Invoices</h2>
            <Link href={`/invoices/new?clientId=${client.id}`} className="btn btn-secondary">
              <Plus size={15} /> New
            </Link>
          </div>
          {client.invoices.length === 0 && <p className="text-sm text-muted py-6 text-center">No invoices yet.</p>}
          <ul className="divide-y divide-border">
            {client.invoices.map((inv) => {
              const { total } = calcInvoiceTotals(inv.items, inv.tax);
              return (
                <li key={inv.id} className="py-3 flex items-center justify-between gap-3">
                  <Link href={`/invoices/${inv.id}`} className="text-sm font-medium text-foreground hover:text-brand">
                    {inv.number}
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{formatCurrency(total)}</span>
                    <Badge value={inv.status} label={STATUS_LABELS[inv.status]} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-foreground mb-3">Activity</h2>
          {client.activities.length === 0 && <p className="text-sm text-muted py-6 text-center">No activity yet.</p>}
          <ul className="space-y-3">
            {client.activities.map((a) => (
              <li key={a.id} className="text-sm">
                <span className="text-foreground">{a.message}</span>
                <span className="text-xs text-muted ml-2">{formatDate(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
