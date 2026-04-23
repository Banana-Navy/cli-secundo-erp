"use client";

import { useEntity } from "@/lib/hooks/use-entity";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

export function EntitySelector() {
  const { activeEntity, setActiveEntity, entities, loading } = useEntity();

  if (loading || entities.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 px-1">
      {/* Global view */}
      <button
        onClick={() => setActiveEntity(null)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
          !activeEntity
            ? "bg-sidebar-primary/20 text-sidebar-primary"
            : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Globe className="size-3.5" />
        <span>Global</span>
      </button>

      {/* Entity pills */}
      {entities.map((entity) => {
        const isActive = activeEntity?.id === entity.id;
        return (
          <button
            key={entity.id}
            onClick={() => setActiveEntity(entity)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-sidebar-primary/20 text-sidebar-primary"
                : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entity.color || "var(--sidebar-primary)" }}
            />
            <span>{entity.name}</span>
          </button>
        );
      })}
    </div>
  );
}
