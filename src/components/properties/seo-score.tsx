"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";
import type { SeoAnalysisResult } from "@/lib/seo/analyzer";

interface SeoScoreProps {
  analysis: SeoAnalysisResult;
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 50) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getBarColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-orange-500";
  return "bg-red-500";
}

export function SeoScore({ analysis }: SeoScoreProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={cn("text-3xl font-bold", getScoreColor(analysis.score))}>
          {analysis.score}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">Score SEO</div>
          <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", getBarColor(analysis.score))}
              style={{ width: `${analysis.score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {analysis.checks.map((check) => (
          <div key={check.name} className="flex items-start gap-2 text-sm">
            {check.passed ? (
              <CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
            )}
            <span className={check.passed ? "text-muted-foreground" : ""}>
              {check.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
