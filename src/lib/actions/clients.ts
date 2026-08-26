"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const LOGO_COLORS = ["#0ea5e9", "#6366f1", "#059669", "#d97706", "#db2777", "#7c3aed"];
function randomColor() {
  return LOGO_COLORS[Math.floor(Math.random() * LOGO_COLORS.length)];
}

const clientSchema = z.object({
  name: z.string().min(2, "Contact name is required"),
  company: z.string().min(2, "Company name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  status: z.enum(["LEAD", "ACTIVE", "PAUSED", "CHURNED"]),
  notes: z.string().optional(),
  ownerId: z.string().optional(),
});

function parseClientForm(formData: FormData) {
  return clientSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    industry: formData.get("industry") || undefined,
    website: formData.get("website") || undefined,
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
    ownerId: formData.get("ownerId") || undefined,
  });
}

export async function createClient(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseClientForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const client = await prisma.client.create({
    data: {
      ...parsed.data,
      ownerId: parsed.data.ownerId || user.id,
      logoColor: randomColor(),
      activities: {
        create: { message: `${user.name} added this client.`, userId: user.id },
      },
    },
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = parseClientForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.client.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  await requireUser();
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
  redirect("/clients");
}
