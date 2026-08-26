import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/Badge";
import Avatar from "@/components/Avatar";
import { STATUS_LABELS } from "@/lib/utils";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  const clients = await prisma.client.findMany({
    where: {
      AND: [
        status ? { status: status as never } : {},
        q
          ? {
              OR: [
                { company: { contains: q } },
                { name: { contains: q } },
                { email: { contains: q } },
              ],
            }
          : {},
      ],
    },
    include: { owner: true, _count: { select: { campaigns: true } } },
    orderBy: { createdAt: "desc" },
  });

  const statuses = ["LEAD", "ACTIVE", "PAUSED", "CHURNED"];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form className="flex items-center gap-2 flex-1 max-w-md" action="/clients">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9"
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search clients…"
            />
          </div>
          {status && <input type="hidden" name="status" value={status} />}
        </form>
        <Link href="/clients/new" className="btn btn-primary shrink-0">
          <Plus size={16} /> New Client
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={q ? `/clients?q=${q}` : "/clients"}
          className={`btn ${!status ? "btn-primary" : "btn-secondary"}`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/clients?status=${s}${q ? `&q=${q}` : ""}`}
            className={`btn ${status === s ? "btn-primary" : "btn-secondary"}`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="font-medium px-4 py-3">Company</th>
              <th className="font-medium px-4 py-3">Contact</th>
              <th className="font-medium px-4 py-3">Status</th>
              <th className="font-medium px-4 py-3">Campaigns</th>
              <th className="font-medium px-4 py-3">Owner</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-background/60">
                <td className="px-4 py-3">
                  <Link href={`/clients/${c.id}`} className="flex items-center gap-3 font-medium text-foreground hover:text-brand">
                    <Avatar name={c.company} color={c.logoColor} size={30} />
                    {c.company}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  <div>{c.name}</div>
                  <div className="text-xs">{c.email}</div>
                </td>
                <td className="px-4 py-3"><Badge value={c.status} label={STATUS_LABELS[c.status]} /></td>
                <td className="px-4 py-3 text-muted">{c._count.campaigns}</td>
                <td className="px-4 py-3 text-muted">{c.owner?.name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="text-sm text-muted text-center py-10">No clients found.</p>
        )}
      </div>
    </div>
  );
}
