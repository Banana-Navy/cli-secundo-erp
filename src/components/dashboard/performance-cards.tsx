import { Timer, Euro, Tag, TrendingUp, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/format";
import type { SalesPerformance } from "@/types";

interface PerformanceCardsProps {
  performance: SalesPerformance;
}

const items = [
  {
    title: "Biens vendus",
    key: "totalSold" as const,
    icon: TrendingUp,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600",
    format: (v: number) => String(v),
    tooltip: "Nombre total de biens passés au statut « vendu » (toutes périodes confondues).",
  },
  {
    title: "Durée moy. avant vente",
    key: "avgDaysToSell" as const,
    icon: Timer,
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-600",
    format: (v: number) => (v > 0 ? `${v} jours` : "—"),
    tooltip: "Nombre moyen de jours entre la création d'un bien et son passage au statut « vendu ».",
  },
  {
    title: "CA total (vendus)",
    key: "totalRevenue" as const,
    icon: Euro,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    format: (v: number) => formatCurrency(v),
    tooltip: "Somme des prix de tous les biens vendus. Représente le chiffre d'affaires brut.",
  },
  {
    title: "Prix moyen de vente",
    key: "avgSalePrice" as const,
    icon: Tag,
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600",
    format: (v: number) => (v > 0 ? formatCurrency(v) : "—"),
    tooltip: "Prix moyen des biens vendus (CA total ÷ nombre de ventes).",
  },
];

export function PerformanceCards({ performance }: PerformanceCardsProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-[1.25rem] border-[3px] border-white bg-card p-5 dark:border-[#222]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-3.5 text-muted-foreground/50 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-xs">
                    {item.tooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div
                className={`flex size-9 items-center justify-center rounded-xl ${item.iconBg}`}
              >
                <item.icon className={`size-[1.125rem] ${item.iconColor}`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
              {item.format(performance[item.key])}
            </p>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
