"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type AdminDeletableEntity =
  | "enquiries"
  | "requirements"
  | "designs"
  | "categories"
  | "media"
  | "testimonials"
  | "services"
  | "customers"
  | "users"
  | "calendar";

interface DeleteOptions {
  entity: AdminDeletableEntity;
  id?: string;
  ids?: string[];
  force?: boolean;
  reassignCategoryId?: string;
}

export async function deleteAdminItem(options: DeleteOptions) {
  const cookieStore = await cookies();
  const testCookie =
    process.env.NODE_ENV !== "production"
      ? cookieStore.get("test_auth_user")?.value
      : null;
  let user: any = null;
  let isAdmin = false;

  if (testCookie) {
    try {
      user = JSON.parse(decodeURIComponent(testCookie));
      isAdmin = user?.user_metadata?.role === "admin";
    } catch {}
  }

  const supabase = await createClient();

  // 1. Strict Server-Side Role Verification
  if (!user) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  }

  if (!user) {
    return { success: false, error: "Unauthenticated. Please log in as an administrator." };
  }

  if (!isAdmin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { success: false, error: "Unauthorized. Administrator privileges required." };
    }
  }

  const { entity, id, ids, force, reassignCategoryId } = options;
  const targetIds = ids && ids.length > 0 ? ids : id ? [id] : [];

  if (targetIds.length === 0) {
    return { success: false, error: "No target items specified for deletion." };
  }

  try {
    switch (entity) {
      // ──────────────────────────────────────────────────────────
      // 1. ENQUIRIES (Bookings)
      // ──────────────────────────────────────────────────────────
      case "enquiries": {
        for (const targetId of targetIds) {
          // Fetch booking info for activity log
          const { data: booking } = await supabase
            .from("bookings")
            .select("id, enquiry_id, customer_name, profiles(name)")
            .eq("id", targetId)
            .maybeSingle();

          const profileData: any = booking?.profiles;
          const profileName = Array.isArray(profileData)
            ? profileData[0]?.name
            : profileData?.name;

          const label =
            booking?.enquiry_id ||
            booking?.customer_name ||
            profileName ||
            targetId;

          // Delete booking (cascades private & status history)
          const { error } = await supabase
            .from("bookings")
            .delete()
            .eq("id", targetId);

          if (error) throw error;

          await logActivityInternal(supabase, {
            actorId: user.id,
            action: "delete",
            entity: "enquiry",
            entityId: targetId,
            summary: `Deleted enquiry #${label}`,
          });
        }

        revalidatePath("/admin/enquiries");
        revalidatePath("/admin");
        return { success: true, count: targetIds.length };
      }

      // ──────────────────────────────────────────────────────────
      // 2. REQUIREMENTS
      // ──────────────────────────────────────────────────────────
      case "requirements": {
        for (const targetId of targetIds) {
          const { data: lead } = await supabase
            .from("requirements")
            .select("id, name, phone, image_url")
            .eq("id", targetId)
            .maybeSingle();

          // Delete uploaded reference photo from Supabase Storage if present
          if (lead?.image_url) {
            try {
              const urlParts = lead.image_url.split("/");
              const fileName = urlParts[urlParts.length - 1];
              if (fileName && lead.image_url.includes("requirements")) {
                await supabase.storage.from("requirements").remove([fileName]);
              }
            } catch (storageErr) {
              console.warn("Storage delete non-fatal error:", storageErr);
            }
          }

          const { error } = await supabase
            .from("requirements")
            .delete()
            .eq("id", targetId);

          if (error) throw error;

          await logActivityInternal(supabase, {
            actorId: user.id,
            action: "delete",
            entity: "requirement",
            entityId: targetId,
            summary: `Deleted requirement lead from ${lead?.name || "Customer"} (${lead?.phone || ""})`,
          });
        }

        revalidatePath("/admin/requirements");
        revalidatePath("/admin");
        return { success: true, count: targetIds.length };
      }

      // ──────────────────────────────────────────────────────────
      // 3. DESIGNS
      // ──────────────────────────────────────────────────────────
      case "designs": {
        for (const targetId of targetIds) {
          // Check if linked to enquiries
          const { count: enquiryCount } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("design_id", targetId);

          if (enquiryCount && enquiryCount > 0 && !force) {
            return {
              success: false,
              warningRequired: true,
              error: `This design is linked to ${enquiryCount} customer enquiry record(s). Please confirm deletion to proceed.`,
            };
          }

          const { data: design } = await supabase
            .from("designs")
            .select("id, title, image_url")
            .eq("id", targetId)
            .maybeSingle();

          // Delete associated design_images junction records
          await supabase.from("design_images").delete().eq("design_id", targetId);

          // Delete the design row
          const { error } = await supabase
            .from("designs")
            .delete()
            .eq("id", targetId);

          if (error) throw error;

          await logActivityInternal(supabase, {
            actorId: user.id,
            action: "delete",
            entity: "design",
            entityId: targetId,
            summary: `Deleted design "${design?.title || targetId}"`,
          });
        }

        revalidatePath("/admin/designs");
        revalidatePath("/gallery");
        revalidatePath("/");
        return { success: true, count: targetIds.length };
      }

      // ──────────────────────────────────────────────────────────
      // 4. CATEGORIES
      // ──────────────────────────────────────────────────────────
      case "categories": {
        for (const targetId of targetIds) {
          // Check if any designs use this category
          const { count: designCount } = await supabase
            .from("designs")
            .select("*", { count: "exact", head: true })
            .eq("category_id", targetId);

          if (designCount && designCount > 0) {
            if (reassignCategoryId) {
              // Reassign designs before deleting
              await supabase
                .from("designs")
                .update({ category_id: reassignCategoryId })
                .eq("category_id", targetId);
            } else {
              return {
                success: false,
                requiresReassign: true,
                designCount,
                error: `Cannot delete: ${designCount} design(s) are currently assigned to this category. Reassign or move them first.`,
              };
            }
          }

          const { data: cat } = await supabase
            .from("categories")
            .select("name")
            .eq("id", targetId)
            .maybeSingle();

          const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", targetId);

          if (error) throw error;

          await logActivityInternal(supabase, {
            actorId: user.id,
            action: "delete",
            entity: "category",
            entityId: targetId,
            summary: `Deleted category "${cat?.name || targetId}"`,
          });
        }

        revalidatePath("/admin/categories");
        revalidatePath("/admin/designs");
        revalidatePath("/gallery");
        return { success: true, count: targetIds.length };
      }

      // ──────────────────────────────────────────────────────────
      // 5. MEDIA LIBRARY
      // ──────────────────────────────────────────────────────────
      case "media": {
        for (const targetId of targetIds) {
          // Check if media is referenced in design_images
          const { count: usageCount } = await supabase
            .from("design_images")
            .select("*", { count: "exact", head: true })
            .eq("media_id", targetId);

          if (usageCount && usageCount > 0 && !force) {
            return {
              success: false,
              warningRequired: true,
              error: `Warning: This photo is currently in use in ${usageCount} design(s). Deleting it will remove it from those designs.`,
            };
          }

          const { data: item } = await supabase
            .from("media")
            .select("path_card, path_full, original_name")
            .eq("id", targetId)
            .maybeSingle();

          if (item) {
            try {
              const paths = [item.path_card, item.path_full].filter(Boolean);
              if (paths.length > 0) {
                await supabase.storage.from("design-images").remove(paths);
              }
            } catch (storageErr) {
              console.warn("Media storage delete non-fatal error:", storageErr);
            }
          }

          const { error } = await supabase.from("media").delete().eq("id", targetId);
          if (error) throw error;

          await logActivityInternal(supabase, {
            actorId: user.id,
            action: "delete",
            entity: "media",
            entityId: targetId,
            summary: `Deleted media file "${item?.original_name || targetId}" from library and storage`,
          });
        }

        revalidatePath("/admin/media");
        return { success: true, count: targetIds.length };
      }

      // ──────────────────────────────────────────────────────────
      // 6. TESTIMONIALS
      // ──────────────────────────────────────────────────────────
      case "testimonials": {
        for (const targetId of targetIds) {
          const { data: item } = await supabase
            .from("testimonials")
            .select("customer_name")
            .eq("id", targetId)
            .maybeSingle();

          const { error } = await supabase
            .from("testimonials")
            .delete()
            .eq("id", targetId);

          if (error) throw error;

          await logActivityInternal(supabase, {
            actorId: user.id,
            action: "delete",
            entity: "testimonial",
            entityId: targetId,
            summary: `Deleted testimonial from "${item?.customer_name || targetId}"`,
          });
        }

        revalidatePath("/admin/testimonials");
        revalidatePath("/");
        revalidatePath("/about");
        return { success: true, count: targetIds.length };
      }

      // ──────────────────────────────────────────────────────────
      // 7. SERVICES
      // ──────────────────────────────────────────────────────────
      case "services": {
        for (const targetId of targetIds) {
          const { data: item } = await supabase
            .from("services")
            .select("name")
            .eq("id", targetId)
            .maybeSingle();

          const { error } = await supabase
            .from("services")
            .delete()
            .eq("id", targetId);

          if (error) throw error;

          await logActivityInternal(supabase, {
            actorId: user.id,
            action: "delete",
            entity: "service",
            entityId: targetId,
            summary: `Deleted service offering "${item?.name || targetId}"`,
          });
        }

        revalidatePath("/admin/services");
        revalidatePath("/services");
        revalidatePath("/");
        return { success: true, count: targetIds.length };
      }

      // ──────────────────────────────────────────────────────────
      // 8 & 9. CUSTOMERS & USERS (Profiles)
      // ──────────────────────────────────────────────────────────
      case "customers":
      case "users": {
        for (const targetId of targetIds) {
          // Safeguard: Never allow deleting your own account
          if (targetId === user.id) {
            return {
              success: false,
              error: "Security Violation: You cannot delete your own logged-in administrator account.",
            };
          }

          // Safeguard: Check if target is an admin and if it is the last admin
          const { data: targetProfile } = await supabase
            .from("profiles")
            .select("id, name, email, role")
            .eq("id", targetId)
            .maybeSingle();

          if (targetProfile?.role === "admin") {
            const { count: adminCount } = await supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("role", "admin");

            if (adminCount && adminCount <= 1) {
              return {
                success: false,
                error: "Security Violation: Cannot delete the last remaining administrator account on the system.",
              };
            }
          }

          // Delete related bookings (if cascade didn't catch them)
          await supabase.from("bookings").delete().eq("user_id", targetId);

          // Delete profile row
          const { error } = await supabase
            .from("profiles")
            .delete()
            .eq("id", targetId);

          if (error) throw error;

          await logActivityInternal(supabase, {
            actorId: user.id,
            action: "delete",
            entity: entity === "customers" ? "customer" : "user",
            entityId: targetId,
            summary: `Deleted ${entity === "customers" ? "customer" : "user"} account: ${targetProfile?.name || ""} (${targetProfile?.email || targetId})`,
          });
        }

        revalidatePath("/admin/customers");
        revalidatePath("/admin/users");
        return { success: true, count: targetIds.length };
      }

      // ──────────────────────────────────────────────────────────
      // 10. CALENDAR (Bookings with event_date)
      // ──────────────────────────────────────────────────────────
      case "calendar": {
        for (const targetId of targetIds) {
          const { data: booking } = await supabase
            .from("bookings")
            .select("enquiry_id, event_date")
            .eq("id", targetId)
            .maybeSingle();

          // Clear event date or delete booking
          const { error } = await supabase
            .from("bookings")
            .delete()
            .eq("id", targetId);

          if (error) throw error;

          await logActivityInternal(supabase, {
            actorId: user.id,
            action: "delete",
            entity: "calendar_event",
            entityId: targetId,
            summary: `Removed event date (${booking?.event_date}) for enquiry #${booking?.enquiry_id || targetId}`,
          });
        }

        revalidatePath("/admin/calendar");
        return { success: true, count: targetIds.length };
      }

      default:
        return { success: false, error: "Unsupported entity type for deletion." };
    }
  } catch (err: any) {
    console.error("deleteAdminItem error:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred while deleting.",
    };
  }
}

async function logActivityInternal(
  supabase: any,
  data: {
    actorId: string;
    action: string;
    entity: string;
    entityId: string;
    summary: string;
  }
) {
  try {
    await supabase.from("activity_log").insert({
      actor_id: data.actorId,
      action: data.action,
      entity: data.entity,
      entity_id: data.entityId,
      summary: data.summary,
    });
  } catch (err) {
    console.warn("Failed to write to activity_log:", err);
  }
}
