"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Select a client"),
  campaignId: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  tax: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().min(0.01),
  rate: z.coerce.number().min(0),
});

function parseItems(formData: FormData) {
  const descriptions = formData.getAll("itemDescription");
  const quantities = formData.getAll("itemQuantity");
  const rates = formData.getAll("itemRate");

  const items = descriptions
    .map((description, i) => ({
      description: String(description),
      quantity: quantities[i],
      rate: rates[i],
    }))
    .filter((i) => i.description.trim().length > 0);

  const parsed = z.array(itemSchema).safeParse(items);
  return parsed;
}

async function nextInvoiceNumber() {
  const count = await prisma.invoice.count();
  return `INV-${String(count + 1).padStart(4, "0")}`;
}

export async function createInvoice(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = invoiceSchema.safeParse({
    clientId: formData.get("clientId"),
    campaignId: formData.get("campaignId") || undefined,
    status: formData.get("status"),
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate"),
    tax: formData.get("tax") || 0,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const items = parseItems(formData);
  if (!items.success || items.data.length === 0) {
    return { error: "Add at least one valid line item." };
  }

  const { clientId, campaignId, status, issueDate, dueDate, tax, notes } = parsed.data;

  const invoice = await prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      clientId,
      campaignId: campaignId || null,
      status,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      tax: tax || 0,
      notes,
      items: { create: items.data },
    },
  });

  revalidatePath("/invoices");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoice(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = invoiceSchema.safeParse({
    clientId: formData.get("clientId"),
    campaignId: formData.get("campaignId") || undefined,
    status: formData.get("status"),
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate"),
    tax: formData.get("tax") || 0,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const items = parseItems(formData);
  if (!items.success || items.data.length === 0) {
    return { error: "Add at least one valid line item." };
  }

  const { clientId, campaignId, status, issueDate, dueDate, tax, notes } = parsed.data;

  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        clientId,
        campaignId: campaignId || null,
        status,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        tax: tax || 0,
        notes,
        items: { create: items.data },
      },
    }),
  ]);

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  redirect(`/invoices/${id}`);
}

export async function updateInvoiceStatus(
  id: string,
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
) {
  await requireUser();
  await prisma.invoice.update({ where: { id }, data: { status } });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
  await requireUser();
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  redirect("/invoices");
}
