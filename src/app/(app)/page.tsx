import Link from "next/link";
import { Users, Megaphone, Receipt, ListChecks, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import Avatar from "@/components/Avatar";
import { RevenueChart, CampaignStatusChart } from "@/components/DashboardCharts";
import { formatCurrency, formatDate, calcInvoiceTotals, STATUS_LABELS } from "@/lib/utils";

export default async function DashboardPage() {
  const [clientCount, activeCampaigns, campaignsByStatus, invoices, upcomingTasks, activities] =
    await Promise.all([
      prisma.client.count(),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.campaign.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.invoice.findMany({ include: { items: true }, orderBy: { issueDate: "desc" } }),
      prisma.task.findMany({
        where: { status: { not: "DONE" } },
        include: { assignee: true, campaign: { include: { client: true } } },
        orderBy: { dueDate: "asc" },
        take: 6,
      }),
      prisma.activity.findMany({
        include: { user: true, client: true, campaign: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

  const invoicesWithTotals = invoices.map((inv) => ({
    ...inv,
    ...calcInvoiceTotals(inv.items, inv.tax),
  }));

  const outstanding = invoicesWithTotals
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + i.total, 0);

  const now = new Date();
  const months: { key: string; month: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  const revenueByMonth = months.map(({ key, month }) => {
    const revenue = invoicesWithTotals
      .filter((i) => {
        const d = new Date(i.issueDate);
        return `${d.getFullYear()}-${d.getMonth()}` === key && i.status !== "CANCELLED";
      })
      .reduce((sum, i) => sum + i.total, 0);
    return { month, revenue: Math.round(revenue) };
  });

  const statusOrder = ["PLANNING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"];
  const campaignStatusData = statusOrder.map((s) => ({
    name: STATUS_LABELS[s],
    value: campaignsByStatus.find((c) => c.status === s)?._count._all ?? 0,
  }));

  const dueSoonCount = upcomingTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate).getTime() < now.getTime() + 7 * 86400000
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={String(clientCount)} icon={Users} accent="brand" />
        <StatCard label="Active Campaigns" value={String(activeCampaigns)} icon={Megaphone} accent="emerald" />
        <StatCard
          label="Outstanding Revenue"
          value={formatCurrency(outstanding)}
          icon={Receipt}
          accent="amber"
          hint="Sent + overdue invoices"
        />
        <StatCard
          label="Tasks Due Soon"
          value={String(dueSoonCount)}
          icon={ListChecks}
          accent="rose"
          hint="Within the next 7 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-foreground mb-1">Revenue</h2>
          <p className="text-xs text-muted mb-2">Invoiced totals over the last 6 months</p>
          <RevenueChart data={revenueByMonth} />
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-foreground mb-1">Campaigns by Status</h2>
          <p className="text-xs text-muted mb-2">Across all clients</p>
          <CampaignStatusChart data={campaignStatusData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Upcoming Tasks</h2>
            <Link href="/tasks" className="text-sm text-brand font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {upcomingTasks.length === 0 && <p className="text-sm text-muted py-6 text-center">No open tasks.</p>}
          <ul className="divide-y divide-border">
            {upcomingTasks.map((task) => (
              <li key={task.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/tasks/${task.id}`} className="text-sm font-medium text-foreground hover:text-brand truncate block">
                    {task.title}
                  </Link>
                  <p className="text-xs text-muted truncate">
                    {task.campaign ? `${task.campaign.client.company} · ${task.campaign.name}` : "Unlinked task"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge value={task.priority} />
                  <span className="text-xs text-muted">{formatDate(task.dueDate)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-foreground mb-3">Recent Activity</h2>
          {activities.length === 0 && <p className="text-sm text-muted py-6 text-center">No activity yet.</p>}
          <ul className="space-y-4">
            {activities.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <Avatar name={a.user?.name ?? "System"} color={a.user?.avatarColor} size={28} />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="text-xs text-muted mt-0.5">{formatDate(a.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
