import Parser from "rss-parser";
import { RSS_FEEDS } from "./feeds";
import type { RSSArticle } from "./types";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "ERP-Secundo/1.0",
  },
});

let cachedArticles: RSSArticle[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function fetchAllFeeds(): Promise<RSSArticle[]> {
  const now = Date.now();
  if (cachedArticles && now - cacheTimestamp < CACHE_DURATION) {
    return cachedArticles;
  }

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return (parsed.items ?? []).slice(0, 10).map((item) => ({
        title: item.title ?? "Sans titre",
        link: item.link ?? "",
        source: feed.name,
        pubDate: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
        thumbnail: item.enclosure?.url || item["media:content"]?.$.url,
      }));
    })
  );

  const articles: RSSArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    }
  }

  articles.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  cachedArticles = articles.slice(0, 20);
  cacheTimestamp = now;

  return cachedArticles;
}
