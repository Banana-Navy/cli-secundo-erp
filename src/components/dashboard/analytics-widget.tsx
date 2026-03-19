"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { BarChart3, Settings, Eye, Clock, Users, ArrowDownUp } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsData } from "@/types";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function KPI({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}

export function AnalyticsWidget() {
  const [period, setPeriod] = useState<"7d" | "30d">("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async (p: "7d" | "30d") => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/analytics?period=${p}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setIsDemo(d.demo === true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  return (
    <div className="rounded-[1.25rem] border-[3px] border-white bg-card p-6 dark:border-[#222]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Analytics du site</h3>
          {isDemo && (
            <Badge variant="outline" className="text-xs font-normal">
              Démo
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isDemo && (
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/parametres?tab=integrations">
                <Settings className="size-3.5 mr-1" />
                Configurer GA
              </Link>
            </Button>
          )}
          <Tabs
            value={period}
            onValueChange={(v) => setPeriod(v as "7d" | "30d")}
          >
            <TabsList>
              <TabsTrigger value="7d">7j</TabsTrigger>
              <TabsTrigger value="30d">30j</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-[160px] rounded-lg" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-3">
            Impossible de charger les données analytics
          </p>
          <Button variant="outline" size="sm" onClick={() => fetchData(period)}>
            Réessayer
          </Button>
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KPI
              icon={Eye}
              label="Pages vues"
              value={data.pageViews.toLocaleString("fr-BE")}
            />
            <KPI
              icon={Users}
              label="Sessions"
              value={data.sessions.toLocaleString("fr-BE")}
            />
            <KPI
              icon={Clock}
              label="Durée moy."
              value={formatDuration(data.avgDuration)}
            />
            <KPI
              icon={ArrowDownUp}
              label="Taux de rebond"
              value={`${Math.round(data.bounceRate * 100)}%`}
            />
          </div>

          {/* Sparkline */}
          {data.dailyPageViews.length > 0 && (
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyPageViews}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => {
                      if (v.length === 8) {
                        return `${v.slice(6)}/${v.slice(4, 6)}`;
                      }
                      return v;
                    }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-popover)",
                    }}
                    formatter={(value: number) => [
                      value.toLocaleString("fr-BE"),
                      "Pages vues",
                    ]}
                    labelFormatter={(label: string) => {
                      if (label.length === 8) {
                        return `${label.slice(6)}/${label.slice(4, 6)}/${label.slice(0, 4)}`;
                      }
                      return label;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    fill="url(#colorViews)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bottom row: Top pages + Traffic sources */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Top pages = top biens consultés */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Biens les plus consultés</h4>
              <div className="space-y-2">
                {data.topPages.map((page, i) => (
                  <div key={i} className="flex items-center justify-between text-sm gap-2">
                    <span className="text-muted-foreground truncate">
                      {page.title || page.path}
                    </span>
                    <span className="font-medium shrink-0">
                      {page.views.toLocaleString("fr-BE")} vues
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic sources */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Sources de trafic</h4>
              <div className="space-y-2">
                {data.trafficSources.map((src, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{src.source}</span>
                      <span className="font-medium">{Math.round(src.percentage)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(src.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
