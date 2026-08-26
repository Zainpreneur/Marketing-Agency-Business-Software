import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/DeleteButton";
import InvoiceStatusSelect from "@/components/InvoiceStatusSelect";
import PrintButton from "@/components/PrintButton";
import { deleteInvoice } from "@/lib/actions/invoices";
import { formatCurrency, formatDate, calcInvoiceTotals } from "@/lib/utils";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, campaign: true, items: true },
  });

  if (!invoice) notFound();

  const { subtotal, tax, total } = calcInvoiceTotals(invoice.items, invoice.tax);

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{invoice.number}</h1>
          <p className="text-sm text-muted mt-1">
            <Link href={`/clients/${invoice.client.id}`} className="hover:text-brand">{invoice.client.company}</Link>
            {invoice.campaign && <> · {invoice.campaign.name}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceStatusSelect id={invoice.id} status={invoice.status} />
          <Link href={`/invoices/${invoice.id}/edit`} className="btn btn-secondary">
            <Pencil size={15} /> Edit
          </Link>
          <PrintButton />
          <DeleteButton
            action={async () => {
              "use server";
              await deleteInvoice(invoice.id);
            }}
          />
        </div>
      </div>

      <div className="card p-8 print:border-0 print:shadow-none">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-lg font-bold text-foreground">Northstar Agency</h2>
            <p className="text-sm text-muted">123 Market Street, San Francisco, CA</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{invoice.number}</p>
            <p className="text-sm text-muted mt-1">Issued {formatDate(invoice.issueDate)}</p>
            <p className="text-sm text-muted">Due {formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-muted uppercase mb-1">Bill to</p>
          <p className="text-sm font-medium text-foreground">{invoice.client.company}</p>
          <p className="text-sm text-muted">{invoice.client.name}</p>
          <p className="text-sm text-muted">{invoice.client.email}</p>
          {invoice.client.address && <p className="text-sm text-muted">{invoice.client.address}</p>}
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="font-medium py-2">Description</th>
              <th className="font-medium py-2 text-right">Qty</th>
              <th className="font-medium py-2 text-right">Rate</th>
              <th className="font-medium py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="py-2 text-foreground">{item.description}</td>
                <td className="py-2 text-right text-muted">{item.quantity}</td>
                <td className="py-2 text-right text-muted">{formatCurrency(item.rate)}</td>
                <td className="py-2 text-right text-foreground">{formatCurrency(item.quantity * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-muted"><span>Tax ({invoice.tax}%)</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex justify-between font-semibold text-foreground text-base pt-2 border-t border-border"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>

        {invoice.notes && (
          <div className="mt-8 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted uppercase mb-1">Notes</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
