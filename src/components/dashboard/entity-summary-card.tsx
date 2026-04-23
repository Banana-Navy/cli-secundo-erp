"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileText } from "lucide-react";
import type { Entity } from "@/types";

interface EntitySummaryCardProps {
  entity: Entity;
  stats: {
    clients: number;
    properties: number;
    documents: number;
  };
}

export function EntitySummaryCard({ entity, stats }: EntitySummaryCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: entity.color || "var(--primary)" }}
      />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {entity.logo_url ? (
            <Image
              src={entity.logo_url}
              alt={entity.name}
              width={20}
              height={20}
              className="size-5 rounded-sm object-contain"
              unoptimized
            />
          ) : (
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: entity.color || "var(--primary)" }}
            />
          )}
          {entity.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-1">
            <Users className="size-4 text-muted-foreground" />
            <span className="text-lg font-bold">{stats.clients}</span>
            <span className="text-xs text-muted-foreground">Clients</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="text-lg font-bold">{stats.properties}</span>
            <span className="text-xs text-muted-foreground">Biens</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FileText className="size-4 text-muted-foreground" />
            <span className="text-lg font-bold">{stats.documents}</span>
            <span className="text-xs text-muted-foreground">Documents</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
