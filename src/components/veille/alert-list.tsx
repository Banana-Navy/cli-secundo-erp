"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SpyAlert } from "@/types";

interface AlertListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitorId?: string;
  onAlertsRead?: () => void;
}

export function AlertList({
  open,
  onOpenChange,
  competitorId,
  onAlertsRead,
}: AlertListProps) {
  const supabase = createClient();
  const [alerts, setAlerts] = useState<SpyAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("spy_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (competitorId) {
      query = query.eq("competitor_id", competitorId);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erreur lors du chargement des alertes.");
    } else {
      setAlerts((data ?? []) as SpyAlert[]);
    }
    setLoading(false);
  }, [supabase, competitorId]);

  useEffect(() => {
    if (!open) return;
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, competitorId]);

  const markAllRead = async () => {
    const unread = alerts.filter((a) => !a.read);
    if (unread.length === 0) return;

    const { error } = await supabase
      .from("spy_alerts")
      .update({ read: true })
      .in(
        "id",
        unread.map((a) => a.id)
      );

    if (error) {
      toast.error("Erreur lors de la mise à jour.");
    } else {
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
      onAlertsRead?.();
    }
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Alertes
              {unreadCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Tout marquer lu
              </Button>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-accent animate-pulse"
              />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
            Aucune alerte pour le moment.
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border p-3 space-y-1 transition-colors ${
                  alert.read
                    ? "bg-white dark:bg-card"
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{alert.message}</span>
                  {!alert.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">
                    {alert.alert_type}
                  </Badge>
                  <span>{alert.metric}</span>
                  {alert.change_percent != null && (
                    <span
                      className={
                        alert.change_percent > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {alert.change_percent > 0 ? "+" : ""}
                      {alert.change_percent.toFixed(1)}%
                    </span>
                  )}
                  <span className="ml-auto">
                    {format(new Date(alert.created_at), "dd MMM yyyy HH:mm", {
                      locale: fr,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
