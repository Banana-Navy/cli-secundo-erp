import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-[1.25rem]" />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-[1.25rem]" />
        <Skeleton className="h-72 rounded-[1.25rem]" />
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-[1.25rem] lg:col-span-2" />
        <Skeleton className="h-64 rounded-[1.25rem]" />
      </div>
    </div>
  );
}
