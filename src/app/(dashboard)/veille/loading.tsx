import { Skeleton } from "@/components/ui/skeleton";

export default function VeilleLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-56" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            {/* Header card */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-8 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Facebook embed placeholder */}
            <div className="rounded-xl border bg-card p-4">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>

            {/* YouTube feed placeholder */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <Skeleton className="h-4 w-40" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex gap-3">
                  <Skeleton className="w-[120px] h-[68px] rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
