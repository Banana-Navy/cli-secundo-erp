"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

interface ScoreBreakdown {
  contacts: number;
  positiveOutcomes: number;
  visits: number;
  completedVisits: number;
  interests: number;
  offreInterests: number;
}

interface LeadScoreBadgeProps {
  clientId: string;
  initialScore?: number;
}

function scoreColor(score: number) {
  if (score >= 80) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (score >= 60) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  if (score >= 40) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (score >= 20) return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
}

function scoreBarColor(score: number) {
  if (score >= 80) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-sky-500";
  return "bg-blue-400";
}

export function LeadScoreBadge({ clientId, initialScore }: LeadScoreBadgeProps) {
  const [score, setScore] = useState(initialScore ?? 0);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchScore() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/lead-score?client_id=${clientId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setScore(data.score);
        setBreakdown(data.breakdown);
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className={`text-xs font-bold ${scoreColor(score)}`}>
          Score : {score}/100
        </Badge>
        <button
          onClick={fetchScore}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Recalculer le score"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {breakdown && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
          <span>{breakdown.contacts} interaction{breakdown.contacts > 1 ? "s" : ""}</span>
          <span>{breakdown.completedVisits} visite{breakdown.completedVisits > 1 ? "s" : ""}</span>
          <span>{breakdown.interests} intérêt{breakdown.interests > 1 ? "s" : ""}</span>
          {breakdown.positiveOutcomes > 0 && (
            <span className="text-green-600">{breakdown.positiveOutcomes} positif{breakdown.positiveOutcomes > 1 ? "s" : ""}</span>
          )}
        </div>
      )}
    </div>
  );
}
