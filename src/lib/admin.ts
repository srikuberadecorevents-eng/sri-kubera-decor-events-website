import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/admin/403");
  }

  return { supabase, user, profile };
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

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

  if (!url || !serviceKey) {
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
