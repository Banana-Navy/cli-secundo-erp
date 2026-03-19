"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Info, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type ConnectionStatus = "idle" | "loading" | "connected" | "error";

function StatusIndicator({ status }: { status: ConnectionStatus }) {
  switch (status) {
    case "connected":
      return <CheckCircle2 className="size-4 text-green-500" />;
    case "error":
      return <XCircle className="size-4 text-red-500" />;
    case "loading":
      return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
    default:
      return <div className="size-4 rounded-full border-2 border-muted-foreground/30" />;
  }
}

export function IntegrationsTab() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteSaving, setWebsiteSaving] = useState(false);

  const [mailchimpKey, setMailchimpKey] = useState("");
  const [mailchimpServer, setMailchimpServer] = useState("");
  const [mailchimpStatus, setMailchimpStatus] = useState<ConnectionStatus>("idle");

  const [gaPropertyId, setGaPropertyId] = useState("");
  const [gaCredentials, setGaCredentials] = useState("");
  const [gaStatus, setGaStatus] = useState<ConnectionStatus>("idle");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/settings");
      if (!res.ok) return;
      const data = await res.json() as { key: string; value: string }[];
      for (const s of data) {
        switch (s.key) {
          case "website_url":
            setWebsiteUrl(s.value);
            break;
          case "mailchimp_api_key":
            setMailchimpKey(s.value);
            if (s.value) setMailchimpStatus("connected");
            break;
          case "mailchimp_server_prefix":
            setMailchimpServer(s.value);
            break;
          case "ga_property_id":
            setGaPropertyId(s.value);
            if (s.value) setGaStatus("connected");
            break;
          case "ga_credentials_json":
            setGaCredentials(s.value);
            break;
        }
      }
    }
    load();
  }, []);

  async function saveWebsiteUrl() {
    if (!websiteUrl) {
      toast.error("Veuillez saisir l'URL du site vitrine");
      return;
    }
    setWebsiteSaving(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ key: "website_url", value: websiteUrl.replace(/\/+$/, "") }]),
    });
    if (res.ok) {
      toast.success("URL du site vitrine enregistrée");
    } else {
      toast.error("Erreur lors de la sauvegarde");
    }
    setWebsiteSaving(false);
  }

  async function saveMailchimp() {
    if (!mailchimpKey || !mailchimpServer) {
      toast.error("Veuillez remplir tous les champs Mailchimp");
      return;
    }
    setSaving(true);
    setMailchimpStatus("loading");
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { key: "mailchimp_api_key", value: mailchimpKey },
        { key: "mailchimp_server_prefix", value: mailchimpServer },
      ]),
    });
    if (res.ok) {
      toast.success("Configuration Mailchimp enregistrée");
      setMailchimpStatus("connected");
    } else {
      toast.error("Erreur lors de la sauvegarde");
      setMailchimpStatus("error");
    }
    setSaving(false);
  }

  async function testMailchimp() {
    setMailchimpStatus("loading");
    try {
      const res = await fetch("/api/mailchimp/lists");
      if (res.ok) {
        setMailchimpStatus("connected");
        toast.success("Connexion Mailchimp réussie");
      } else {
        setMailchimpStatus("error");
        toast.error("Échec de la connexion Mailchimp");
      }
    } catch {
      setMailchimpStatus("error");
      toast.error("Erreur de connexion");
    }
  }

  async function saveAnalytics() {
    if (!gaPropertyId || !gaCredentials) {
      toast.error("Veuillez remplir tous les champs Analytics");
      return;
    }
    setSaving(true);
    setGaStatus("loading");
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { key: "ga_property_id", value: gaPropertyId },
        { key: "ga_credentials_json", value: gaCredentials },
      ]),
    });
    if (res.ok) {
      toast.success("Configuration Analytics enregistrée");
      setGaStatus("connected");
    } else {
      toast.error("Erreur lors de la sauvegarde");
      setGaStatus("error");
    }
    setSaving(false);
  }

  async function testAnalytics() {
    setGaStatus("loading");
    try {
      const res = await fetch("/api/analytics/test");
      if (res.ok) {
        setGaStatus("connected");
        toast.success("Connexion Google Analytics réussie");
      } else {
        setGaStatus("error");
        toast.error("Échec de la connexion Google Analytics");
      }
    } catch {
      setGaStatus("error");
      toast.error("Erreur de connexion");
    }
  }

  return (
    <div className="space-y-6">
      {/* Site vitrine */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            <CardTitle>Site vitrine</CardTitle>
          </div>
          <CardDescription>
            URL de base de votre site vitrine public, utilisée pour le partage des biens sur les réseaux sociaux
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="website-url">URL du site</Label>
              <Input
                id="website-url"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://www.monsite.com"
              />
              <p className="text-xs text-muted-foreground">
                Les liens de partage seront au format : {websiteUrl || "https://www.monsite.com"}/biens/nom-du-bien
              </p>
            </div>
          </div>
          <Button onClick={saveWebsiteUrl} disabled={websiteSaving}>
            {websiteSaving && <Loader2 className="size-4 animate-spin mr-2" />}
            Enregistrer
          </Button>
        </CardContent>
      </Card>

      {/* Mailchimp */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <StatusIndicator status={mailchimpStatus} />
            <CardTitle>Mailchimp</CardTitle>
          </div>
          <CardDescription>
            Configurez votre connexion Mailchimp pour envoyer des campagnes email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="mc-key">Clé API</Label>
              <Input
                id="mc-key"
                type="password"
                value={mailchimpKey}
                onChange={(e) => setMailchimpKey(e.target.value)}
                placeholder="xxxxxxxx-us21"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mc-server">Préfixe serveur</Label>
              <Input
                id="mc-server"
                value={mailchimpServer}
                onChange={(e) => setMailchimpServer(e.target.value)}
                placeholder="us21"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveMailchimp} disabled={saving}>
              Enregistrer
            </Button>
            <Button variant="outline" onClick={testMailchimp} disabled={!mailchimpKey}>
              Tester la connexion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Google Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <StatusIndicator status={gaStatus} />
            <CardTitle>Google Analytics</CardTitle>
          </div>
          <CardDescription>
            Configurez GA4 pour afficher les métriques du site vitrine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="ga-id">ID propriété GA4</Label>
              <Input
                id="ga-id"
                value={gaPropertyId}
                onChange={(e) => setGaPropertyId(e.target.value)}
                placeholder="123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ga-creds">Credentials JSON (service account)</Label>
              <textarea
                id="ga-creds"
                value={gaCredentials}
                onChange={(e) => setGaCredentials(e.target.value)}
                placeholder='{"type": "service_account", ...}'
                rows={4}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveAnalytics} disabled={saving}>
              Enregistrer
            </Button>
            <Button variant="outline" onClick={testAnalytics} disabled={!gaPropertyId}>
              Tester la connexion
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RSS */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="size-4 text-blue-500" />
            <CardTitle>Flux RSS</CardTitle>
          </div>
          <CardDescription>
            Les actualités immobilières espagnoles sont récupérées automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les sources sont configurées automatiquement. Le widget RSS du tableau de bord
            affiche les dernières actualités de ThinkSpain, Spanish Property Insight
            et d&apos;autres sources immobilières espagnoles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
