"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

function ChartSkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-[1.25rem] border-[3px] border-white bg-card p-6 dark:border-border">
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <Skeleton className="h-[280px] rounded-lg mt-6" />
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="rounded-[1.25rem] border-[3px] border-white bg-card p-6 dark:border-border">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[160px] rounded-lg mt-5" />
    </div>
  );
}

export const LazySalesChart = dynamic(
  () => import("@/components/dashboard/sales-chart").then((m) => m.SalesChart),
  { ssr: false, loading: () => <ChartSkeleton title="Ventes par mois" /> }
);

export const LazyRevenueChart = dynamic(
  () => import("@/components/dashboard/sales-chart").then((m) => m.RevenueChart),
  { ssr: false, loading: () => <ChartSkeleton title="Chiffre d'affaires mensuel" /> }
);

export const LazyAnalyticsWidget = dynamic(
  () => import("@/components/dashboard/analytics-widget").then((m) => m.AnalyticsWidget),
  { ssr: false, loading: () => <AnalyticsSkeleton /> }
);

export const LazyRSSNewsWidget = dynamic(
  () => import("@/components/dashboard/rss-news-widget").then((m) => m.RSSNewsWidget),
  { ssr: false, loading: () => <Skeleton className="h-64 rounded-[1.25rem]" /> }
);
