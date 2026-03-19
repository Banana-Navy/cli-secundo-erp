"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationsTab } from "@/components/settings/integrations-tab";

export function ParametresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profil";
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
    }
    load();
  }, []);

  async function handleUpdatePassword() {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error("Erreur lors de la mise à jour du mot de passe");
    } else {
      toast.success("Mot de passe mis à jour");
      setNewPassword("");
    }
    setSaving(false);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez votre profil et vos intégrations
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Votre adresse email de connexion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-md">
                <Label>Email</Label>
                <Input value={email} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>
                Mettez à jour votre mot de passe de connexion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                  />
                </div>
                <Button onClick={handleUpdatePassword} disabled={saving}>
                  {saving ? "Enregistrement..." : "Mettre à jour"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleLogout}>
                Se déconnecter
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
