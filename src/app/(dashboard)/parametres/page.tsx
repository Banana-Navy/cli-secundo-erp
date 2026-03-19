import { Suspense } from "react";
import { ParametresContent } from "./parametres-content";

export default function ParametresPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Chargement...</div>}>
      <ParametresContent />
    </Suspense>
  );
}
