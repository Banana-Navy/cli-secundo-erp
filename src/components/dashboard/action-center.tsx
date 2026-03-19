import Link from "next/link";
import {
  Camera,
  Clock,
  EyeOff,
  UserX,
  CalendarClock,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import type { ActionItem } from "@/types";

const iconMap = {
  no_photos: Camera,
  stale: Clock,
  unpublished: EyeOff,
  inactive_client: UserX,
  long_reservation: CalendarClock,
};

const colorMap = {
  no_photos: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  stale: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  unpublished: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
  inactive_client: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  long_reservation: "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
};

interface ActionCenterProps {
  items: ActionItem[];
}

export function ActionCenter({ items }: ActionCenterProps) {
  return (
    <div className="rounded-[1.25rem] border-[3px] border-white bg-card dark:border-[#222]">
      <div className="px-6 pt-6 pb-4 flex items-center gap-2">
        <AlertTriangle className="size-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-foreground">
          Centre d&apos;actions
        </h3>
      </div>
      <div className="px-6 pb-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 mb-3">
              <svg
                className="size-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">
              Tout est en ordre
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Aucune action requise pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const Icon = iconMap[item.type];
              const colors = colorMap[item.type];

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl bg-white p-3 transition-colors hover:bg-muted/50 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${colors}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
