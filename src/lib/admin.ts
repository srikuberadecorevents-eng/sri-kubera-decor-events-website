import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const testCookie =
    process.env.NODE_ENV !== "production"
      ? cookieStore.get("test_auth_user")?.value
      : null;
  let user: any = null;
  let isAdmin = false;
  let profile: any = null;

  if (testCookie) {
    try {
      user = JSON.parse(decodeURIComponent(testCookie));
      isAdmin = user?.user_metadata?.role === "admin";
      profile = {
        id: user.id,
        name: user.user_metadata?.name || "Administrator",
        email: user.email,
        role: user.user_metadata?.role || "admin",
      };
    } catch {}
  }

  const supabase = await createClient();
  if (!user) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  }

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    // Check JWT / User metadata first to eliminate DB roundtrip
    const metaRole = user.app_metadata?.role || user.user_metadata?.role;
    if (metaRole === "admin") {
      isAdmin = true;
      profile = {
        id: user.id,
        name: user.user_metadata?.name || "Administrator",
        email: user.email,
        role: "admin",
      };
    } else {
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("id, name, email, role")
        .eq("id", user.id)
        .maybeSingle();

      profile = dbProfile;
      isAdmin = profile?.role === "admin";
    }
  }

  if (!isAdmin) {
    redirect("/admin/403");
  }

  return { supabase, user, profile };
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const testCookie =
      process.env.NODE_ENV !== "production"
        ? cookieStore.get("test_auth_user")?.value
        : null;
    if (testCookie) {
      try {
        const u = JSON.parse(decodeURIComponent(testCookie));
        if (u?.user_metadata?.role === "admin") return true;
      } catch {}
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    if (user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin") {
      return true;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return profile?.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Returns a Supabase client with the service role key for administrative tasks (like storage operations)
 * NEVER expose this to the browser.
 */
export function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || serviceKey.includes("placeholder")) {
    return null;
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Log an administrative activity to the activity_log table.
 */
export async function logActivity({
  actorId,
  action,
  entity,
  entityId,
  summary,
}: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  summary: string;
}) {
  try {
    const serviceClient = getServiceRoleClient();
    if (serviceClient) {
      await serviceClient.from("activity_log").insert({
        actor_id: actorId || null,
        action,
        entity,
        entity_id: entityId || null,
        summary,
      });
      return;
    }

    const supabase = await createClient();
    await supabase.from("activity_log").insert({
      actor_id: actorId || null,
      action,
      entity,
      entity_id: entityId || null,
      summary,
    });
  } catch (err) {
    console.error("Failed to log admin activity:", err);
  }
}
