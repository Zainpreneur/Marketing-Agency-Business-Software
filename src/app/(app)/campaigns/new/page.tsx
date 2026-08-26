import { prisma } from "@/lib/prisma";
import { createCampaign } from "@/lib/actions/campaigns";
import CampaignForm from "@/components/forms/CampaignForm";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const [clients, users] = await Promise.all([
    prisma.client.findMany({ select: { id: true, company: true }, orderBy: { company: "asc" } }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New Campaign</h1>
        <p className="text-sm text-muted mt-1">Set up a new marketing campaign for a client.</p>
      </div>
      <CampaignForm
        action={createCampaign}
        clients={clients.map((c) => ({ id: c.id, name: c.company }))}
        users={users}
        defaultValues={clientId ? { clientId } : undefined}
        submitLabel="Create campaign"
      />
    </div>
  );
}
