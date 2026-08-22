import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/actions/clients";
import ClientForm from "@/components/forms/ClientForm";

export default async function NewClientPage() {
  const users = await prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New Client</h1>
        <p className="text-sm text-muted mt-1">Add a new client account to the workspace.</p>
      </div>
      <ClientForm action={createClient} users={users} submitLabel="Create client" />
    </div>
  );
}
