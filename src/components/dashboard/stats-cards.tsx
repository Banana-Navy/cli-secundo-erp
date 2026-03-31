import { Building2, Users, TrendingUp, UserPlus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const items = [
  {
    title: "Biens actifs",
    key: "totalProperties" as const,
    icon: Building2,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    tooltip: "Nombre de biens avec le statut « disponible » ou « réservé » dans le portefeuille.",
  },
  {
    title: "Vendus ce mois",
    key: "propertiesSoldThisMonth" as const,
    icon: TrendingUp,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600",
    tooltip: "Biens passés au statut « vendu » depuis le 1er du mois en cours.",
  },
  {
    title: "Total clients",
    key: "totalClients" as const,
    icon: Users,
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600",
    tooltip: "Nombre total de fiches clients (prospects, actifs et inactifs confondus).",
  },
  {
    title: "Nouveaux clients",
    key: "newClientsThisMonth" as const,
    icon: UserPlus,
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    iconColor: "text-violet-600",
    tooltip: "Clients ajoutés depuis le 1er du mois en cours.",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
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
              <div className={`flex size-9 items-center justify-center rounded-xl ${item.iconBg}`}>
                <item.icon className={`size-[1.125rem] ${item.iconColor}`} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              {stats[item.key]}
            </p>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
