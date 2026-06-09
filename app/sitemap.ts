import type { MetadataRoute } from "next";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { CANONICAL_ORIGIN } from "@/lib/seo/site";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1.0 },
  { path: "/properties", changeFrequency: "hourly", priority: 0.95 },
  { path: "/support", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = CANONICAL_ORIGIN;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("listings")
      .select("id, updated_at")
      .eq("status", "approved")
      .order("updated_at", { ascending: false })
      .limit(5000);

    for (const row of (data ?? []) as Array<{
      id: string;
      updated_at: string;
    }>) {
      entries.push({
        url: `${base}/properties/${row.id}`,
        lastModified: new Date(row.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch (e) {
    console.error("[sitemap] listing fetch failed", e);
  }

  return entries;
}
