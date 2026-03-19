import { Building2, Users, Phone, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { RecentActivity } from "@/types";

const iconMap = {
  property_added: Building2,
  property_sold: TrendingUp,
  client_added: Users,
  contact_added: Phone,
};

const colorMap = {
  property_added: "bg-primary/10 text-primary",
  property_sold: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  client_added: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  contact_added: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
};

interface RecentActivityListProps {
  activities: RecentActivity[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <div className="rounded-[1.25rem] border-[3px] border-white bg-card dark:border-[#222]">
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-lg font-semibold text-foreground">Activité récente</h3>
      </div>
      <div className="px-6 pb-6">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune activité récente.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = iconMap[activity.type];
              const colors = colorMap[activity.type];
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 dark:bg-white/5"
                >
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${colors}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
