import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-9 flex-1" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="border-b bg-muted/50 px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b last:border-0 px-4 py-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-44 hidden sm:block" />
            <Skeleton className="h-4 w-28 hidden md:block" />
            <Skeleton className="h-4 w-24 hidden lg:block" />
            <Skeleton className="h-6 w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
