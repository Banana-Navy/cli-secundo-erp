"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/lib/format";
import { PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from "@/types";
import type { PropertyWithImages, PropertyStatus } from "@/types";

function statusVariant(status: PropertyStatus) {
  switch (status) {
    case "disponible":
      return "default" as const;
    case "reserve":
      return "secondary" as const;
    case "vendu":
      return "outline" as const;
    case "retire":
      return "destructive" as const;
  }
}

interface PropertyCardProps {
  property: PropertyWithImages;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (id: string) => void;
}

export const PropertyCard = memo(function PropertyCard({
  property,
  selectable,
  selected,
  onToggle,
}: PropertyCardProps) {
  const cover =
    property.property_images?.find((img) => img.is_cover) ??
    property.property_images?.[0];

  const content = (
    <>
      <div className="aspect-[16/10] bg-muted relative overflow-hidden">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt || property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Pas de photo
          </div>
        )}
        {selectable && (
          <div
            className="absolute top-2 left-2 z-10"
            onClick={(e) => e.preventDefault()}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggle?.(property.id)}
              onClick={(e) => e.stopPropagation()}
              className="size-5 bg-background/80 backdrop-blur-sm"
            />
          </div>
        )}
        <div className={`absolute top-2 ${selectable ? "left-9" : "left-2"}`}>
          <Badge variant={statusVariant(property.status)}>
            {PROPERTY_STATUS_LABELS[property.status]}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {PROPERTY_TYPE_LABELS[property.property_type]}
          </Badge>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <p className="font-bold text-lg text-primary">{formatPrice(property.price)}</p>
        <p className="font-medium truncate">{property.title}</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">
            {property.location_city}
            {property.location_region && `, ${property.location_region}`}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1 border-t">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" /> {property.bedrooms} ch.
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5" /> {property.bathrooms} sdb
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5" /> {property.surface} m²
          </span>
        </div>
      </div>
    </>
  );

  if (selectable) {
    return (
      <div
        className={`group block rounded-lg border overflow-hidden hover:shadow-md transition-shadow bg-card cursor-pointer ${
          selected ? "ring-2 ring-primary" : ""
        }`}
        onClick={() => onToggle?.(property.id)}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/biens/${property.id}`}
      className="group block rounded-lg border overflow-hidden hover:shadow-md transition-shadow bg-card"
    >
      {content}
    </Link>
  );
});
