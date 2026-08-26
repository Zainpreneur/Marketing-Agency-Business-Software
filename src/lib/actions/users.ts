"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/session";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export type FormState = { error?: string; success?: boolean } | undefined;

const AVATAR_COLORS = ["#4f46e5", "#0ea5e9", "#059669", "#d97706", "#dc2626", "#7c3aed", "#db2777"];
function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  // The very first account created becomes an Admin so the app is usable immediately.
  const userCount = await prisma.user.count();
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: userCount === 0 ? "ADMIN" : "EMPLOYEE",
      avatarColor: randomColor(),
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Please log in." };
    }
    throw err;
  }
}

const teamMemberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
  title: z.string().optional(),
});

export async function createTeamMember(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole(["ADMIN"]);

  const parsed = teamMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    title: formData.get("title") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password, role, title } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  await prisma.user.create({
    data: {
      name,
      email,
      title,
      role,
      passwordHash: await bcrypt.hash(password, 10),
      avatarColor: randomColor(),
    },
  });

  revalidatePath("/team");
  redirect("/team");
}

export async function updateUserRole(userId: string, role: "ADMIN" | "MANAGER" | "EMPLOYEE") {
  const me = await requireRole(["ADMIN"]);
  if (me.id === userId && role !== "ADMIN") {
    throw new Error("You cannot remove your own admin access.");
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/team");
}

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  title: z.string().optional(),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.user.update({
    where: { id: me.id },
    data: { name: parsed.data.name, title: parsed.data.title },
  });
  revalidatePath("/profile");
  return { success: true };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  });

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireUser();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) return { error: "User not found." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  await prisma.user.update({
    where: { id: me.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });
  return { success: true };
}
