"use client";

import { cn } from "@/lib/utils";
import { ClientKanbanCard } from "@/components/clients/client-kanban-card";
import type { Client, ClientStatus } from "@/types";
import { CLIENT_STATUS_LABELS } from "@/types";

interface ClientKanbanBoardProps {
  clients: Client[];
}

const COLUMNS: {
  status: ClientStatus;
  color: string;
  bgColor: string;
  dotColor: string;
}[] = [
  {
    status: "prospect",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    dotColor: "bg-blue-400",
  },
  {
    status: "actif",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-50 dark:bg-green-950/50",
    dotColor: "bg-green-400",
  },
  {
    status: "inactif",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-800/50",
    dotColor: "bg-gray-400",
  },
];

export function ClientKanbanBoard({ clients }: ClientKanbanBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const columnClients = clients.filter((c) => c.status === col.status);
        return (
          <div
            key={col.status}
            className={cn(
              "flex flex-col rounded-xl p-3 min-h-[400px]",
              col.bgColor
            )}
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <span
                className={cn("h-2.5 w-2.5 rounded-full", col.dotColor)}
              />
              <h3 className={cn("text-sm font-semibold", col.color)}>
                {CLIENT_STATUS_LABELS[col.status]}
              </h3>
              <span
                className={cn(
                  "ml-auto text-xs font-medium rounded-full px-2 py-0.5",
                  col.bgColor,
                  col.color
                )}
              >
                {columnClients.length}
              </span>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              {columnClients.map((client) => (
                <ClientKanbanCard key={client.id} client={client} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
