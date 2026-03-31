import { Skeleton } from "@/components/ui/skeleton";

export default function TachesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="border-b bg-muted/50 px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b last:border-0 px-4 py-3"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-16 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
