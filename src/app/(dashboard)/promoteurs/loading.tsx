import { Skeleton } from "@/components/ui/skeleton";

export default function PromoteursLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
