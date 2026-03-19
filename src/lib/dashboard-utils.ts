import type { MonthlySalesData, ActionItem } from "@/types";
export { formatCurrency } from "@/lib/format";

// ---------- Monthly sales (last 12 months) ----------

export function computeMonthlySales(
  soldProperties: { price: number; updated_at: string }[]
): MonthlySalesData[] {
  const now = new Date();
  const months: (MonthlySalesData & { key: string })[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const raw = d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
    const label = raw.charAt(0).toUpperCase() + raw.slice(1);
    months.push({ month: label, count: 0, revenue: 0, key });
  }

  const keyMap = new Map(months.map((m, i) => [m.key, i]));

  for (const prop of soldProperties) {
    const d = new Date(prop.updated_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const idx = keyMap.get(key);
    if (idx !== undefined) {
      months[idx].count++;
      months[idx].revenue += Number(prop.price) || 0;
    }
  }

  return months.map(({ key: _key, ...rest }) => rest);
}

// ---------- Average days to sell ----------

export function computeAvgDaysToSell(
  soldProperties: { created_at: string; updated_at: string }[]
): number {
  if (soldProperties.length === 0) return 0;
  const totalDays = soldProperties.reduce((sum, prop) => {
    const created = new Date(prop.created_at).getTime();
    const sold = new Date(prop.updated_at).getTime();
    return sum + Math.max(0, (sold - created) / (1000 * 60 * 60 * 24));
  }, 0);
  return Math.round(totalDays / soldProperties.length);
}

// ---------- Distribution by field ----------

export function computeDistribution(
  properties: Record<string, unknown>[],
  field: string,
  labels: Record<string, string>
): { name: string; value: number; key: string }[] {
  const counts: Record<string, number> = {};
  for (const prop of properties) {
    const val = String(prop[field] || "");
    counts[val] = (counts[val] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([key, value]) => ({ name: labels[key] || key, value, key }))
    .sort((a, b) => b.value - a.value);
}

// ---------- Action center items ----------

interface ActionCenterInput {
  propertiesWithoutPhotos: { id: string; title: string }[];
  staleProperties: { id: string; title: string; created_at: string }[];
  unpublishedProperties: { id: string; title: string }[];
  inactiveClients: { id: string; first_name: string; last_name: string }[];
  longReservations: { id: string; title: string; updated_at: string }[];
}

export function buildActionItems(input: ActionCenterInput): ActionItem[] {
  const items: ActionItem[] = [];

  if (input.propertiesWithoutPhotos.length > 0) {
    items.push({
      id: "no_photos",
      type: "no_photos",
      title: "Biens sans photos",
      description: `${input.propertiesWithoutPhotos.length} bien(s) disponible(s) n'ont aucune photo`,
      href: "/biens?filter=no_photos",
      count: input.propertiesWithoutPhotos.length,
    });
  }

  if (input.staleProperties.length > 0) {
    items.push({
      id: "stale",
      type: "stale",
      title: "Biens en attente depuis longtemps",
      description: `${input.staleProperties.length} bien(s) disponible(s) depuis plus de 90 jours`,
      href: "/biens?filter=stale",
      count: input.staleProperties.length,
    });
  }

  if (input.unpublishedProperties.length > 0) {
    items.push({
      id: "unpublished",
      type: "unpublished",
      title: "Biens non publiés",
      description: `${input.unpublishedProperties.length} bien(s) disponible(s) non visible(s) sur le site`,
      href: "/biens?filter=unpublished",
      count: input.unpublishedProperties.length,
    });
  }

  if (input.inactiveClients.length > 0) {
    items.push({
      id: "inactive_client",
      type: "inactive_client",
      title: "Clients sans contact récent",
      description: `${input.inactiveClients.length} client(s) actif(s) sans interaction depuis 30 jours`,
      href: "/clients?filter=inactive",
      count: input.inactiveClients.length,
    });
  }

  if (input.longReservations.length > 0) {
    items.push({
      id: "long_reservation",
      type: "long_reservation",
      title: "Réservations prolongées",
      description: `${input.longReservations.length} bien(s) réservé(s) depuis plus de 30 jours`,
      href: "/biens?filter=long_reservation",
      count: input.longReservations.length,
    });
  }

  return items;
}

