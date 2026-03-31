import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SnapshotType } from "@/types";

interface ScanRequest {
  competitor_id: string;
  types: SnapshotType[];
}

/**
 * Decode a Response body with proper charset detection.
 */
async function decodeResponse(res: Response): Promise<string> {
  const buf = await res.arrayBuffer();

  const contentType = res.headers.get("content-type") ?? "";
  const headerCharset = contentType.match(/charset=["']?([^;"'\s]+)/i)?.[1];

  const raw = new TextDecoder("latin1").decode(buf);
  const metaCharset =
    raw.match(/<meta[^>]*charset=["']?([^"';\s>]+)/i)?.[1] ??
    raw.match(/<meta[^>]*content=["'][^"']*charset=([^"';\s]+)/i)?.[1];

  const charset = (headerCharset ?? metaCharset ?? "utf-8").toLowerCase().replace(/^x-/, "");

  const charsetMap: Record<string, string> = {
    "iso-8859-1": "windows-1252",
    "latin1": "windows-1252",
    "latin-1": "windows-1252",
  };
  const finalCharset = charsetMap[charset] ?? charset;

  try {
    return new TextDecoder(finalCharset).decode(buf);
  } catch {
    return new TextDecoder("utf-8", { fatal: false }).decode(buf);
  }
}

async function fetchHtml(url: string): Promise<{ html: string; status: number }> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { "User-Agent": "SecundoERP-SpyBot/1.0" },
  });
  const html = await decodeResponse(res);
  return { html, status: res.status };
}

async function fetchMetadata(url: string): Promise<Record<string, unknown>> {
  try {
    const { html, status } = await fetchHtml(url);

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
    );
    const canonicalMatch = html.match(
      /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i
    );

    return {
      title: titleMatch?.[1]?.trim() ?? "",
      description: descMatch?.[1]?.trim() ?? "",
      canonical: canonicalMatch?.[1]?.trim() ?? "",
      statusCode: status,
      contentLength: html.length,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Fetch failed" };
  }
}

/**
 * Extract channel ID from a YouTube channel/user URL by fetching the page HTML.
 */
