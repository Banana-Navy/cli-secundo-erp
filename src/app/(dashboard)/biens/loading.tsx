import { Skeleton } from "@/components/ui/skeleton";

export default function BiensLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1 max-w-xs" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="border-b bg-muted/50 px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b last:border-0 px-4 py-3">
            <Skeleton className="h-10 w-14 rounded shrink-0" />
            <Skeleton className="h-4 flex-1 max-w-48" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-24 hidden md:block" />
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
