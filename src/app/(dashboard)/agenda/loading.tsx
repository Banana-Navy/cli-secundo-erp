import { Skeleton } from "@/components/ui/skeleton";

export default function AgendaLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="px-2 py-2 flex justify-center border-b">
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>

        {/* Day cells (5 rows) */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid grid-cols-7">
            {Array.from({ length: 7 }).map((_, col) => (
              <div
                key={col}
                className="min-h-[100px] border-b border-r p-1.5"
              >
                <Skeleton className="h-4 w-4 mb-1" />
                {row % 2 === 0 && col % 3 === 0 && (
                  <Skeleton className="h-3 w-full mt-1" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
