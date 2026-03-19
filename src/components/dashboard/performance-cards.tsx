import { Timer, Euro, Tag, TrendingUp } from "lucide-react";
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
  },
  {
    title: "Durée moy. avant vente",
    key: "avgDaysToSell" as const,
    icon: Timer,
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-600",
    format: (v: number) => (v > 0 ? `${v} jours` : "—"),
  },
  {
    title: "CA total (vendus)",
    key: "totalRevenue" as const,
    icon: Euro,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    format: (v: number) => formatCurrency(v),
  },
  {
    title: "Prix moyen de vente",
    key: "avgSalePrice" as const,
    icon: Tag,
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600",
    format: (v: number) => (v > 0 ? formatCurrency(v) : "—"),
  },
];

export function PerformanceCards({ performance }: PerformanceCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-[1.25rem] border-[3px] border-white bg-card p-5 dark:border-[#222]"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {item.title}
            </p>
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
  );
}
