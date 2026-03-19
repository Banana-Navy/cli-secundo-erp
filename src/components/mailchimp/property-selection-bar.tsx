"use client";

import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertySelectionBarProps {
  count: number;
  onCampaign: () => void;
  onClear: () => void;
}

export function PropertySelectionBar({
  count,
  onCampaign,
  onClear,
}: PropertySelectionBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border bg-background/95 backdrop-blur-sm shadow-lg px-5 py-3">
      <span className="text-sm font-medium">
        {count} bien{count > 1 ? "s" : ""} sélectionné{count > 1 ? "s" : ""}
      </span>
      <Button size="sm" onClick={onCampaign}>
        <Mail className="size-4 mr-1" />
        Campagne email
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={onClear}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
