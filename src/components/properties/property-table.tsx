"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/format";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/types";
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

interface PropertyTableViewProps {
  properties: PropertyWithImages[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
}

export function PropertyTableView({
  properties,
  selectable,
  selectedIds,
  onToggle,
  onToggleAll,
}: PropertyTableViewProps) {
  const router = useRouter();

  const allSelected =
    selectable && properties.length > 0 && selectedIds?.size === properties.length;

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Supprimer le bien "${title}" ?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Bien supprimé");
      router.refresh();
    }
  }

  return (
    <div className="rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onToggleAll}
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left font-medium">Bien</th>
              <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Type</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Ville</th>
              <th className="px-4 py-3 text-right font-medium">Prix</th>
              <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">Surface</th>
              <th className="px-4 py-3 text-left font-medium">Statut</th>
              <th className="px-4 py-3 text-right font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 ? (
              <tr>
                <td
                  colSpan={selectable ? 8 : 7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Aucun bien trouvé.
                </td>
              </tr>
            ) : (
              properties.map((property) => {
                const cover =
                  property.property_images?.find((img) => img.is_cover) ??
                  property.property_images?.[0];
                return (
                  <tr
                    key={property.id}
                    className={`border-b last:border-0 hover:bg-muted/30 ${
                      selectable && selectedIds?.has(property.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds?.has(property.id)}
                          onCheckedChange={() => onToggle?.(property.id)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded bg-muted overflow-hidden shrink-0 relative">
                          {cover && (
                            <Image
                              src={cover.url}
                              alt={cover.alt || property.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <Link
                          href={`/biens/${property.id}`}
                          className="font-medium hover:underline truncate"
                        >
                          {property.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {PROPERTY_TYPE_LABELS[property.property_type]}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {property.location_city}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">
                      {property.surface} m²
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(property.status)}>
                        {PROPERTY_STATUS_LABELS[property.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-xs" aria-label="Actions pour ce bien">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/biens/${property.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> Voir
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/biens/${property.id}/modifier`}>
                              <Pencil className="mr-2 h-4 w-4" /> Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(property.id, property.title)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
