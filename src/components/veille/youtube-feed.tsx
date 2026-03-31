"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Youtube, ExternalLink } from "lucide-react";

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  published: string;
  link: string;
}

interface YouTubeFeedProps {
  videos: YouTubeVideo[];
}

export function YouTubeFeed({ videos }: YouTubeFeedProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Youtube className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Aucune vidéo. Lancez un scan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {videos.slice(0, 5).map((video) => (
        <a
          key={video.videoId}
          href={video.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 rounded-lg border p-2 hover:bg-accent/50 transition-colors group"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-[120px] h-[68px] rounded object-cover shrink-0 bg-muted"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {video.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(video.published), "dd MMM yyyy", { locale: fr })}
            </p>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );
}
