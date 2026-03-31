"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  Plus,
  Bell,
  ScanSearch,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompetitorFormDialog } from "@/components/veille/competitor-form-dialog";
import { AlertList } from "@/components/veille/alert-list";
import { CompetitorColumn } from "@/components/veille/competitor-column";
import type { Competitor, CompetitorSnapshot, SnapshotType } from "@/types";

const SCAN_TYPES: SnapshotType[] = ["metadata", "youtube", "sitemap", "social"];

export default function VeillePage() {
  const supabase = createClient();

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [allSnapshots, setAllSnapshots] = useState<Record<string, CompetitorSnapshot[]>>({});
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Unread counts
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const totalUnread = Object.values(unreadCounts).reduce((s, n) => s + n, 0);

  const fetchCompetitors = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("competitors")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Erreur lors du chargement des concurrents.");
    } else {
      const list = (data ?? []) as Competitor[];
      setCompetitors(list);

      // Fetch snapshots for all competitors
      if (list.length > 0) {
        const { data: snaps, error: snapError } = await supabase
          .from("competitor_snapshots")
          .select("*")
          .in("competitor_id", list.map((c) => c.id))
          .order("created_at", { ascending: false });

        if (!snapError && snaps) {
          const grouped: Record<string, CompetitorSnapshot[]> = {};
          for (const snap of snaps as CompetitorSnapshot[]) {
            if (!grouped[snap.competitor_id]) grouped[snap.competitor_id] = [];
            grouped[snap.competitor_id].push(snap);
          }
          setAllSnapshots(grouped);
        }
      }
    }
    setLoading(false);
  }, [supabase]);

  const fetchUnreadCounts = useCallback(async () => {
    const { data, error } = await supabase
      .from("spy_alerts")
      .select("competitor_id")
      .eq("read", false);

    if (!error && data) {
      const counts: Record<string, number> = {};
      for (const row of data) {
        counts[row.competitor_id] = (counts[row.competitor_id] ?? 0) + 1;
      }
      setUnreadCounts(counts);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCompetitors();
    fetchUnreadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanAll = async () => {
    setScanning(true);
    try {
      const results = await Promise.allSettled(
        competitors.map((c) =>
          fetch("/api/veille/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ competitor_id: c.id, types: SCAN_TYPES }),
          })
        )
      );

      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) {
        toast.warning(`${failed} scan(s) en erreur.`);
      } else {
        toast.success("Scan terminé pour tous les concurrents.");
      }

      fetchCompetitors();
      fetchUnreadCounts();
    } catch {
      toast.error("Erreur lors du scan.");
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 rounded-lg bg-accent animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-24 rounded-xl bg-accent animate-pulse" />
              <div className="h-[300px] rounded-xl bg-accent animate-pulse" />
              <div className="h-[200px] rounded-xl bg-accent animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (competitors.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Veille concurrentielle</h1>
          <Button size="sm" onClick={() => { setEditingCompetitor(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter un concurrent
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Eye className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Aucun concurrent</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoutez un concurrent pour commencer la veille.
          </p>
        </div>
        <CompetitorFormDialog open={formOpen} onOpenChange={setFormOpen} onSaved={fetchCompetitors} competitor={null} />
      </div>
    );
  }

  // Show up to 3 competitors in columns
  const displayed = competitors.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Veille concurrentielle</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAlertsOpen(true)}
            className="relative"
          >
            <Bell className="h-4 w-4 mr-1" />
            Alertes
            {totalUnread > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0">
                {totalUnread}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleScanAll} disabled={scanning}>
            {scanning ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ScanSearch className="h-4 w-4 mr-1" />}
            {scanning ? "Scan en cours..." : "Scanner tout"}
          </Button>
          <Button size="sm" onClick={() => { setEditingCompetitor(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {displayed.map((competitor) => (
          <CompetitorColumn
            key={competitor.id}
            competitor={competitor}
            snapshots={allSnapshots[competitor.id] ?? []}
          />
        ))}
      </div>

      {/* Show remaining competitors count */}
      {competitors.length > 3 && (
        <p className="text-sm text-muted-foreground text-center">
          +{competitors.length - 3} autre{competitors.length - 3 > 1 ? "s" : ""} concurrent{competitors.length - 3 > 1 ? "s" : ""} non affiché{competitors.length - 3 > 1 ? "s" : ""}
        </p>
      )}

      {/* Dialogs */}
      <CompetitorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={fetchCompetitors}
        competitor={editingCompetitor}
      />

      <AlertList
        open={alertsOpen}
        onOpenChange={setAlertsOpen}
        onAlertsRead={fetchUnreadCounts}
      />
    </div>
  );
}
