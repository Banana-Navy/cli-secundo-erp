import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { PROPERTY_STATUS_LABELS } from "@/types";
import type { PropertyWithImages } from "@/types";

function statusVariant(status: string) {
  switch (status) {
    case "disponible":
      return "default" as const;
    case "reserve":
      return "secondary" as const;
    case "vendu":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

interface RecentPropertiesProps {
  properties: PropertyWithImages[];
}

export function RecentProperties({ properties }: RecentPropertiesProps) {
  return (
    <div className="rounded-[1.25rem] border-[3px] border-white bg-card dark:border-[#222]">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h3 className="text-lg font-semibold text-foreground">Biens récents</h3>
        <Button variant="outline" size="sm" asChild>
          <Link href="/biens">Voir tout</Link>
        </Button>
      </div>
      <div className="px-6 pb-6">
        {properties.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun bien pour le moment.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const cover = property.property_images?.find((img) => img.is_cover) ??
                property.property_images?.[0];
              return (
                <Link
                  key={property.id}
                  href={`/biens/${property.id}`}
                  className="group block rounded-2xl bg-white overflow-hidden hover:shadow-lg transition-all duration-300 dark:bg-white/5"
                >
                  <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                    {cover ? (
                      <Image
                        src={cover.url}
                        alt={cover.alt || property.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        Pas de photo
                      </div>
                    )}
                    <Badge
                      variant={statusVariant(property.status)}
                      className="absolute top-3 right-3"
                    >
                      {PROPERTY_STATUS_LABELS[property.status]}
                    </Badge>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="font-bold text-xl leading-tight text-foreground">
                      {formatPrice(property.price)}
                    </p>
                    <p className="text-sm font-medium truncate text-foreground/80">
                      {property.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" />
                      <span className="truncate">
                        {property.location_city}
                        {property.location_region && `, ${property.location_region}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <span className="flex items-center gap-1 pt-2">
                        <Bed className="size-3.5" /> {property.bedrooms}
                      </span>
                      <span className="flex items-center gap-1 pt-2">
                        <Bath className="size-3.5" /> {property.bathrooms}
                      </span>
                      <span className="flex items-center gap-1 pt-2">
                        <Maximize className="size-3.5" /> {property.surface} m²
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
