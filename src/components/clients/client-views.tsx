"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientTable } from "@/components/clients/client-table";
import { ClientKanbanBoard } from "@/components/clients/client-kanban-board";
import type { Client } from "@/types";

type ViewMode = "kanban" | "table";

interface ClientViewsProps {
  clients: Client[];
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

export function ClientViews({ clients }: ClientViewsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  return (
    <div className="space-y-6">
      {/* View toggle (top-right aligned) */}
      <div className="flex justify-end">
        <ClientViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {/* Content */}
      {viewMode === "kanban" ? (
        <ClientKanbanBoard clients={clients} />
      ) : (
        <ClientTable clients={clients} />
      )}
    </div>
  );
}
