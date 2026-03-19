import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/clients/client-form";

export default function NouveauClientPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouveau client</h1>
          <p className="text-muted-foreground">
            Créer une nouvelle fiche client
          </p>
        </div>
      </div>

      <ClientForm />
    </div>
  );
}
