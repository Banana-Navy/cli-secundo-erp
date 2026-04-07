"use client";

import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MapPin, Euro } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterestWithRelations } from "@/types";

interface PipelineCardProps {
  interest: InterestWithRelations;
  onClick: () => void;
  isOverlay?: boolean;
}

const priceFormatter = new Intl.NumberFormat("fr-BE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const PipelineCard = memo(function PipelineCard({
  interest,
  onClick,
  isOverlay,
}: PipelineCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: interest.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const clientName = interest.clients
    ? `${interest.clients.first_name} ${interest.clients.last_name}`
    : "Client inconnu";

  const propertyTitle = interest.properties?.title ?? "Bien inconnu";
  const propertyPrice = interest.properties?.price ?? 0;
  const propertyCity = interest.properties?.location_city ?? "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md cursor-pointer dark:bg-card",
        isDragging && "opacity-50 shadow-lg",
        isOverlay && "shadow-xl rotate-2"
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

      {/* Client name */}
      <p className="text-sm font-semibold truncate pr-6">{clientName}</p>

      {/* Property title */}
      <p className="text-xs text-muted-foreground truncate mt-1">
        {propertyTitle}
      </p>

      {/* Price and location */}
      <div className="flex items-center gap-3 mt-2">
        {propertyPrice > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            <Euro className="h-3 w-3" />
            {priceFormatter.format(propertyPrice)}
          </span>
        )}
        {propertyCity && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {propertyCity}
          </span>
        )}
      </div>

      {/* Note preview */}
      {interest.notes && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
          {interest.notes}
        </p>
      )}
    </div>
  );
});
