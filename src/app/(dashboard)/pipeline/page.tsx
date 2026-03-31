"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { InterestFormDialog } from "@/components/pipeline/interest-form-dialog";
import type { InterestWithRelations, InterestStatus } from "@/types";

export default function PipelinePage() {
  const [interests, setInterests] = useState<InterestWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInterest, setSelectedInterest] =
    useState<InterestWithRelations | null>(null);

  const supabase = createClient();

  const fetchInterests = useCallback(async () => {
    setLoading(true);
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
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchInterests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id: string, status: InterestStatus) => {
    const { error } = await supabase
      .from("client_property_interests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors de la mise à jour du statut.");
    } else {
      setInterests((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status } : i))
      );
      toast.success("Statut mis à jour.");
    }
  };

  const handleCardClick = (interest: InterestWithRelations) => {
    setSelectedInterest(interest);
    setDialogOpen(true);
  };

  const handleNewInterest = () => {
    setSelectedInterest(null);
    setDialogOpen(true);
  };

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

      {loading ? (
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-10 rounded-lg bg-accent animate-pulse" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="h-28 rounded-lg bg-accent animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard
          interests={interests}
          onStatusChange={handleStatusChange}
          onCardClick={handleCardClick}
        />
      )}

      <InterestFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        interest={selectedInterest}
        onSaved={fetchInterests}
      />
    </div>
  );
}
