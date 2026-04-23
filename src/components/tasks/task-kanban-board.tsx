"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { TaskKanbanCard } from "@/components/tasks/task-kanban-card";
import type { Task, TaskWithRelations, TaskStatus } from "@/types";
import { TASK_STATUS_LABELS } from "@/types";

interface TaskKanbanBoardProps {
  tasks: TaskWithRelations[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onCardClick: (task: TaskWithRelations) => void;
}

const COLUMNS: {
  status: TaskStatus;
  color: string;
  bgColor: string;
  dotColor: string;
}[] = [
  {
    status: "a_faire",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-800/50",
    dotColor: "bg-gray-400",
  },
  {
    status: "en_cours",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    dotColor: "bg-blue-400",
  },
  {
    status: "termine",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-50 dark:bg-green-950/50",
    dotColor: "bg-green-400",
  },
  {
    status: "annule",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    dotColor: "bg-red-400",
  },
];

function TaskKanbanColumn({
  status,
  color,
  bgColor,
  dotColor,
  tasks,
  onCardClick,
}: {
  status: TaskStatus;
  color: string;
  bgColor: string;
  dotColor: string;
  tasks: TaskWithRelations[];
  onCardClick: (task: TaskWithRelations) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl p-3 min-h-[500px] transition-colors",
        bgColor,
        isOver && "ring-2 ring-primary/50"
      )}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={cn("h-2.5 w-2.5 rounded-full", dotColor)} />
        <h3 className={cn("text-sm font-semibold", color)}>
          {TASK_STATUS_LABELS[status]}
        </h3>
        <span
          className={cn(
            "ml-auto text-xs font-medium rounded-full px-2 py-0.5",
            bgColor,
            color
          )}
        >
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 flex-1">
          {tasks.map((task) => (
            <TaskKanbanCard
              key={task.id}
              task={task}
              onClick={() => onCardClick(task)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function TaskKanbanBoard({
  tasks,
  onStatusChange,
  onCardClick,
}: TaskKanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const groupedTasks = useMemo(() => {
    const map = new Map<TaskStatus, TaskWithRelations[]>();
    for (const col of COLUMNS) {
      map.set(col.status, []);
    }
    for (const task of tasks) {
      const arr = map.get(task.status);
      if (arr) arr.push(task);
    }
    return map;
  }, [tasks]);

  const activeTask = activeId
    ? tasks.find((t) => t.id === activeId) ?? null
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const draggedTask = tasks.find((t) => t.id === active.id);
    if (!draggedTask) return;

    let targetStatus: TaskStatus | null = null;

    const columnStatuses: TaskStatus[] = [
      "a_faire",
      "en_cours",
      "termine",
      "annule",
    ];
    if (columnStatuses.includes(over.id as TaskStatus)) {
      targetStatus = over.id as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (targetStatus && targetStatus !== draggedTask.status) {
      onStatusChange(draggedTask.id, targetStatus);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-4 gap-4 overflow-x-auto">
        {COLUMNS.map((col) => (
          <TaskKanbanColumn
            key={col.status}
            status={col.status}
            color={col.color}
            bgColor={col.bgColor}
            dotColor={col.dotColor}
            tasks={groupedTasks.get(col.status) ?? []}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskKanbanCard
            task={activeTask}
            onClick={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
