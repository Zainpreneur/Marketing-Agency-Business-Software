import { prisma } from "@/lib/prisma";
import { createTask } from "@/lib/actions/tasks";
import TaskForm from "@/components/forms/TaskForm";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string }>;
}) {
  const { campaignId } = await searchParams;
  const [campaigns, users] = await Promise.all([
    prisma.campaign.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">New Task</h1>
      </div>
      <TaskForm
        action={createTask}
        campaigns={campaigns.map((c) => ({ id: c.id, name: `${c.client.company} · ${c.name}` }))}
        users={users}
        defaultValues={campaignId ? { campaignId } : undefined}
        submitLabel="Create task"
      />
    </div>
  );
}
