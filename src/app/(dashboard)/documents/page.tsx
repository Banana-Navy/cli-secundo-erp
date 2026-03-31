"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  File,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DocumentUploadDialog } from "@/components/documents/document-upload-dialog";
import type { Document as DocumentRow } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  contrat: "Contrat",
  facture: "Facture",
  compromis: "Compromis",
  acte: "Acte",
  photo: "Photo",
  plan: "Plan",
  diagnostic: "Diagnostic",
  autre: "Autre",
};

const CATEGORY_COLORS: Record<string, string> = {
  contrat: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  facture:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  compromis:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  acte: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  photo: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  plan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  diagnostic:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  autre: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
};

function getFileIcon(fileType: string) {
  if (fileType.includes("pdf") || fileType.includes("text")) {
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
  return <File className="h-4 w-4 text-muted-foreground" />;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des documents.");
    } else {
      setDocuments((data ?? []) as DocumentRow[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (doc: DocumentRow) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_url, 60);

    if (error || !data?.signedUrl) {
      toast.error("Erreur lors de la génération du lien de téléchargement.");
      return;
    }

    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async (doc: DocumentRow) => {
    const confirmed = window.confirm(
      `Supprimer le document "${doc.name}" ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    setDeletingId(doc.id);

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([doc.file_url]);

    if (storageError) {
      toast.error("Erreur lors de la suppression du fichier.");
      setDeletingId(null);
      return;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);

    setDeletingId(null);

    if (dbError) {
      toast.error("Erreur lors de la suppression de l'enregistrement.");
    } else {
      toast.success("Document supprimé.");
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    }
  };

  const filteredDocuments =
    filterCategory === "all"
      ? documents
      : documents.filter((d) => d.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? "s" : ""} au
            total
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nouveau document
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-accent animate-pulse"
            />
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Aucun document</p>
          <p className="text-sm text-muted-foreground mt-1">
            {filterCategory === "all"
              ? "Commencez par téléverser un document."
              : "Aucun document dans cette catégorie."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white dark:bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFileIcon(doc.file_type)}
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "border-0",
                        CATEGORY_COLORS[doc.category] ??
                          CATEGORY_COLORS.autre
                      )}
                    >
                      {CATEGORY_LABELS[doc.category] ?? doc.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {doc.file_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(doc.created_at), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDownload(doc)}
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(doc)}
                        disabled={deletingId === doc.id}
                        title="Supprimer"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DocumentUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={fetchDocuments}
      />
    </div>
  );
}
