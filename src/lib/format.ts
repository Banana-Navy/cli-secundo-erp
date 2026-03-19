export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

/** Alias of formatPrice — used in dashboard/analytics components. */
export const formatCurrency = formatPrice;

export function formatPriceCompact(price: number): string {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M€`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)}k€`;
  return `${price}€`;
}
