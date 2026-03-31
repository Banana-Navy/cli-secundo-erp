"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, LogOut, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { CommandSearch } from "./command-search";
import { NotificationBell } from "./notification-bell";

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userEmail
    ? userEmail
        .split("@")[0]
        .slice(0, 2)
        .toUpperCase()
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
          <div className="flex h-16 items-center gap-3 px-6">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Home className="size-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Secundo
            </span>
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
              <p className="text-sm truncate">{userEmail}</p>
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
