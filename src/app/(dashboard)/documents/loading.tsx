import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-44" />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-[2.625rem] w-48 rounded-full" />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white dark:bg-card">
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b last:border-0 px-4 py-3"
          >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-1 ml-auto">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
