"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const taskSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().optional(),
  campaignId: z.string().optional(),
  assigneeId: z.string().optional(),
});

function parseTaskForm(formData: FormData) {
  return taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate") || undefined,
    campaignId: formData.get("campaignId") || undefined,
    assigneeId: formData.get("assigneeId") || undefined,
  });
}

export async function createTask(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = parseTaskForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { dueDate, ...rest } = parsed.data;

  await prisma.task.create({
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath("/tasks");
  if (rest.campaignId) revalidatePath(`/campaigns/${rest.campaignId}`);
  redirect("/tasks");
}

export async function updateTask(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = parseTaskForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { dueDate, ...rest } = parsed.data;

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath("/tasks");
  if (task.campaignId) revalidatePath(`/campaigns/${task.campaignId}`);
  redirect("/tasks");
}

export async function updateTaskStatus(id: string, status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE") {
  await requireUser();
  const task = await prisma.task.update({ where: { id }, data: { status } });
  revalidatePath("/tasks");
  if (task.campaignId) revalidatePath(`/campaigns/${task.campaignId}`);
}

export async function deleteTask(id: string) {
  await requireUser();
  const task = await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
  if (task.campaignId) revalidatePath(`/campaigns/${task.campaignId}`);
}

const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty"),
});

export async function addTaskComment(taskId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = commentSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.comment.create({
    data: { body: parsed.data.body, taskId, authorId: user.id },
  });

  revalidatePath(`/tasks/${taskId}`);
  return undefined;
}
