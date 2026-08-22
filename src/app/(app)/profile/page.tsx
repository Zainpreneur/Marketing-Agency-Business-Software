import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileDetailsForm, PasswordForm } from "@/components/forms/ProfileForm";
import Badge from "@/components/Badge";
import { ROLE_LABELS } from "@/lib/utils";

export default async function ProfilePage() {
  const me = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-foreground">{user.email}</h1>
        <Badge value={user.role} label={ROLE_LABELS[user.role]} />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <ProfileDetailsForm name={user.name} title={user.title} />
        <PasswordForm />
      </div>
    </div>
  );
}
