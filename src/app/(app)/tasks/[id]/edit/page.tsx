import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTask } from "@/lib/actions/tasks";
import TaskForm from "@/components/forms/TaskForm";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [task, campaigns, users] = await Promise.all([
    prisma.task.findUnique({ where: { id } }),
    prisma.campaign.findMany({ include: { client: true }, orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!task) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit Task</h1>
      </div>
      <TaskForm
        action={updateTask.bind(null, task.id)}
        campaigns={campaigns.map((c) => ({ id: c.id, name: `${c.client.company} · ${c.name}` }))}
        users={users}
        defaultValues={task}
        submitLabel="Save changes"
      />
    </div>
  );
}
