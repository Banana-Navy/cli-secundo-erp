"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LEAD_TEMPERATURE_LABELS, LEAD_TEMPERATURE_COLORS } from "@/types";
import type { LeadTemperature } from "@/types";

interface TemperatureBadgeProps {
  temperature: LeadTemperature;
  className?: string;
}

export function TemperatureBadge({ temperature, className }: TemperatureBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-0",
        LEAD_TEMPERATURE_COLORS[temperature],
        className
      )}
    >
      {LEAD_TEMPERATURE_LABELS[temperature]}
    </Badge>
  );
}
