"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeoScore } from "@/components/properties/seo-score";
import { Search } from "lucide-react";
import type { SeoAnalysisResult } from "@/lib/seo/analyzer";

interface SeoScoreCardProps {
  analysis: SeoAnalysisResult;
}

export function SeoScoreCard({ analysis }: SeoScoreCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-4 w-4" /> SEO
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SeoScore analysis={analysis} />
      </CardContent>
    </Card>
  );
}
