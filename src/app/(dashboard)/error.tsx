"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
      <p className="text-muted-foreground text-sm">
        {error.message || "Erreur inattendue"}
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
