"use client";

import { useState, useMemo } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientTable } from "@/components/clients/client-table";
import { ClientKanbanBoard } from "@/components/clients/client-kanban-board";
import { useEntity } from "@/lib/hooks/use-entity";
import type { Client, ClientEntity } from "@/types";

type ViewMode = "kanban" | "table";

interface ClientViewsProps {
  clients: Client[];
  clientEntities?: ClientEntity[];
}

export function ClientViewToggle({
  viewMode,
  setViewMode,
}: {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border bg-muted p-0.5">
      <Button
        variant={viewMode === "kanban" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2.5"
        onClick={() => setViewMode("kanban")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "table" ? "default" : "ghost"}
        size="sm"
        className="h-7 px-2.5"
        onClick={() => setViewMode("table")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ClientViews({ clients, clientEntities = [] }: ClientViewsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const { activeEntity } = useEntity();

  const filteredClients = useMemo(() => {
    if (!activeEntity) return clients;
    const entityClientIds = new Set(
      clientEntities
        .filter((ce) => ce.entity_id === activeEntity.id)
        .map((ce) => ce.client_id)
    );
    return clients.filter((c) => entityClientIds.has(c.id));
  }, [clients, clientEntities, activeEntity]);

  return (
    <div className="space-y-6">
      {/* View toggle (top-right aligned) */}
      <div className="flex justify-end">
        <ClientViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {/* Content */}
      {viewMode === "kanban" ? (
        <ClientKanbanBoard clients={filteredClients} />
      ) : (
        <ClientTable clients={filteredClients} />
      )}
    </div>
  );
}
