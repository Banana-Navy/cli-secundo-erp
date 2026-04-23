"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Pencil, Eye, Globe, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Promoter } from "@/types";

interface PromoterTableProps {
  promoters: Promoter[];
}

export function PromoterTable({ promoters }: PromoterTableProps) {
  if (promoters.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-8 text-center">
        Aucun promoteur trouvé.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white dark:bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Pays</TableHead>
            <TableHead>Coordonnées</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promoters.map((promoter) => (
            <TableRow key={promoter.id}>
              <TableCell className="font-medium">{promoter.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {promoter.contact_person || "—"}
              </TableCell>
              <TableCell>{promoter.country}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {promoter.phone && (
                    <a href={`tel:${promoter.phone}`} title={promoter.phone}>
                      <Phone className="size-3.5 text-muted-foreground hover:text-foreground" />
                    </a>
                  )}
                  {promoter.email && (
                    <a href={`mailto:${promoter.email}`} title={promoter.email}>
                      <Mail className="size-3.5 text-muted-foreground hover:text-foreground" />
                    </a>
                  )}
                  {promoter.website && (
                    <a
                      href={promoter.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={promoter.website}
                    >
                      <Globe className="size-3.5 text-muted-foreground hover:text-foreground" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(promoter.created_at), "dd MMM yyyy", {
                  locale: fr,
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href={`/promoteurs/${promoter.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href={`/promoteurs/${promoter.id}/modifier`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
