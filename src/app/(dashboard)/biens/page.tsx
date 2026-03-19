"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, CheckSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/properties/property-card";
import { PropertyTableView } from "@/components/properties/property-table";
import { PropertyFilters } from "@/components/properties/property-filters";
import { PropertySelectionBar } from "@/components/mailchimp/property-selection-bar";
import { CampaignBuilderDialog } from "@/components/mailchimp/campaign-builder-dialog";
import type { PropertyWithImages, PropertyType, PropertyStatus } from "@/types";

export default function BiensPage() {
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PropertyType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [campaignOpen, setCampaignOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("properties")
        .select("*, property_images(*)")
        .order("created_at", { ascending: false });
      setProperties((data ?? []) as PropertyWithImages[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location_city.toLowerCase().includes(search.toLowerCase()) ||
        p.location_region.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || p.property_type === typeFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [properties, search, typeFilter, statusFilter]);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map((p) => p.id));
    });
  }, [filtered]);

  function toggleSelectionMode() {
    if (selectionMode) {
      setSelectedIds(new Set());
    }
    setSelectionMode(!selectionMode);
  }

  function handleCampaignSuccess() {
    setSelectedIds(new Set());
    setSelectionMode(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biens immobiliers</h1>
          <p className="text-muted-foreground">
            {properties.length} bien{properties.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectionMode ? "default" : "outline"}
            size="sm"
            onClick={toggleSelectionMode}
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            {selectionMode ? "Annuler" : "Sélectionner"}
          </Button>
          <Button asChild size="sm">
            <Link href="/biens/nouveau">
              <Plus className="h-4 w-4 mr-1" />
              Ajouter un bien
            </Link>
          </Button>
        </div>
      </div>

      <PropertyFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        view={view}
        onViewChange={setView}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border overflow-hidden animate-pulse"
            >
              <div className="aspect-[16/10] bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              selectable={selectionMode}
              selected={selectedIds.has(property.id)}
              onToggle={handleToggle}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-8">
              Aucun bien trouvé.
            </p>
          )}
        </div>
      ) : (
        <PropertyTableView
          properties={filtered}
          selectable={selectionMode}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
        />
      )}

      {/* Selection bar */}
      {selectedIds.size > 0 && (
        <PropertySelectionBar
          count={selectedIds.size}
          onCampaign={() => setCampaignOpen(true)}
          onClear={() => {
            setSelectedIds(new Set());
            setSelectionMode(false);
          }}
        />
      )}

      {/* Campaign builder dialog */}
      <CampaignBuilderDialog
        open={campaignOpen}
        onOpenChange={setCampaignOpen}
        propertyIds={Array.from(selectedIds)}
        onSuccess={handleCampaignSuccess}
      />
    </div>
  );
}
