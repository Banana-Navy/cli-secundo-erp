"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyImage } from "@/types";

interface PropertyGalleryProps {
  images: PropertyImage[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  const sorted = useMemo(
    () =>
      [...images].sort((a, b) => {
        if (a.is_cover) return -1;
        if (b.is_cover) return 1;
        return a.sort_order - b.sort_order;
      }),
    [images]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  if (sorted.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        Aucune photo disponible
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-muted">
        <Image
          src={sorted[activeIndex].url}
          alt={sorted[activeIndex].alt || "Photo du bien"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
          className="object-cover"
          priority={activeIndex === 0}
        />
        {sorted.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Photo précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
              onClick={() =>
                setActiveIndex((i) => (i - 1 + sorted.length) % sorted.length)
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Photo suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
              onClick={() =>
                setActiveIndex((i) => (i + 1) % sorted.length)
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {activeIndex + 1} / {sorted.length}
            </div>
          </>
        )}
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors relative ${
                i === activeIndex ? "border-primary" : "border-transparent"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
