"use client";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface DistributionItem {
  name: string;
  value: number;
  key: string;
}

interface PropertyDistributionProps {
  title: string;
  data: DistributionItem[];
  total: number;
}

export function PropertyDistribution({
  title,
  data,
  total,
}: PropertyDistributionProps) {
  return (
    <div className="rounded-[1.25rem] border-[3px] border-white bg-card p-6 dark:border-[#222]">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune donnée</p>
      ) : (
        <div className="space-y-3">
          {data.map((item, idx) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.value}{" "}
                    <span className="text-xs">({pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
