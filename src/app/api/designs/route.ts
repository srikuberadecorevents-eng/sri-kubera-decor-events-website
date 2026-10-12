import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { INITIAL_DESIGNS } from "@/data/initialDesigns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  try {
    // Base query for published designs
    let query = supabase
      .from("designs")
      .select("*, categories(id, name, created_at)", { count: "exact" })
      .eq("status", "published")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category_id", category);
    }

    if (search && search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    // SERVER-SIDE GATING ENFORCEMENT:
    // If not authenticated, strictly limit query to 6 teaser designs
    if (!isAuthenticated) {
      query = query.limit(6);
    }

    const { data, error, count } = await query;

    if (!error && data) {
      const totalAvailable = count ?? (data.length > 6 ? data.length : 36);
      return NextResponse.json({
        designs: data,
        totalCount: totalAvailable,
        isAuthenticated,
        isGated: !isAuthenticated,
        lockedCount: !isAuthenticated ? Math.max(0, totalAvailable - data.length) : 0,
      });
    }
  } catch (err) {
    console.warn("API /api/designs error, falling back:", err);
  }

  // Fallback data when database is unavailable
  let fallbackList = [...INITIAL_DESIGNS];
  if (category && category !== "all") {
    fallbackList = fallbackList.filter((d) => d.category_id === category);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    fallbackList = fallbackList.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.inclusions?.toLowerCase().includes(q)
    );
  }

  const totalAvailable = fallbackList.length;
  const returnedDesigns = !isAuthenticated ? fallbackList.slice(0, 6) : fallbackList;

  return NextResponse.json({
    designs: returnedDesigns,
    totalCount: totalAvailable,
    isAuthenticated,
    isGated: !isAuthenticated,
    lockedCount: !isAuthenticated ? Math.max(0, totalAvailable - returnedDesigns.length) : 0,
  });
}
