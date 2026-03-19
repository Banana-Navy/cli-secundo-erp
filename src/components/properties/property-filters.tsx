"use client";

import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
} from "@/types";
import type { PropertyType, PropertyStatus } from "@/types";

interface PropertyFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  typeFilter: PropertyType | "all";
  onTypeChange: (v: PropertyType | "all") => void;
  statusFilter: PropertyStatus | "all";
  onStatusChange: (v: PropertyStatus | "all") => void;
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
}

export function PropertyFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  view,
  onViewChange,
}: PropertyFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un bien..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewChange("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value as PropertyType | "all")}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        >
          <option value="all">Tous les types</option>
          {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((t) => (
            <option key={t} value={t}>
              {PROPERTY_TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as PropertyStatus | "all")}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        >
          <option value="all">Tous les statuts</option>
          {(Object.keys(PROPERTY_STATUS_LABELS) as PropertyStatus[]).map((s) => (
            <option key={s} value={s}>
              {PROPERTY_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
