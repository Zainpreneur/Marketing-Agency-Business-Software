import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Badge from "@/components/Badge";
import Avatar from "@/components/Avatar";
import DeleteButton from "@/components/DeleteButton";
import TaskStatusSelect from "@/components/TaskStatusSelect";
import CommentForm from "@/components/forms/CommentForm";
import { deleteTask, addTaskComment } from "@/lib/actions/tasks";
import { formatDate } from "@/lib/utils";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: true,
      campaign: { include: { client: true } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!task) notFound();

  const addComment = addTaskComment.bind(null, task.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{task.title}</h1>
          {task.campaign && (
            <p className="text-sm text-muted mt-1">
              <Link href={`/campaigns/${task.campaign.id}`} className="hover:text-brand">
                {task.campaign.client.company} · {task.campaign.name}
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/tasks/${task.id}/edit`} className="btn btn-secondary">
            <Pencil size={15} /> Edit
          </Link>
          <DeleteButton
            action={async () => {
              "use server";
              await deleteTask(task.id);
            }}
          />
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge value={task.priority} />
          <TaskStatusSelect id={task.id} status={task.status} />
          <span className="text-xs text-muted">Due {formatDate(task.dueDate)}</span>
        </div>
        {task.description && <p className="text-sm text-foreground whitespace-pre-wrap">{task.description}</p>}
        {task.assignee && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Avatar name={task.assignee.name} color={task.assignee.avatarColor} size={26} />
            <span className="text-sm text-muted">Assigned to <span className="text-foreground font-medium">{task.assignee.name}</span></span>
          </div>
        )}
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-foreground">Comments</h2>
        <ul className="space-y-4">
          {task.comments.map((c) => (
            <li key={c.id} className="flex items-start gap-3">
              <Avatar name={c.author?.name ?? "Deleted user"} color={c.author?.avatarColor} size={28} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{c.author?.name ?? "Deleted user"}</span>
                  <span className="text-xs text-muted">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">{c.body}</p>
              </div>
            </li>
          ))}
          {task.comments.length === 0 && <p className="text-sm text-muted text-center py-4">No comments yet.</p>}
        </ul>
        <CommentForm action={addComment} />
      </div>
    </div>
  );
}
