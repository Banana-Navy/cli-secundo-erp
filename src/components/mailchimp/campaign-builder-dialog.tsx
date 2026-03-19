"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Send, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { MailchimpList } from "@/types";

interface CampaignBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyIds: string[];
  onSuccess: () => void;
}

export function CampaignBuilderDialog({
  open,
  onOpenChange,
  propertyIds,
  onSuccess,
}: CampaignBuilderDialogProps) {
  const [step, setStep] = useState(1);
  const [previewHtml, setPreviewHtml] = useState("");
  const [lists, setLists] = useState<MailchimpList[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [subject, setSubject] = useState("Secundo — Notre sélection de biens");
  const [fromName, setFromName] = useState("Secundo");
  const [replyTo, setReplyTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Load preview when dialog opens
  useEffect(() => {
    if (!open || propertyIds.length === 0) return;
    setStep(1);
    setLoading(true);
    fetch("/api/mailchimp/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyIds }),
    })
      .then((r) => r.json())
      .then((d) => setPreviewHtml(d.html ?? ""))
      .catch(() => toast.error("Erreur lors du chargement de la preview"))
      .finally(() => setLoading(false));
  }, [open, propertyIds]);

  // Load lists when moving to step 2
  useEffect(() => {
    if (step !== 2 || lists.length > 0) return;
    setLoading(true);
    fetch("/api/mailchimp/lists")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLists(data);
          if (data.length > 0) {
            setSelectedListId((prev) => prev || data[0].id);
          }
        } else {
          toast.error(data.error || "Impossible de charger les listes");
        }
      })
      .catch(() => toast.error("Erreur de connexion Mailchimp"))
      .finally(() => setLoading(false));
  }, [step, lists.length]);

  async function handleSend() {
    if (!selectedListId || !subject) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/mailchimp/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyIds,
          listId: selectedListId,
          subject,
          fromName,
          replyTo,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Campagne envoyée avec succès !");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(data.error || "Erreur lors de l'envoi");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSending(false);
    }
  }

  const stepTitles = [
    "",
    "Preview de l'email",
    "Choisir l'audience",
    "Finaliser et envoyer",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{stepTitles[step]}</DialogTitle>
          <DialogDescription>
            Étape {step} sur 3 — {propertyIds.length} bien
            {propertyIds.length > 1 ? "s" : ""} sélectionné
            {propertyIds.length > 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Step 1: Preview */}
          {step === 1 && (
            <div className="rounded-lg border overflow-hidden bg-muted/30">
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <iframe
                  srcDoc={previewHtml}
                  title="Preview email"
                  className="w-full h-[400px] border-0"
                  sandbox="allow-same-origin"
                />
              )}
            </div>
          )}

          {/* Step 2: Audience */}
          {step === 2 && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : lists.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune liste trouvée. Vérifiez votre configuration Mailchimp.
                </p>
              ) : (
                <div className="space-y-2">
                  <Label>Liste d&apos;audience</Label>
                  <div className="space-y-2">
                    {lists.map((list) => (
                      <label
                        key={list.id}
                        className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                          selectedListId === list.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="list"
                            value={list.id}
                            checked={selectedListId === list.id}
                            onChange={() => setSelectedListId(list.id)}
                            className="accent-primary"
                          />
                          <span className="font-medium">{list.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {list.member_count.toLocaleString("fr-BE")} contact
                          {list.member_count > 1 ? "s" : ""}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Subject + send */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Objet de l&apos;email</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Objet de la campagne"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-name">Nom de l&apos;expéditeur</Label>
                <Input
                  id="from-name"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Secundo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply-to">Email de réponse</Label>
                <Input
                  id="reply-to"
                  type="email"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="info@secundo.be"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={sending}
            >
              <ChevronLeft className="size-4 mr-1" />
              Retour
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={loading}>
              Suivant
              <ChevronRight className="size-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={sending || !selectedListId}>
              {sending ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="size-4 mr-1" />
                  Envoyer la campagne
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
