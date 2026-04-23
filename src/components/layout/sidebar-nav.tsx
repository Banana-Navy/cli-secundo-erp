"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  ListTodo,
  Calendar,
  Kanban,
  FileText,
  Eye,
  Settings,
  HardHat,
  Send,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Biens immobiliers",
    href: "/biens",
    icon: Building2,
  },
  {
    title: "Promoteurs",
    href: "/promoteurs",
    icon: HardHat,
  },
  {
    title: "Tâches",
    href: "/taches",
    icon: ListTodo,
  },
  {
    title: "Agenda",
    href: "/agenda",
    icon: Calendar,
  },
  {
    title: "Pipeline",
    href: "/pipeline",
    icon: Kanban,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Communications",
    href: "/communications",
    icon: Send,
  },
  {
    title: "Veille",
    href: "/veille",
    icon: Eye,
  },
  {
    title: "Paramètres",
    href: "/parametres",
    icon: Settings,
  },
];

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.disabled ? "#" : item.href}
            onClick={item.disabled ? (e) => e.preventDefault() : onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.08),inset_0_-0.5px_1px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.25)]"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              item.disabled && "pointer-events-none opacity-50"
            )}
          >
            <item.icon className="size-[1.125rem]" />
            <span>{item.title}</span>
            {item.badge && (
              <span className="ml-auto rounded-full bg-sidebar-primary/20 px-2 py-0.5 text-xs font-semibold text-sidebar-primary">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
