import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateInvoice } from "@/lib/actions/invoices";
import InvoiceForm from "@/components/forms/InvoiceForm";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, clients, campaigns] = await Promise.all([
    prisma.invoice.findUnique({ where: { id }, include: { items: true } }),
    prisma.client.findMany({ select: { id: true, company: true }, orderBy: { company: "asc" } }),
    prisma.campaign.findMany({ include: { client: true }, orderBy: { createdAt: "desc" } }),
  ]);

  if (!invoice) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit {invoice.number}</h1>
      </div>
      <InvoiceForm
        action={updateInvoice.bind(null, invoice.id)}
        clients={clients.map((c) => ({ id: c.id, name: c.company }))}
        campaigns={campaigns.map((c) => ({ id: c.id, name: c.name, clientId: c.clientId }))}
        defaultValues={{ ...invoice, campaignId: invoice.campaignId }}
        submitLabel="Save changes"
      />
    </div>
  );
}
