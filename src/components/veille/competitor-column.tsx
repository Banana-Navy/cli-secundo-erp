"use client";

import { useState } from "react";
import {
  Globe,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  ChevronDown,
  Shield,
  AlertTriangle,
  TrendingUp,
  Target,
  Swords,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YouTubeFeed } from "@/components/veille/youtube-feed";
import type { Competitor, CompetitorSnapshot } from "@/types";

// TikTok icon
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.38-6.22V9.06a8.16 8.16 0 0 0 3.84.96V6.69Z" />
    </svg>
  );
}

interface SocialLink {
  key: keyof Competitor;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}

const socialLinks: SocialLink[] = [
  { key: "website_url", icon: Globe, label: "Site web", color: "text-blue-600" },
  { key: "google_maps_url", icon: MapPin, label: "Google Maps", color: "text-red-500" },
  { key: "facebook_url", icon: Facebook, label: "Facebook", color: "text-blue-500" },
  { key: "instagram_url", icon: Instagram, label: "Instagram", color: "text-pink-500" },
  { key: "linkedin_url", icon: Linkedin, label: "LinkedIn", color: "text-blue-700" },
  { key: "youtube_url", icon: Youtube, label: "YouTube", color: "text-red-600" },
  { key: "tiktok_url", icon: TikTokIcon, label: "TikTok", color: "text-foreground" },
];

// Quick action links (no embed available, just link out)
const quickLinks: { key: keyof Competitor; icon: React.ComponentType<{ className?: string }>; label: string; color: string }[] = [
  { key: "instagram_url", icon: Instagram, label: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
  { key: "linkedin_url", icon: Linkedin, label: "LinkedIn", color: "bg-blue-700 text-white" },
  { key: "tiktok_url", icon: TikTokIcon, label: "TikTok", color: "bg-foreground text-background" },
];

interface CompetitorColumnProps {
  competitor: Competitor;
  snapshots: CompetitorSnapshot[];
}

export function CompetitorColumn({ competitor, snapshots }: CompetitorColumnProps) {
  const [swotOpen, setSwotOpen] = useState(false);

  // Get latest snapshot per type
  const latest = (type: string) =>
    snapshots.find((s) => s.snapshot_type === type);

  const swot = latest("swot")?.data as Record<string, unknown> | undefined;
  const youtubeSnapshot = latest("youtube")?.data as Record<string, unknown> | undefined;
  const youtubeVideos = (youtubeSnapshot?.videos as Array<{
    videoId: string;
    title: string;
    thumbnail: string;
    published: string;
    link: string;
  }>) ?? [];

  // Google rating from metadata or reviews
  const reviews = latest("reviews")?.data as Record<string, unknown> | undefined;
  const googleRating = reviews?.rating as number | undefined;

  return (
    <div className="space-y-4">
      {/* Header: Name + social icons + Google rating */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">{competitor.name}</CardTitle>
            {googleRating && (
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {googleRating.toFixed(1)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {socialLinks.map(({ key, icon: Icon, label, color }) => {
              const url = competitor[key] as string;
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className={`inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-accent transition-colors ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </CardHeader>
      </Card>

      {/* Facebook Page Plugin iframe */}
      {competitor.facebook_url && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-500" />
              Facebook
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <iframe
              src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(competitor.facebook_url)}&tabs=timeline&width=400&height=500&small_header=true&adapt_container_width=true&hide_cover=false`}
              width="100%"
              height={500}
              style={{ border: "none", overflow: "hidden" }}
              allow="encrypted-media"
              title={`Facebook - ${competitor.name}`}
            />
          </CardContent>
        </Card>
      )}

      {/* YouTube Feed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Youtube className="h-4 w-4 text-red-600" />
            Dernières vidéos YouTube
          </CardTitle>
        </CardHeader>
        <CardContent>
          <YouTubeFeed videos={youtubeVideos} />
        </CardContent>
      </Card>

      {/* Quick Links: Instagram / LinkedIn / TikTok */}
      {quickLinks.some(({ key }) => !!competitor[key]) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Liens rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {quickLinks.map(({ key, icon: Icon, label, color }) => {
              const url = competitor[key] as string;
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80 ${color}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* SWOT Collapsible */}
      {swot && (
        <Card>
          <CardHeader className="pb-0">
            <Button
              variant="ghost"
              className="w-full justify-between px-0 hover:bg-transparent"
              onClick={() => setSwotOpen(!swotOpen)}
            >
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Swords className="h-4 w-4" />
                Analyse SWOT
              </CardTitle>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${swotOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </CardHeader>
          {swotOpen && (
            <CardContent className="space-y-3 pt-3">
              {typeof swot.summary === "string" && (
                <p className="text-sm bg-muted rounded-lg p-3">{swot.summary}</p>
              )}
              <div className="grid gap-3 grid-cols-1">
                <SwotQuadrant
                  title="Forces"
                  items={swot.strengths as string[] | undefined}
                  icon={Shield}
                  color="text-emerald-600"
                  bg="bg-emerald-50 dark:bg-emerald-950/30"
                />
                <SwotQuadrant
                  title="Faiblesses"
                  items={swot.weaknesses as string[] | undefined}
                  icon={AlertTriangle}
                  color="text-red-500"
                  bg="bg-red-50 dark:bg-red-950/30"
                />
                <SwotQuadrant
                  title="Opportunites"
                  items={swot.opportunities as string[] | undefined}
                  icon={TrendingUp}
                  color="text-blue-600"
                  bg="bg-blue-50 dark:bg-blue-950/30"
                />
                <SwotQuadrant
                  title="Menaces"
                  items={swot.threats as string[] | undefined}
                  icon={Target}
                  color="text-amber-600"
                  bg="bg-amber-50 dark:bg-amber-950/30"
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Notes */}
      {competitor.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{competitor.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SwotQuadrant({
  title,
  items,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  items: string[] | undefined;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`rounded-xl ${bg} p-3 space-y-1.5`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        <h4 className={`text-xs font-semibold ${color}`}>{title}</h4>
      </div>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
            <span className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-current opacity-40" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
