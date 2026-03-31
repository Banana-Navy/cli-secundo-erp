"use client";

import { useState } from "react";
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
import { PipelineCard } from "@/components/pipeline/pipeline-card";
import type { InterestWithRelations, InterestStatus } from "@/types";
import { INTEREST_STATUS_LABELS } from "@/types";

interface KanbanBoardProps {
  interests: InterestWithRelations[];
  onStatusChange: (id: string, status: InterestStatus) => void;
  onCardClick: (interest: InterestWithRelations) => void;
}

const COLUMNS: {
  status: InterestStatus;
  color: string;
  bgColor: string;
  dotColor: string;
}[] = [
  {
    status: "nouveau",
    color: "text-gray-700",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    dotColor: "bg-gray-400",
  },
  {
    status: "contacte",
    color: "text-blue-700",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    dotColor: "bg-blue-400",
  },
  {
    status: "visite",
    color: "text-purple-700",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    dotColor: "bg-purple-400",
  },
  {
    status: "offre",
    color: "text-orange-700",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    dotColor: "bg-orange-400",
  },
  {
    status: "vendu",
    color: "text-green-700",
    bgColor: "bg-green-50 dark:bg-green-950",
    dotColor: "bg-green-400",
  },
];

function KanbanColumn({
  status,
  color,
  bgColor,
  dotColor,
  interests,
  onCardClick,
}: {
  status: InterestStatus;
  color: string;
  bgColor: string;
  dotColor: string;
  interests: InterestWithRelations[];
  onCardClick: (interest: InterestWithRelations) => void;
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
          {INTEREST_STATUS_LABELS[status]}
        </h3>
        <span
          className={cn(
            "ml-auto text-xs font-medium rounded-full px-2 py-0.5",
            bgColor,
            color
          )}
        >
          {interests.length}
        </span>
      </div>

      <SortableContext
        items={interests.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 flex-1">
          {interests.map((interest) => (
            <PipelineCard
              key={interest.id}
              interest={interest}
              onClick={() => onCardClick(interest)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({
  interests,
  onStatusChange,
  onCardClick,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeInterest = activeId
    ? interests.find((i) => i.id === activeId) ?? null
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeInterest = interests.find((i) => i.id === active.id);
    if (!activeInterest) return;

    // The "over" could be a column (droppable) or another card
    // We need to determine the target column status
    let targetStatus: InterestStatus | null = null;

    // Check if dropped over a column directly
    const columnStatuses: InterestStatus[] = [
      "nouveau",
      "contacte",
      "visite",
      "offre",
      "vendu",
    ];
    if (columnStatuses.includes(over.id as InterestStatus)) {
      targetStatus = over.id as InterestStatus;
    } else {
      // Dropped over another card — find which column that card belongs to
      const overInterest = interests.find((i) => i.id === over.id);
      if (overInterest) {
        targetStatus = overInterest.status;
      }
    }

    if (targetStatus && targetStatus !== activeInterest.status) {
      onStatusChange(activeInterest.id, targetStatus);
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
      <div className="grid grid-cols-5 gap-4 overflow-x-auto">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            color={col.color}
            bgColor={col.bgColor}
            dotColor={col.dotColor}
            interests={interests.filter((i) => i.status === col.status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeInterest ? (
          <PipelineCard
            interest={activeInterest}
            onClick={() => {}}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
