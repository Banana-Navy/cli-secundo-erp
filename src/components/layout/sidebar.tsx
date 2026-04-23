"use client";

import Image from "next/image";
import { SidebarNav } from "./sidebar-nav";
import { EntitySelector } from "./entity-selector";

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:w-[17rem] lg:flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Image
          src="/secundo-logo.svg"
          alt="Secundo"
          width={160}
          height={47}
          className="h-8 w-auto"
          priority
        />
      </div>

      {/* Entity selector */}
      <div className="px-3 pb-2">
        <EntitySelector />
      </div>

      <div className="h-px bg-sidebar-border mx-3" />

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
