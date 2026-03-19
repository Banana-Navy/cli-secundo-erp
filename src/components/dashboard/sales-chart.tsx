"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatPriceCompact } from "@/lib/format";
import type { MonthlySalesData } from "@/types";

interface SalesChartProps {
  data: MonthlySalesData[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const count = payload.find((p) => p.dataKey === "count")?.value ?? 0;
  const revenue = payload.find((p) => p.dataKey === "revenue")?.value ?? 0;

  return (
    <div className="rounded-xl border border-border bg-popover px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">
        {count} vente{count > 1 ? "s" : ""}
      </p>
      <p className="text-sm font-medium text-primary">
        {new Intl.NumberFormat("fr-BE", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(revenue)}
      </p>
    </div>
  );
}

export function SalesChart({ data }: SalesChartProps) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <div className="rounded-[1.25rem] border-[3px] border-white bg-card p-6 dark:border-[#222]">
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Ventes par mois
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        12 derniers mois — nombre de ventes et chiffre d&apos;affaires
      </p>

      {hasData ? (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-chart-1)"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
          Aucune vente enregistrée sur les 12 derniers mois
        </div>
      )}
    </div>
  );
}

export function RevenueChart({ data }: SalesChartProps) {
  const hasData = data.some((d) => d.revenue > 0);

  return (
    <div className="rounded-[1.25rem] border-[3px] border-white bg-card p-6 dark:border-[#222]">
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Chiffre d&apos;affaires mensuel
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Montant total des ventes par mois
      </p>

      {hasData ? (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={50}
                tickFormatter={formatPriceCompact}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-chart-2)"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
          Aucun chiffre d&apos;affaires enregistré
        </div>
      )}
    </div>
  );
}
