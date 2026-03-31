"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale/fr";
import { cn } from "@/lib/utils";
import type { VisitWithRelations, VisitStatus } from "@/types";

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const VISIT_STATUS_COLORS: Record<VisitStatus, string> = {
  planifiee: "bg-blue-500 text-white",
  confirmee: "bg-green-500 text-white",
  effectuee: "bg-gray-400 text-white",
  annulee: "bg-red-500 text-white",
};

interface CalendarGridProps {
  visits: VisitWithRelations[];
  currentDate: Date;
  onVisitClick: (visit: VisitWithRelations) => void;
}

export function CalendarGrid({
  visits,
  currentDate,
  onVisitClick,
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function getVisitsForDay(day: Date): VisitWithRelations[] {
    return visits.filter((v) => isSameDay(new Date(v.visit_date), day));
  }

  function getVisitLabel(visit: VisitWithRelations): string {
    const time = format(new Date(visit.visit_date), "HH:mm");
    return `${time} ${visit.title}`;
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-muted/50">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground border-b"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayVisits = getVisitsForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[100px] border-b border-r p-1.5 transition-colors",
                !inMonth && "bg-muted/30",
                today && "ring-2 ring-primary/50 ring-inset"
              )}
            >
              {/* Day number */}
              <div
                className={cn(
                  "text-xs font-medium mb-1",
                  !inMonth && "text-muted-foreground/50",
                  today &&
                    "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                )}
              >
                {format(day, "d")}
              </div>

              {/* Visit pills */}
              <div className="space-y-0.5">
                {dayVisits.slice(0, 3).map((visit) => (
                  <button
                    key={visit.id}
                    type="button"
                    onClick={() => onVisitClick(visit)}
                    className={cn(
                      "w-full text-left text-[10px] leading-tight px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                      VISIT_STATUS_COLORS[visit.status]
                    )}
                    title={getVisitLabel(visit)}
                  >
                    {getVisitLabel(visit)}
                  </button>
                ))}
                {dayVisits.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{dayVisits.length - 3} de plus
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
