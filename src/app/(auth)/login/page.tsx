"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Erreur de connexion", {
        description: error.message,
      });
      setLoading(false);
      return;
    }

    toast.success("Connexion réussie");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-[28.75rem] rounded-[1.875rem] border-[8px] border-white/10 bg-[#f5f5f5] p-[3.125rem] flex flex-col gap-[1.875rem]">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
          <Home className="size-6 text-primary" />
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2.5 text-center">
        <h5 className="text-xl font-semibold tracking-tight text-[#262626]">
          Bienvenue sur Secundo
        </h5>
        <p className="text-base text-[#5d5d5d]">
          Connectez-vous pour continuer.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Label htmlFor="email" className="text-sm font-medium text-[#262626]">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-[#262626]">
              Mot de passe *
            </Label>
            <Link
              href="#"
              className="text-sm font-medium text-[#262626] hover:text-primary transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="animate-spin" />}
          Se connecter
        </Button>
      </form>

      {/* Separator */}
      <div className="flex items-center gap-5">
        <div className="h-px flex-1 bg-[#ededed]" />
        <span className="text-sm text-[#5d5d5d]">OU</span>
        <div className="h-px flex-1 bg-[#ededed]" />
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-[#5d5d5d]">
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary hover:underline underline-offset-4"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
