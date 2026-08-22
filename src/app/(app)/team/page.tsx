import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import RoleSelect from "@/components/RoleSelect";
import { ROLE_LABELS, formatDate } from "@/lib/utils";

export default async function TeamPage() {
  const me = await requireUser();

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { ownedClients: true, managedCampaigns: true, assignedTasks: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const isAdmin = me.role === "ADMIN";

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        {isAdmin && (
          <Link href="/team/new" className="btn btn-primary">
            <Plus size={16} /> New Team Member
          </Link>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border">
              <th className="font-medium px-4 py-3">Name</th>
              <th className="font-medium px-4 py-3">Role</th>
              <th className="font-medium px-4 py-3">Clients</th>
              <th className="font-medium px-4 py-3">Campaigns</th>
              <th className="font-medium px-4 py-3">Tasks</th>
              <th className="font-medium px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-background/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} color={u.avatarColor} size={30} />
                    <div>
                      <p className="font-medium text-foreground">{u.name}{u.id === me.id && <span className="text-xs text-muted"> (you)</span>}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {isAdmin ? (
                    <RoleSelect userId={u.id} role={u.role} disabled={u.id === me.id} />
                  ) : (
                    <Badge value={u.role} label={ROLE_LABELS[u.role]} />
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{u._count.ownedClients}</td>
                <td className="px-4 py-3 text-muted">{u._count.managedCampaigns}</td>
                <td className="px-4 py-3 text-muted">{u._count.assignedTasks}</td>
                <td className="px-4 py-3 text-muted">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
