import { createPublicClient } from "@/lib/supabase/server";
import { INITIAL_DESIGNS } from "@/data/initialDesigns";

export interface PublicFeaturedDesign {
  id: string;
  updated_at?: string;
  created_at?: string;
}

/**
 * Returns the first 6 featured published designs from the database.
 * Falls back to INITIAL_DESIGNS.slice(0, 6) if the database is unreachable.
 */
export async function getPublicFeaturedDesigns(): Promise<PublicFeaturedDesign[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("designs")
      .select("id, updated_at, created_at")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(6);

    if (!error && data && data.length > 0) {
      return data as PublicFeaturedDesign[];
    }
  } catch (err) {
    console.warn("Could not fetch featured designs from Supabase:", err);
  }

  return INITIAL_DESIGNS.slice(0, 6).map((d) => ({
    id: d.id,
    updated_at: d.created_at,
    created_at: d.created_at,
  }));
}

/**
 * Checks whether a given design ID belongs to the top 6 publicly viewable featured designs.
 */
export async function isFeaturedDesign(designId: string): Promise<boolean> {
  const featured = await getPublicFeaturedDesigns();
  if (featured.some((d) => d.id === designId)) {
    return true;
  }
  // Also check initialDesigns fallback slice to support static fallback IDs
  const fallbackTeasers = INITIAL_DESIGNS.slice(0, 6).map((d) => d.id);
  return fallbackTeasers.includes(designId);
}
