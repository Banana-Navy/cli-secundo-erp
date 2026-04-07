"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { InterestFormDialog } from "@/components/pipeline/interest-form-dialog";
import type { InterestWithRelations, InterestStatus } from "@/types";

interface PipelineViewProps {
  initialInterests: InterestWithRelations[];
}

export function PipelineView({ initialInterests }: PipelineViewProps) {
  const [interests, setInterests] = useState(initialInterests);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInterest, setSelectedInterest] =
    useState<InterestWithRelations | null>(null);

  const fetchInterests = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("client_property_interests")
      .select(
        "*, clients(id, first_name, last_name, email, phone), properties(id, title, price, location_city, reference)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement de la pipeline.");
    } else {
      setInterests((data ?? []) as InterestWithRelations[]);
    }
  }, []);

  const handleStatusChange = useCallback(
    async (id: string, status: InterestStatus) => {
      setInterests((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status } : i))
      );

      const supabase = createClient();
      const { error } = await supabase
        .from("client_property_interests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        toast.error("Erreur lors de la mise à jour du statut.");
        fetchInterests();
      } else {
        toast.success("Statut mis à jour.");
      }
    },
    [fetchInterests]
  );

  const handleCardClick = useCallback((interest: InterestWithRelations) => {
    setSelectedInterest(interest);
    setDialogOpen(true);
  }, []);

  const handleNewInterest = useCallback(() => {
    setSelectedInterest(null);
    setDialogOpen(true);
  }, []);

  const handleSaved = useCallback(() => {
    fetchInterests();
  }, [fetchInterests]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground">
            {interests.length} intérêt{interests.length !== 1 ? "s" : ""} au
            total
          </p>
        </div>
        <Button size="sm" onClick={handleNewInterest}>
          <Plus className="h-4 w-4 mr-1" />
          Nouvel intérêt
        </Button>
      </div>

      <KanbanBoard
        interests={interests}
        onStatusChange={handleStatusChange}
        onCardClick={handleCardClick}
      />

      <InterestFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        interest={selectedInterest}
        onSaved={handleSaved}
      />
    </div>
  );
}