async function resolveYouTubeChannelId(youtubeUrl: string): Promise<string | null> {
  try {
    const { html } = await fetchHtml(youtubeUrl);

    // Try multiple patterns to find the channel ID
    const patterns = [
      /\"channelId\":\"(UC[a-zA-Z0-9_-]{22})\"/,
      /\"externalId\":\"(UC[a-zA-Z0-9_-]{22})\"/,
      /data-channel-external-id=\"(UC[a-zA-Z0-9_-]{22})\"/,
      /channel_id=(UC[a-zA-Z0-9_-]{22})/,
      /\/channel\/(UC[a-zA-Z0-9_-]{22})/,
      /<meta[^>]*itemprop="channelId"[^>]*content="(UC[a-zA-Z0-9_-]{22})"/,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch YouTube RSS feed and parse video entries.
 */
async function fetchYouTubeVideos(
  youtubeUrl: string
): Promise<Record<string, unknown>> {
  if (!youtubeUrl) return { error: "No YouTube URL" };

  try {
    const channelId = await resolveYouTubeChannelId(youtubeUrl);
    if (!channelId) {
      return { error: "Could not resolve channel ID", url: youtubeUrl };
    }

    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(rssUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "SecundoERP-SpyBot/1.0" },
    });

    if (!res.ok) {
      return { error: `RSS feed returned ${res.status}`, channelId };
    }

    const xml = await res.text();

    // Parse entries from Atom XML
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
    const videos = entries.slice(0, 10).map((entry) => {
      const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "";
      const title = entry.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
      const published = entry.match(/<published>([^<]*)<\/published>/)?.[1] ?? "";
      const thumbnail = videoId
        ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
        : "";
      const link = videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";

      return { videoId, title, thumbnail, published, link };
    });

    return {
      channelId,
      videoCount: videos.length,
      videos,
      scanned_at: new Date().toISOString(),
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "YouTube fetch failed" };
  }
}

async function fetchSnapshotData(
  type: SnapshotType,
  competitor: { website_url?: string; youtube_url?: string }
): Promise<Record<string, unknown>> {
  const websiteUrl = competitor.website_url ?? "";
  const youtubeUrl = competitor.youtube_url ?? "";

  switch (type) {
    case "metadata":
      return websiteUrl ? fetchMetadata(websiteUrl) : { error: "No URL" };
    case "youtube":
      return fetchYouTubeVideos(youtubeUrl);
    case "reviews":
      return { note: "Google Maps reviews require API key", scanned_at: new Date().toISOString() };
    case "social":
      return { note: "Social metrics require platform APIs", scanned_at: new Date().toISOString() };
    case "sitemap":
      if (!websiteUrl) return { error: "No URL" };
      try {
        const sitemapUrl = new URL("/sitemap.xml", websiteUrl).href;
        const res = await fetch(sitemapUrl, {
          signal: AbortSignal.timeout(10000),
        });
        const text = await decodeResponse(res);
        const urls = (text.match(/<loc>([^<]*)<\/loc>/gi) ?? []).map((m) =>
          m.replace(/<\/?loc>/gi, "")
        );
        return { sitemap_url: sitemapUrl, url_count: urls.length, urls: urls.slice(0, 50) };
      } catch {
        return { error: "Sitemap not found" };
      }
    case "swot":
      return { note: "SWOT analysis is manual", scanned_at: new Date().toISOString() };
    case "seo":
      return { note: "SEO scan deprecated", scanned_at: new Date().toISOString() };
    case "ranking":
      return { note: "Ranking data requires search API", scanned_at: new Date().toISOString() };
    default:
      return {};
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = (await request.json()) as ScanRequest;

  if (!body.competitor_id || !Array.isArray(body.types) || body.types.length === 0) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  // Fetch competitor
  const { data: competitor, error: compError } = await supabase
    .from("competitors")
    .select("*")
    .eq("id", body.competitor_id)
    .single();

  if (compError || !competitor) {
    return NextResponse.json({ error: "Concurrent introuvable" }, { status: 404 });
  }

  const results: { type: SnapshotType; success: boolean }[] = [];

  for (const type of body.types) {
    // Fetch previous snapshot for comparison
    const { data: prevSnapshots } = await supabase
      .from("competitor_snapshots")
      .select("*")
      .eq("competitor_id", body.competitor_id)
      .eq("snapshot_type", type)
      .order("created_at", { ascending: false })
      .limit(1);

    const prevData = prevSnapshots?.[0]?.data as Record<string, unknown> | undefined;

    // Fetch new data
    const data = await fetchSnapshotData(type, {
      website_url: competitor.website_url ?? "",
      youtube_url: competitor.youtube_url ?? "",
    });

    // Store snapshot
    const { error: insertError } = await supabase
      .from("competitor_snapshots")
      .insert({
        competitor_id: body.competitor_id,
        snapshot_type: type,
        data,
      });

    results.push({ type, success: !insertError });

    // Compare and create alerts if there was a previous snapshot
    if (prevData && !data.error) {
      const alerts = detectChanges(type, prevData, data, body.competitor_id);
      if (alerts.length > 0) {
        await supabase.from("spy_alerts").insert(alerts);
      }
    }
  }

  return NextResponse.json({ results });
}

function detectChanges(
  type: SnapshotType,
  prev: Record<string, unknown>,
  curr: Record<string, unknown>,
  competitorId: string
) {
  const alerts: {
    competitor_id: string;
    alert_type: string;
    metric: string;
    old_value: string;
    new_value: string;
    change_percent: number | null;
    message: string;
  }[] = [];

  if (type === "metadata") {
    if (prev.title && curr.title && prev.title !== curr.title) {
      alerts.push({
        competitor_id: competitorId,
        alert_type: "metadata_change",
        metric: "title",
        old_value: String(prev.title),
        new_value: String(curr.title),
        change_percent: null,
        message: `Le titre du site a changé : "${prev.title}" → "${curr.title}"`,
      });
    }
    if (prev.description && curr.description && prev.description !== curr.description) {
      alerts.push({
        competitor_id: competitorId,
        alert_type: "metadata_change",
        metric: "description",
        old_value: String(prev.description),
        new_value: String(curr.description),
        change_percent: null,
        message: `La meta description a changé.`,
      });
    }
  }

  if (type === "youtube") {
    const prevCount = Number(prev.videoCount) || 0;
    const currCount = Number(curr.videoCount) || 0;
    if (prevCount > 0 && currCount > prevCount) {
      alerts.push({
        competitor_id: competitorId,
        alert_type: "youtube_new_video",
        metric: "video_count",
        old_value: String(prevCount),
        new_value: String(currCount),
        change_percent: null,
        message: `${currCount - prevCount} nouvelle(s) vidéo(s) YouTube publiée(s)`,
      });
    }
  }

  if (type === "sitemap") {
    const prevCount = Number(prev.url_count) || 0;
    const currCount = Number(curr.url_count) || 0;
    if (prevCount > 0 && currCount !== prevCount) {
      const change = ((currCount - prevCount) / prevCount) * 100;
      alerts.push({
        competitor_id: competitorId,
        alert_type: "sitemap_change",
        metric: "url_count",
        old_value: String(prevCount),
        new_value: String(currCount),
        change_percent: Math.round(change * 10) / 10,
        message: `Nombre de pages dans le sitemap : ${prevCount} → ${currCount}`,
      });
    }
  }

  return alerts;
}
