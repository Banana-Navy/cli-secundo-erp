import { createClient } from "@/lib/supabase/server";
import type { AnalyticsData } from "./types";

// Cache demo data per day+period to avoid recomputation
const demoCache = new Map<string, { data: AnalyticsData; day: number }>();

/**
 * Generates realistic demo analytics based on actual published properties.
 * Used when Google Analytics is not configured.
 */
export async function generateDemoAnalytics(
  period: "7d" | "30d"
): Promise<AnalyticsData> {
  const dayKey = Math.floor(Date.now() / 86_400_000);
  const cacheKey = `${period}-${dayKey}`;
  const cached = demoCache.get(cacheKey);
  if (cached && cached.day === dayKey) return cached.data;
  const supabase = await createClient();
  const days = period === "7d" ? 7 : 30;

  // Fetch published properties ordered by most recent (= most likely to be consulted)
  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, slug_fr, location_city, price, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(10);

  const props = properties ?? [];

  // Seed-based pseudo-random (deterministic per day so values don't jump on refresh)
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Generate daily page views
  const dailyPageViews: { date: string; views: number }[] = [];
  let totalViews = 0;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr =
      d.getFullYear().toString() +
      (d.getMonth() + 1).toString().padStart(2, "0") +
      d.getDate().toString().padStart(2, "0");

    // Weekend gets less traffic
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = isWeekend ? 40 : 80;
    const variation = Math.floor(seededRandom(daySeed + i * 7) * 60);
    const views = base + variation;
    totalViews += views;
    dailyPageViews.push({ date: dateStr, views });
  }

  // KPIs
  const sessions = Math.round(totalViews * 0.65);
  const avgDuration = 95 + Math.floor(seededRandom(daySeed + 99) * 80); // 95-175 seconds
  const bounceRate = 0.35 + seededRandom(daySeed + 42) * 0.2; // 35-55%

  // Top 3 properties as top pages (simulate /biens/slug-fr paths)
  const topPages = props.slice(0, 3).map((p, i) => {
    const baseViews = Math.floor(totalViews * (0.12 - i * 0.03));
    const jitter = Math.floor(seededRandom(daySeed + i * 13) * 20);
    return {
      path: `/biens/${p.slug_fr}`,
      title: p.title,
      views: baseViews + jitter,
    };
  });

  // If no published properties, add generic pages
  if (topPages.length === 0) {
    topPages.push(
      { path: "/", title: "Accueil", views: Math.floor(totalViews * 0.3) },
      { path: "/biens", title: "Nos biens", views: Math.floor(totalViews * 0.2) },
      { path: "/contact", title: "Contact", views: Math.floor(totalViews * 0.08) }
    );
  }

  // Add home page if we have properties
  if (props.length > 0) {
    topPages.unshift({
      path: "/",
      title: "Accueil",
      views: Math.floor(totalViews * 0.25),
    });
    topPages.splice(4); // keep max 4
  }

  // Traffic sources
  const trafficSources = [
    { source: "google", sessions: Math.round(sessions * 0.42), percentage: 42 },
    { source: "(direct)", sessions: Math.round(sessions * 0.28), percentage: 28 },
    { source: "facebook.com", sessions: Math.round(sessions * 0.18), percentage: 18 },
    { source: "idealista.com", sessions: Math.round(sessions * 0.12), percentage: 12 },
  ];

  const result: AnalyticsData = {
    pageViews: totalViews,
    sessions,
    avgDuration,
    bounceRate,
    dailyPageViews,
    topPages,
    trafficSources,
  };

  demoCache.set(cacheKey, { data: result, day: dayKey });
  return result;
}
