"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { useEntity } from "@/lib/hooks/use-entity";
import Image from "next/image";
import { Menu, Moon, Sun, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { EntitySelector } from "./entity-selector";
import { NotificationBell } from "./notification-bell";

// Lazy-load CommandSearch (contains react-markdown ~50KB gzipped)
const CommandSearch = dynamic(
  () => import("./command-search").then((m) => m.CommandSearch),
  { ssr: false }
);

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const { profile, activeEntity } = useEntity();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : userEmail;

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] ?? ""}`.toUpperCase()
    : userEmail
      ? userEmail.split("@")[0].slice(0, 2).toUpperCase()
      : "??";

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border/60 bg-background px-4 lg:px-6">
      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[17rem] p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
          <div className="flex h-16 items-center px-6">
            <Image
              src="/secundo-logo.svg"
              alt="Secundo"
              width={160}
              height={47}
              className="h-8 w-auto"
            />
          </div>
          <div className="px-3 pb-2">
            <EntitySelector />
          </div>
          <div className="h-px bg-sidebar-border" />
          <div className="px-3 py-4">
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* GringoAI Search */}
      <div className="flex flex-1 max-w-sm">
        <CommandSearch />
      </div>

      <div className="flex-1 md:hidden" />

      {/* Active entity badge */}
      {activeEntity && (
        <Badge variant="outline" className="hidden sm:flex gap-1.5 text-xs font-medium">
          {activeEntity.logo_url ? (
            <Image
              src={activeEntity.logo_url}
              alt={activeEntity.name}
              width={14}
              height={14}
              className="size-3.5 rounded-sm object-contain"
              unoptimized
            />
          ) : (
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: activeEntity.color || "var(--primary)" }}
            />
          )}
          {activeEntity.name}
        </Badge>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <NotificationBell />

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="size-[1.125rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-[1.125rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Changer le thème</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl">
            <div className="flex items-center gap-2 p-2">
              <User className="size-4 text-muted-foreground" />
              <div className="flex flex-col">
                <p className="text-sm font-medium truncate">{displayName}</p>
                {profile?.role && (
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-xl">
              <LogOut className="mr-2 size-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
