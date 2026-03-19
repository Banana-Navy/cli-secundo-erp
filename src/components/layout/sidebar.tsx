"use client";

import { SidebarNav } from "./sidebar-nav";
import { Home } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:w-[17rem] lg:flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <Home className="size-4 text-sidebar-primary-foreground" />
        </div>
        <span className="font-bold text-lg tracking-tight text-white">
          Secundo
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav />
      </div>

      {/* Bottom gradient fade */}
      <div className="h-px bg-sidebar-border" />
      <div className="px-5 py-4">
        <p className="text-xs text-sidebar-foreground/40">
          ERP Immobilier
        </p>
      </div>
    </aside>
  );
}
