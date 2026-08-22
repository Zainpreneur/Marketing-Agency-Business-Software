import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import TeamMemberForm from "@/components/forms/TeamMemberForm";

export default async function NewTeamMemberPage() {
  const me = await requireUser();
  if (me.role !== "ADMIN") redirect("/team");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New Team Member</h1>
        <p className="text-sm text-muted mt-1">They can sign in immediately with the temporary password.</p>
      </div>
      <TeamMemberForm />
    </div>
  );
}
