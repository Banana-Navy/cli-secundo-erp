import { Building2, Users, TrendingUp, UserPlus } from "lucide-react";
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
  },
  {
    title: "Vendus ce mois",
    key: "propertiesSoldThisMonth" as const,
    icon: TrendingUp,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-600",
  },
  {
    title: "Total clients",
    key: "totalClients" as const,
    icon: Users,
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconColor: "text-blue-600",
  },
  {
    title: "Nouveaux clients",
    key: "newClientsThisMonth" as const,
    icon: UserPlus,
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    iconColor: "text-violet-600",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
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
  );
}
