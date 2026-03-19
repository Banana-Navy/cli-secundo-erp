"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { RSSArticle } from "@/types";

const MAX_VISIBLE = 5;
const TICKER_SPEED = 0.4; // px per frame

export function RSSNewsWidget() {
  const [articles, setArticles] = useState<RSSArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const offsetRef = useRef(0);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/rss");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArticles(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
    const interval = setInterval(fetchArticles, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchArticles]);

  // Slow auto-scroll ticker
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || articles.length <= MAX_VISIBLE || paused) return;

    // Inner content is duplicated so we can loop seamlessly
    const halfHeight = el.scrollHeight / 2;

    function tick() {
      if (!el) return;
      offsetRef.current += TICKER_SPEED;
      if (offsetRef.current >= halfHeight) {
        offsetRef.current -= halfHeight;
      }
      el.style.transform = `translateY(-${offsetRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [articles, paused]);

  // Reset offset on pause release
  useEffect(() => {
    if (paused) {
      cancelAnimationFrame(rafRef.current);
    }
  }, [paused]);

  const displayed = articles.slice(0, 12);
  const needsTicker = displayed.length > MAX_VISIBLE;

  return (
    <div className="rounded-[1.25rem] border-[3px] border-white bg-card p-6 dark:border-[#222]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="size-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Actualités</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={fetchArticles}
          disabled={loading}
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading && articles.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-2">
            Impossible de charger les actualités
          </p>
          <Button variant="outline" size="sm" onClick={fetchArticles}>
            Réessayer
          </Button>
        </div>
      ) : articles.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Aucune actualité disponible
        </p>
      ) : (
        <div
          className="overflow-hidden"
          style={{ maxHeight: `${MAX_VISIBLE * 64}px` }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div ref={scrollRef} className="will-change-transform">
            {/* Render items — duplicated for seamless loop */}
            {(needsTicker ? [...displayed, ...displayed] : displayed).map(
              (article, i) => (
                <a
                  key={`${article.link}-${i}`}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                      >
                        {article.source}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {formatDistanceToNow(new Date(article.pubDate), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
