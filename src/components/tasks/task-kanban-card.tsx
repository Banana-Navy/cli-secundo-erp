"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Calendar, Flag } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority } from "@/types";
import { TASK_PRIORITY_LABELS } from "@/types";

interface TaskKanbanCardProps {
  task: Task;
  onClick: () => void;
  isOverlay?: boolean;
}

const PRIORITY_DOT: Record<TaskPriority, string> = {
  basse: "bg-gray-400",
  normale: "bg-blue-400",
  haute: "bg-orange-400",
  urgente: "bg-red-500",
};

export const TaskKanbanCard = memo(function TaskKanbanCard({
  task,
  onClick,
  isOverlay,
}: TaskKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    task.due_date && !["termine", "annule"].includes(task.status)
      ? isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))
      : false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md cursor-pointer dark:bg-card",
        isDragging && "opacity-50 shadow-lg",
        isOverlay && "shadow-xl rotate-2",
        isOverdue && "border-red-300 dark:border-red-800"
      )}
      onClick={onClick}
    >
      {/* Drag handle */}
      <div
        className="absolute top-2 right-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Title */}
      <p className="text-sm font-semibold truncate pr-6">{task.title}</p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority + Due date row */}
      <div className="flex items-center gap-3 mt-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn("h-2 w-2 rounded-full", PRIORITY_DOT[task.priority])}
          />
          {TASK_PRIORITY_LABELS[task.priority]}
        </span>

        {task.due_date && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs",
              isOverdue
                ? "text-red-600 font-medium dark:text-red-400"
                : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            {format(new Date(task.due_date), "dd MMM", { locale: fr })}
          </span>
        )}
      </div>
    </div>
  );
});
