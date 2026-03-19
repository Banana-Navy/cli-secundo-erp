export interface AnalyticsData {
  pageViews: number;
  sessions: number;
  avgDuration: number;
  bounceRate: number;
  dailyPageViews: { date: string; views: number }[];
  topPages: { path: string; title: string; views: number }[];
  trafficSources: { source: string; sessions: number; percentage: number }[];
}
