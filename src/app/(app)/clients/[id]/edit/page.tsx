import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateClient } from "@/lib/actions/clients";
import ClientForm from "@/components/forms/ClientForm";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [client, users] = await Promise.all([
    prisma.client.findUnique({ where: { id } }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!client) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit {client.company}</h1>
      </div>
      <ClientForm
        action={updateClient.bind(null, client.id)}
        users={users}
        defaultValues={client}
        submitLabel="Save changes"
      />
    </div>
  );
}
