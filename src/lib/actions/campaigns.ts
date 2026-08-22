"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const campaignSchema = z.object({
  name: z.string().min(2, "Campaign name is required"),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]),
  channel: z.enum([
    "SOCIAL_MEDIA",
    "SEO",
    "PPC",
    "EMAIL",
    "CONTENT",
    "BRANDING",
    "PR",
    "EVENTS",
    "OTHER",
  ]),
  budget: z.coerce.number().min(0, "Budget must be positive"),
  spent: z.coerce.number().min(0, "Spent must be positive").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  clientId: z.string().min(1, "Select a client"),
  managerId: z.string().optional(),
});

function parseCampaignForm(formData: FormData) {
  return campaignSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    status: formData.get("status"),
    channel: formData.get("channel"),
    budget: formData.get("budget") || 0,
    spent: formData.get("spent") || 0,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    clientId: formData.get("clientId"),
    managerId: formData.get("managerId") || undefined,
  });
}

export async function createCampaign(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseCampaignForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { startDate, endDate, ...rest } = parsed.data;

  const campaign = await prisma.campaign.create({
    data: {
      ...rest,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      activities: {
        create: { message: `${user.name} created this campaign.`, userId: user.id, clientId: rest.clientId },
      },
    },
  });

  revalidatePath("/campaigns");
  revalidatePath(`/clients/${rest.clientId}`);
  redirect(`/campaigns/${campaign.id}`);
}

export async function updateCampaign(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = parseCampaignForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { startDate, endDate, ...rest } = parsed.data;

  await prisma.campaign.update({
    where: { id },
    data: {
      ...rest,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${id}`);
  redirect(`/campaigns/${id}`);
}

export async function deleteCampaign(id: string) {
  await requireUser();
  const campaign = await prisma.campaign.delete({ where: { id } });
  revalidatePath("/campaigns");
  revalidatePath(`/clients/${campaign.clientId}`);
  redirect("/campaigns");
}
