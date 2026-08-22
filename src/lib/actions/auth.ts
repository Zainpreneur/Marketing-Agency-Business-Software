"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export type FormState = { error?: string } | undefined;

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }
}
