"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Phone,
  Mail,
  MapPin,
  StickyNote,
  Plus,
  Send,
  MessageCircle,
  BookOpen,
  Users,
  Calendar,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CONTACT_TYPE_LABELS,
  CONTACT_OUTCOME_LABELS,
} from "@/types";
import type { Contact, ContactType, ContactOutcome } from "@/types";

const iconMap: Record<ContactType, typeof Phone> = {
  appel: Phone,
  email: Mail,
  visite: MapPin,
  note: StickyNote,
  courrier: Send,
  sms: MessageCircle,
  whatsapp: MessageCircle,
  catalogue: BookOpen,
  salon: Users,
  rdv: Calendar,
};

const colorMap: Record<ContactType, string> = {
  appel: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  email: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  visite: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  note: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  courrier: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  sms: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  whatsapp: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  catalogue: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  salon: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  rdv: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

const outcomeColors: Record<ContactOutcome, string> = {
  positif: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  neutre: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  sans_reponse: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  negatif: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
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
  const [durationMinutes, setDurationMinutes] = useState("");
  const [outcome, setOutcome] = useState("");
  const [filterType, setFilterType] = useState<ContactType | "all">("all");

  const filteredContacts =
    filterType === "all"
      ? contacts
      : contacts.filter((c) => c.type === filterType);

  // Gather which types exist for filter badges
  const existingTypes = [...new Set(contacts.map((c) => c.type))];

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
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
      outcome: outcome || null,
      created_by: user?.id,
    });

    if (error) {
      toast.error("Erreur lors de l'ajout");
    } else {
      toast.success("Interaction ajoutée");
      setSubject("");
      setContent("");
      setDurationMinutes("");
      setOutcome("");
      setShowForm(false);
      // Recalculate lead score in the background
      const { data: { session } } = await supabase.auth.getSession();
      fetch(`/api/lead-score?client_id=${clientId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      }).catch(() => {});
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
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Durée (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="15"
                />
              </div>
              <div className="space-y-1">
                <Label>Résultat</Label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="">— Non précisé —</option>
                  {(Object.keys(CONTACT_OUTCOME_LABELS) as ContactOutcome[]).map((o) => (
                    <option key={o} value={o}>
                      {CONTACT_OUTCOME_LABELS[o]}
                    </option>
                  ))}
                </select>
              </div>
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

        {/* Filter badges */}
        {contacts.length > 0 && existingTypes.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge
              variant={filterType === "all" ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setFilterType("all")}
            >
              Tout ({contacts.length})
            </Badge>
            {existingTypes.map((t) => {
              const count = contacts.filter((c) => c.type === t).length;
              return (
                <Badge
                  key={t}
                  variant={filterType === t ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setFilterType(filterType === t ? "all" : t)}
                >
                  {CONTACT_TYPE_LABELS[t]} ({count})
                </Badge>
              );
            })}
          </div>
        )}

        {filteredContacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {contacts.length === 0
              ? "Aucune interaction enregistrée."
              : "Aucune interaction pour ce filtre."}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredContacts.map((contact) => {
              const Icon = iconMap[contact.type] ?? StickyNote;
              const colors = colorMap[contact.type] ?? colorMap.note;
              const outcomeKey = contact.outcome as ContactOutcome;
              return (
                <div key={contact.id} className="flex gap-3">
                  <div className={`rounded-full p-2 h-fit shrink-0 ${colors}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{contact.subject}</p>
                      {contact.duration_minutes && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {contact.duration_minutes} min
                        </span>
                      )}
                      {outcomeKey && CONTACT_OUTCOME_LABELS[outcomeKey] && (
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${outcomeColors[outcomeKey]}`}
                        >
                          {CONTACT_OUTCOME_LABELS[outcomeKey]}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(contact.date), "d MMM yyyy 'à' HH:mm", {
                        locale: fr,
                      })}
                    </span>
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
