"use client";

import { useCallback, useMemo, useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { fr } from "date-fns/locale/fr";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { useEntity } from "@/lib/hooks/use-entity";
import { Button } from "@/components/ui/button";
import { CalendarGrid } from "@/components/agenda/calendar-grid";
import { VisitFormDialog } from "@/components/agenda/visit-form-dialog";
import type { VisitWithRelations } from "@/types";

interface AgendaViewProps {
  initialVisits: VisitWithRelations[];
}

export function AgendaView({ initialVisits }: AgendaViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visits, setVisits] = useState(initialVisits);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitWithRelations | null>(
    null
  );
  const { activeEntity } = useEntity();

  const filteredVisits = useMemo(
    () => activeEntity ? visits.filter((v) => v.entity_id === activeEntity.id) : visits,
    [visits, activeEntity]
  );

  const fetchVisits = useCallback(async (date: Date) => {
    const supabase = createClient();
    const monthStart = startOfMonth(date).toISOString();
    const monthEnd = endOfMonth(date).toISOString();

    const { data, error } = await supabase
      .from("visits")
      .select(
        "*, clients(id, first_name, last_name), properties(id, title, reference)"
      )
      .gte("visit_date", monthStart)
      .lte("visit_date", monthEnd)
      .order("visit_date", { ascending: true });

    if (error) {
      toast.error("Erreur lors du chargement des visites.");
    } else {
      setVisits((data ?? []) as VisitWithRelations[]);
    }
  }, []);

  function handlePrevMonth() {
    setCurrentDate((d) => {
      const next = subMonths(d, 1);
      fetchVisits(next);
      return next;
    });
  }

  function handleNextMonth() {
    setCurrentDate((d) => {
      const next = addMonths(d, 1);
      fetchVisits(next);
      return next;
    });
  }

  function handleCreate() {
    setEditingVisit(null);
    setDialogOpen(true);
  }

  function handleVisitClick(visit: VisitWithRelations) {
    setEditingVisit(visit);
    setDialogOpen(true);
  }

  function handleSaved() {
    setDialogOpen(false);
    setEditingVisit(null);
    fetchVisits(currentDate);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Agenda
          </h1>
          <p className="text-muted-foreground">
            {filteredVisits.length} visite{filteredVisits.length !== 1 ? "s" : ""} ce mois
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Nouvelle visite
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon-sm" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold capitalize min-w-[180px] text-center">
          {format(currentDate, "MMMM yyyy", { locale: fr })}
        </h2>
        <Button variant="outline" size="icon-sm" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <CalendarGrid
        visits={filteredVisits}
        currentDate={currentDate}
        onVisitClick={handleVisitClick}
      />

      {/* Visit form dialog */}
      <VisitFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        visit={editingVisit}
        onSaved={handleSaved}
      />
    </div>
  );
}
