"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Phone, Mail, MapPin, StickyNote, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTACT_TYPE_LABELS } from "@/types";
import type { Contact, ContactType } from "@/types";

const iconMap: Record<ContactType, typeof Phone> = {
  appel: Phone,
  email: Mail,
  visite: MapPin,
  note: StickyNote,
};

const colorMap: Record<ContactType, string> = {
  appel: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  email: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  visite: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  note: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

interface InteractionTimelineProps {
  contacts: Contact[];
  clientId: string;
}

export function InteractionTimeline({ contacts, clientId }: InteractionTimelineProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<ContactType>("note");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  async function handleAdd() {
    if (!subject.trim()) {
      toast.error("Le sujet est requis");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("contacts").insert({
      client_id: clientId,
      type,
      subject,
      content,
      date: new Date().toISOString(),
      created_by: user?.id,
    });

    if (error) {
      toast.error("Erreur lors de l'ajout");
    } else {
      toast.success("Interaction ajoutée");
      setSubject("");
      setContent("");
      setShowForm(false);
      router.refresh();
    }
    setSubmitting(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Historique des interactions</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Type</Label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ContactType)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  {(Object.keys(CONTACT_TYPE_LABELS) as ContactType[]).map((t) => (
                    <option key={t} value={t}>
                      {CONTACT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Sujet *</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Sujet de l'interaction"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Contenu</Label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none"
                placeholder="Détails..."
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={submitting}>
                {submitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </div>
        )}

        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune interaction enregistrée.</p>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => {
              const Icon = iconMap[contact.type];
              const colors = colorMap[contact.type];
              return (
                <div key={contact.id} className="flex gap-3">
                  <div className={`rounded-full p-2 h-fit ${colors}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{contact.subject}</p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(contact.date), "d MMM yyyy à HH:mm", {
                          locale: fr,
                        })}
                      </span>
                    </div>
                    {contact.content && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {contact.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
