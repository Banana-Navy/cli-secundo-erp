import { PromoterForm } from "@/components/promoters/promoter-form";

export default function NouveauPromoterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau promoteur</h1>
        <p className="text-muted-foreground">
          Ajouter un promoteur immobilier
        </p>
      </div>
      <PromoterForm />
    </div>
  );
}
