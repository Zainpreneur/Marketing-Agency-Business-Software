import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/Badge";
import { STATUS_LABELS, formatCurrency, formatDate, calcInvoiceTotals } from "@/lib/utils";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const invoices = await prisma.invoice.findMany({
    where: status ? { status: status as never } : {},
    include: { client: true, items: true },
    orderBy: { issueDate: "desc" },
  });

  const statuses = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];
  const totals = invoices.map((inv) => ({ ...inv, ...calcInvoiceTotals(inv.items, inv.tax) }));
  const outstanding = totals
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link href="/invoices" className={`btn ${!status ? "btn-primary" : "btn-secondary"}`}>All</Link>
          {statuses.map((s) => (
            <Link key={s} href={`/invoices?status=${s}`} className={`btn ${status === s ? "btn-primary" : "btn-secondary"}`}>
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>
        <Link href="/invoices/new" className="btn btn-primary shrink-0">
          <Plus size={16} /> New Invoice
        </Link>
      </div>

      <p className="text-sm text-muted">Outstanding balance: <span className="font-semibold text-foreground">{formatCurrency(outstanding)}</span></p>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="font-medium px-4 py-3">Number</th>
              <th className="font-medium px-4 py-3">Client</th>
              <th className="font-medium px-4 py-3">Issued</th>
              <th className="font-medium px-4 py-3">Due</th>
              <th className="font-medium px-4 py-3">Total</th>
              <th className="font-medium px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {totals.map((inv) => (
              <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-background/60">
                <td className="px-4 py-3">
                  <Link href={`/invoices/${inv.id}`} className="font-medium text-foreground hover:text-brand">{inv.number}</Link>
                </td>
                <td className="px-4 py-3 text-muted">{inv.client.company}</td>
                <td className="px-4 py-3 text-muted">{formatDate(inv.issueDate)}</td>
                <td className="px-4 py-3 text-muted">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3 text-foreground font-medium">{formatCurrency(inv.total)}</td>
                <td className="px-4 py-3"><Badge value={inv.status} label={STATUS_LABELS[inv.status]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <p className="text-sm text-muted text-center py-10">No invoices found.</p>}
      </div>
    </div>
  );
}
