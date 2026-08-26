import { prisma } from "@/lib/prisma";
import { createInvoice } from "@/lib/actions/invoices";
import InvoiceForm from "@/components/forms/InvoiceForm";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; campaignId?: string }>;
}) {
  const { clientId, campaignId } = await searchParams;
  const [clients, campaigns] = await Promise.all([
    prisma.client.findMany({ select: { id: true, company: true }, orderBy: { company: "asc" } }),
    prisma.campaign.findMany({ include: { client: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New Invoice</h1>
      </div>
      <InvoiceForm
        action={createInvoice}
        clients={clients.map((c) => ({ id: c.id, name: c.company }))}
        campaigns={campaigns.map((c) => ({ id: c.id, name: c.name, clientId: c.clientId }))}
        defaultValues={{ clientId, campaignId }}
        submitLabel="Create invoice"
      />
    </div>
  );
}
