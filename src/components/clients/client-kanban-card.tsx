"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import type { Client } from "@/types";

interface ClientKanbanCardProps {
  client: Client;
}

export function ClientKanbanCard({ client }: ClientKanbanCardProps) {
  return (
    <Link
      href={`/clients/${client.id}`}
      className="group block rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-card"
    >
      {/* Name */}
      <p className="text-sm font-semibold truncate">
        {client.first_name} {client.last_name}
      </p>

      {/* Contact info */}
      <div className="mt-2 space-y-1">
        {client.email && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            <Mail className="h-3 w-3 shrink-0" />
            {client.email}
          </p>
        )}
        {client.phone && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" />
            {client.phone}
          </p>
        )}
        {client.city && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {client.city}
          </p>
        )}
      </div>
    </Link>
  );
}
