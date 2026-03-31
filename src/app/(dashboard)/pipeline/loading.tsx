import { Skeleton } from "@/components/ui/skeleton";

export default function PipelineLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* 5 Kanban columns */}
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, colIdx) => (
          <div key={colIdx} className="space-y-3">
            {/* Column header */}
            <div className="flex items-center gap-2 p-3">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-6 ml-auto rounded-full" />
            </div>

            {/* Cards */}
            {Array.from({ length: 3 - Math.floor(colIdx / 2) }).map(
              (_, cardIdx) => (
                <div
                  key={cardIdx}
                  className="rounded-lg border bg-white p-3 space-y-2 dark:bg-card"
                >
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex gap-3 pt-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
