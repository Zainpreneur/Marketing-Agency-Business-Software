import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/** Returns the current session's user, redirecting to /login if absent. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

/** Throws if the current user's role is not one of `roles`. Use inside server actions. */
export async function requireRole(roles: Array<"ADMIN" | "MANAGER" | "EMPLOYEE">) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }
  if (!roles.includes(session.user.role as "ADMIN" | "MANAGER" | "EMPLOYEE")) {
    throw new Error("You do not have permission to perform this action.");
  }
  return session.user;
}
