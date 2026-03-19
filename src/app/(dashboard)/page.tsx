import Link from "next/link";
import { Plus, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PerformanceCards } from "@/components/dashboard/performance-cards";
import { SalesChart, RevenueChart } from "@/components/dashboard/sales-chart";
import { PropertyDistribution } from "@/components/dashboard/property-distribution";
import { ActionCenter } from "@/components/dashboard/action-center";
import { RecentActivityList } from "@/components/dashboard/recent-activity";
import { RecentProperties } from "@/components/dashboard/recent-properties";
import { RSSNewsWidget } from "@/components/dashboard/rss-news-widget";
import { AnalyticsWidget } from "@/components/dashboard/analytics-widget";
import {
  computeMonthlySales,
  computeAvgDaysToSell,
  computeDistribution,
  buildActionItems,
} from "@/lib/dashboard-utils";
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
} from "@/types";
import type {
  DashboardStats,
  SalesPerformance,
  RecentActivity,
  PropertyWithImages,
} from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // ─── Data fetching (single parallel batch) ──────────────────

  const [
    { count: totalProperties },
    { count: propertiesSoldThisMonth },
    { count: totalClients },
    { count: newClientsThisMonth },
    { data: soldProperties },
    { data: allProperties },
    { data: recentPropertiesRaw },
    { data: availableWithImages },
    { data: reservedProperties },
    { data: activeClients },
    { data: latestClients },
    { data: latestContacts },
    { data: latestProps },
  ] = await Promise.all([
    // Stats cards
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .in("status", ["disponible", "reserve"]),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "vendu")
      .gte("updated_at", startOfMonth),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth),

    // Sales analytics
    supabase
      .from("properties")
      .select("id, price, property_type, created_at, updated_at")
      .eq("status", "vendu"),

    // All properties for distribution
    supabase
      .from("properties")
      .select("id, status, property_type, price, published, title, created_at"),

    // Recent properties
    supabase
      .from("properties")
      .select("*, property_images(*)")
      .order("created_at", { ascending: false })
      .limit(6),

    // Action center: available properties with their images
    supabase
      .from("properties")
      .select("id, title, published, created_at, property_images(id)")
      .eq("status", "disponible"),

    // Action center: reserved properties > 30 days
    supabase
      .from("properties")
      .select("id, title, updated_at")
      .eq("status", "reserve")
      .lte("updated_at", thirtyDaysAgo),

    // Action center: active clients with contacts
    supabase
      .from("clients")
      .select("id, first_name, last_name, contacts(created_at)")
      .eq("status", "actif"),

    // Recent activity
    supabase
      .from("clients")
      .select("id, first_name, last_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contacts")
      .select("id, subject, type, created_at, clients(first_name, last_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("properties")
      .select("id, title, status, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // ─── Process stats cards ─────────────────────────────────────

  const stats: DashboardStats = {
    totalProperties: totalProperties ?? 0,
    propertiesSoldThisMonth: propertiesSoldThisMonth ?? 0,
    totalClients: totalClients ?? 0,
    newClientsThisMonth: newClientsThisMonth ?? 0,
  };

  // ─── Process sales performance ───────────────────────────────

  const sold = soldProperties ?? [];
  const totalRevenue = sold.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  const performance: SalesPerformance = {
    totalSold: sold.length,
    avgDaysToSell: computeAvgDaysToSell(sold),
    totalRevenue,
    avgSalePrice: sold.length > 0 ? Math.round(totalRevenue / sold.length) : 0,
  };

  // ─── Monthly sales chart data ────────────────────────────────

  const monthlySales = computeMonthlySales(sold);

  // ─── Distribution data ───────────────────────────────────────

  const allProps = allProperties ?? [];
  const typeDistribution = computeDistribution(allProps, "property_type", PROPERTY_TYPE_LABELS);
  const statusDistribution = computeDistribution(allProps, "status", PROPERTY_STATUS_LABELS);

  // ─── Action center ───────────────────────────────────────────

  const available = availableWithImages ?? [];

  const propertiesWithoutPhotos = available.filter(
    (p) => !p.property_images || p.property_images.length === 0
  );
  const staleProperties = available.filter(
    (p) => p.created_at < ninetyDaysAgo
  );
  const unpublishedProperties = available.filter((p) => !p.published);

  const inactiveClients = (activeClients ?? []).filter((c) => {
    const contacts = (c.contacts as { created_at: string }[]) ?? [];
    if (contacts.length === 0) return true;
    const lastContact = contacts.reduce((latest, ct) =>
      ct.created_at > latest ? ct.created_at : latest, ""
    );
    return lastContact < thirtyDaysAgo;
  });

  const actionItems = buildActionItems({
    propertiesWithoutPhotos,
    staleProperties,
    unpublishedProperties,
    inactiveClients,
    longReservations: reservedProperties ?? [],
  });

  const activities: RecentActivity[] = [];

  (latestProps ?? []).forEach((p) => {
    if (p.status === "vendu") {
      activities.push({
        id: `prop-sold-${p.id}`,
        type: "property_sold",
        title: `Bien vendu : ${p.title}`,
        description: "",
        created_at: p.updated_at,
      });
    } else {
      activities.push({
        id: `prop-${p.id}`,
        type: "property_added",
        title: `Nouveau bien : ${p.title}`,
        description: "",
        created_at: p.created_at,
      });
    }
  });

  (latestClients ?? []).forEach((c) => {
    activities.push({
      id: `client-${c.id}`,
      type: "client_added",
      title: `Nouveau client : ${c.first_name} ${c.last_name}`,
      description: "",
      created_at: c.created_at,
    });
  });

  interface ContactRow {
    id: string;
    subject: string;
    type: string;
    created_at: string;
    clients: { first_name: string; last_name: string }[] | null;
  }

  ((latestContacts as unknown as ContactRow[]) ?? []).forEach((ct) => {
    const client = ct.clients?.[0] ?? null;
    activities.push({
      id: `contact-${ct.id}`,
      type: "contact_added",
      title: ct.subject,
      description: client
        ? `${client.first_name} ${client.last_name}`
        : "",
      created_at: ct.created_at,
    });
  });

  activities.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const recentProperties = (recentPropertiesRaw ?? []) as PropertyWithImages[];

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d&apos;ensemble de votre activité immobilière
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/clients/nouveau">
              <UserPlus className="size-4" />
              Nouveau client
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/biens/nouveau">
              <Plus className="size-4" />
              Ajouter un bien
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview stats */}
      <StatsCards stats={stats} />

      {/* Sales performance KPIs */}
      <PerformanceCards performance={performance} />

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart data={monthlySales} />
        <RevenueChart data={monthlySales} />
      </div>

      {/* Analytics widget */}
      <AnalyticsWidget />

      {/* Distribution + Action Center */}
      <div className="grid gap-6 lg:grid-cols-3">
        <PropertyDistribution
          title="Par type de bien"
          data={typeDistribution}
          total={allProps.length}
        />
        <PropertyDistribution
          title="Par statut"
          data={statusDistribution}
          total={allProps.length}
        />
        <ActionCenter items={actionItems} />
      </div>

      {/* Recent properties + Activity + RSS */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <RecentProperties properties={recentProperties} />
        <div className="space-y-6">
          <RecentActivityList activities={activities.slice(0, 10)} />
          <RSSNewsWidget />
        </div>
      </div>
    </div>
  );
}
