"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { Mail, MessageSquare, Phone, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEntity } from "@/lib/hooks/use-entity";
import type { Communication, MessageTemplate } from "@/types";

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="size-4" />,
  sms: <MessageSquare className="size-4" />,
  whatsapp: <Phone className="size-4" />,
};

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

interface CommunicationsViewProps {
  initialCommunications: Communication[];
  templates: MessageTemplate[];
}

export function CommunicationsView({
  initialCommunications,
  templates,
}: CommunicationsViewProps) {
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const { activeEntity } = useEntity();

  const communications = useMemo(() => {
    let filtered = initialCommunications;
    if (channelFilter !== "all") {
      filtered = filtered.filter((c) => c.channel === channelFilter);
    }
    return filtered;
  }, [initialCommunications, channelFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Send className="h-6 w-6" />
            Communications
          </h1>
          <p className="text-muted-foreground">
            {communications.length} message{communications.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les canaux" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les canaux</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {communications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Send className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucune communication</p>
              <p className="text-sm text-muted-foreground mt-1">
                Les messages envoyés apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border bg-white dark:bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communications.map((comm) => (
                    <TableRow key={comm.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {CHANNEL_ICONS[comm.channel] ?? <Mail className="size-4" />}
                          <span className="text-sm">
                            {CHANNEL_LABELS[comm.channel] ?? comm.channel}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {comm.subject || "(sans sujet)"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {comm.direction === "outbound" ? "Sortant" : "Entrant"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {comm.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {comm.sent_at
                          ? format(new Date(comm.sent_at), "dd MMM yyyy HH:mm", {
                              locale: fr,
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucun template</p>
              <p className="text-sm text-muted-foreground mt-1">
                Créez des templates de messages pour les réutiliser.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="rounded-xl border p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{template.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {CHANNEL_LABELS[template.channel] ?? template.channel}
                    </Badge>
                  </div>
                  {template.subject && (
                    <p className="text-xs text-muted-foreground">
                      Sujet : {template.subject}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {template.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
