import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCampaign } from "@/lib/actions/campaigns";
import CampaignForm from "@/components/forms/CampaignForm";

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [campaign, clients, users] = await Promise.all([
    prisma.campaign.findUnique({ where: { id } }),
    prisma.client.findMany({ select: { id: true, company: true }, orderBy: { company: "asc" } }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!campaign) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit {campaign.name}</h1>
      </div>
      <CampaignForm
        action={updateCampaign.bind(null, campaign.id)}
        clients={clients.map((c) => ({ id: c.id, name: c.company }))}
        users={users}
        defaultValues={campaign}
        submitLabel="Save changes"
      />
    </div>
  );
}
