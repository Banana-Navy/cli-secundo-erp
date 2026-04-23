"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useEntity } from "@/lib/hooks/use-entity";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Send, Loader2 } from "lucide-react";
import { PUBLICATION_STATUS_LABELS } from "@/types";
import type { PublicationStatus } from "@/types";

interface ApprovalWorkflowProps {
  propertyId: string;
  currentStatus: PublicationStatus;
  onStatusChange: (status: PublicationStatus) => void;
}

const STATUS_ICONS: Record<PublicationStatus, React.ReactNode> = {
  brouillon: <Clock className="size-4" />,
  en_attente: <Send className="size-4" />,
  approuve: <CheckCircle className="size-4" />,
  refuse: <XCircle className="size-4" />,
};

const STATUS_COLORS: Record<PublicationStatus, string> = {
  brouillon: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  en_attente: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  approuve: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  refuse: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export function ApprovalWorkflow({
  propertyId,
  currentStatus,
  onStatusChange,
}: ApprovalWorkflowProps) {
  const [loading, setLoading] = useState(false);
  const { profile } = useEntity();
  const isAdmin = profile?.role === "admin";

  async function updateStatus(newStatus: PublicationStatus) {
    setLoading(true);
    const supabase = createClient();

    const updateData: Record<string, unknown> = {
      publication_status: newStatus,
    };
    if (newStatus === "approuve") {
      updateData.approved_by = profile?.id;
      updateData.approved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("properties")
      .update(updateData)
      .eq("id", propertyId);

    setLoading(false);

    if (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    } else {
      toast.success(`Statut mis à jour : ${PUBLICATION_STATUS_LABELS[newStatus]}`);
      onStatusChange(newStatus);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Statut de publication :</span>
        <Badge variant="secondary" className={STATUS_COLORS[currentStatus]}>
          {STATUS_ICONS[currentStatus]}
          <span className="ml-1">{PUBLICATION_STATUS_LABELS[currentStatus]}</span>
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {currentStatus === "brouillon" && (
          <Button
            size="sm"
            onClick={() => updateStatus("en_attente")}
            disabled={loading}
          >
            {loading && <Loader2 className="size-4 animate-spin mr-1" />}
            <Send className="size-4 mr-1" />
            Soumettre pour approbation
          </Button>
        )}
        {currentStatus === "en_attente" && isAdmin && (
          <>
            <Button
              size="sm"
              onClick={() => updateStatus("approuve")}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="size-4 animate-spin mr-1" />}
              <CheckCircle className="size-4 mr-1" />
              Approuver
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateStatus("refuse")}
              disabled={loading}
            >
              <XCircle className="size-4 mr-1" />
              Refuser
            </Button>
          </>
        )}
        {currentStatus === "refuse" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatus("brouillon")}
            disabled={loading}
          >
            Remettre en brouillon
          </Button>
        )}
        {currentStatus === "approuve" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatus("brouillon")}
            disabled={loading}
          >
            Rétrograder en brouillon
          </Button>
        )}
      </div>
    </div>
  );
}
