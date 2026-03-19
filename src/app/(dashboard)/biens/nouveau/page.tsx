import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyForm } from "@/components/properties/property-form";

export default function NouveauBienPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/biens">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouveau bien</h1>
          <p className="text-muted-foreground">
            Ajouter un bien immobilier au catalogue
          </p>
        </div>
      </div>

      <PropertyForm />
    </div>
  );
}
