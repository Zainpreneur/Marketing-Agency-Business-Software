import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/Badge";
import Avatar from "@/components/Avatar";
import TaskStatusSelect from "@/components/TaskStatusSelect";
import { formatDate } from "@/lib/utils";

const COLUMNS: { status: string; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "IN_REVIEW", label: "In Review" },
  { status: "DONE", label: "Done" },
];

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: { assignee: true, campaign: { include: { client: true } } },
    orderBy: [{ dueDate: "asc" }],
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Link href="/tasks/new" className="btn btn-primary">
          <Plus size={16} /> New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                <span className="text-xs text-muted bg-background rounded-full px-2 py-0.5">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((t) => (
                  <div key={t.id} className="rounded-lg border border-border p-3 space-y-2">
                    <Link href={`/tasks/${t.id}`} className="text-sm font-medium text-foreground hover:text-brand block leading-snug">
                      {t.title}
                    </Link>
                    {t.campaign && (
                      <p className="text-xs text-muted truncate">
                        {t.campaign.client.company} · {t.campaign.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge value={t.priority} />
                      {t.assignee && <Avatar name={t.assignee.name} color={t.assignee.avatarColor} size={22} />}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted">{formatDate(t.dueDate)}</span>
                      <TaskStatusSelect id={t.id} status={t.status} />
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-muted text-center py-6">Nothing here.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
