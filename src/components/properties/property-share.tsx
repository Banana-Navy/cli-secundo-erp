"use client";

import { toast } from "sonner";
import { Facebook, Instagram, MessageCircle, Link2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";

interface PropertyShareProps {
  websiteUrl: string | null;
  slug: string;
  title: string;
  price: number;
  city: string;
}

export function PropertyShare({ websiteUrl, slug, title, price, city }: PropertyShareProps) {
  if (!websiteUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" /> Partager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configurez l&apos;URL de votre site vitrine dans{" "}
            <Link
              href="/parametres?tab=integrations"
              className="text-primary underline underline-offset-4"
            >
              Paramètres &gt; Intégrations
            </Link>{" "}
            pour activer le partage.
          </p>
        </CardContent>
      </Card>
    );
  }

  const propertyUrl = `${websiteUrl}/biens/${slug}`;
  const shareText = `${title} — ${formatPrice(price)} — ${city}`;

  function shareOnFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  }

  function shareOnWhatsApp() {
    const text = `${shareText}\n${propertyUrl}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function shareOnInstagram() {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: propertyUrl });
        return;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(propertyUrl);
    toast.success("Lien copié ! Collez-le dans votre story ou message Instagram.");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(propertyUrl);
    toast.success("Lien copié dans le presse-papiers");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" /> Partager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={shareOnFacebook}>
            <Facebook className="h-4 w-4 mr-1" />
            Facebook
          </Button>
          <Button variant="outline" size="sm" onClick={shareOnWhatsApp}>
            <MessageCircle className="h-4 w-4 mr-1" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={shareOnInstagram}>
            <Instagram className="h-4 w-4 mr-1" />
            Instagram
          </Button>
          <Button variant="ghost" size="sm" onClick={copyLink}>
            <Link2 className="h-4 w-4 mr-1" />
            Copier le lien
          </Button>
        </div>
        <p className="text-xs text-muted-foreground truncate">{propertyUrl}</p>
      </CardContent>
    </Card>
  );
}
