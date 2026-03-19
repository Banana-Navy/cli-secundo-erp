import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type { AnalyticsData } from "./types";
import { getSettings } from "@/lib/settings";

async function getAnalyticsClient() {
  const settings = await getSettings(["ga_property_id", "ga_credentials_json"]);
  const propertyId = settings.ga_property_id;
  const credentialsJson = settings.ga_credentials_json;

  if (!propertyId || !credentialsJson) {
    return null;
  }

  const credentials = JSON.parse(credentialsJson);
  const client = new BetaAnalyticsDataClient({ credentials });

  return { client, propertyId };
}

export async function fetchAnalyticsData(
  period: "7d" | "30d"
): Promise<AnalyticsData | null> {
  const config = await getAnalyticsClient();
  if (!config) return null;

  const { client, propertyId } = config;
  const startDate = period === "7d" ? "7daysAgo" : "30daysAgo";

  const [overviewRes, dailyRes, pagesRes, sourcesRes] = await Promise.all([
    // Overview metrics
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: "today" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "sessions" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    }),
    // Daily page views
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    // Top pages
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: "today" }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [
        { metric: { metricName: "screenPageViews" }, desc: true },
      ],
      limit: 5,
    }),
    // Traffic sources
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate: "today" }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [
        { metric: { metricName: "sessions" }, desc: true },
      ],
      limit: 5,
    }),
  ]);

  // Parse overview
  const overviewRow = overviewRes[0]?.rows?.[0];
  const pageViews = Number(overviewRow?.metricValues?.[0]?.value ?? 0);
  const sessions = Number(overviewRow?.metricValues?.[1]?.value ?? 0);
  const avgDuration = Number(overviewRow?.metricValues?.[2]?.value ?? 0);
  const bounceRate = Number(overviewRow?.metricValues?.[3]?.value ?? 0);

  // Parse daily page views
  const dailyPageViews = (dailyRes[0]?.rows ?? []).map((row) => ({
    date: row.dimensionValues?.[0]?.value ?? "",
    views: Number(row.metricValues?.[0]?.value ?? 0),
  }));

  // Parse top pages
  const topPages = (pagesRes[0]?.rows ?? []).slice(0, 3).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    title: row.dimensionValues?.[1]?.value ?? "",
    views: Number(row.metricValues?.[0]?.value ?? 0),
  }));

  // Parse traffic sources
  const totalSessions = (sourcesRes[0]?.rows ?? []).reduce(
    (sum, row) => sum + Number(row.metricValues?.[0]?.value ?? 0),
    0
  );
  const trafficSources = (sourcesRes[0]?.rows ?? []).slice(0, 3).map((row) => {
    const sourceSessions = Number(row.metricValues?.[0]?.value ?? 0);
    return {
      source: row.dimensionValues?.[0]?.value ?? "(direct)",
      sessions: sourceSessions,
      percentage: totalSessions > 0 ? (sourceSessions / totalSessions) * 100 : 0,
    };
  });

  return {
    pageViews,
    sessions,
    avgDuration,
    bounceRate,
    dailyPageViews,
    topPages,
    trafficSources,
  };
}

export async function testAnalyticsConnection(): Promise<boolean> {
  try {
    const config = await getAnalyticsClient();
    if (!config) return false;

    const { client, propertyId } = config;
    await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "1daysAgo", endDate: "today" }],
      metrics: [{ name: "sessions" }],
    });
    return true;
  } catch {
    return false;
  }
}
