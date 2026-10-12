"use server";

import { revalidatePath } from "next/cache";
import { checkIsAdmin } from "@/lib/admin";

/**
 * Revalidate public cached pages so changes reflect instantly.
 * Defense-in-depth: only users with role === 'admin' can trigger revalidation.
 */
export async function revalidatePublicPages(paths: string[] = ["/", "/gallery", "/services"]) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    return { error: "Unauthorized: admin role required" };
  }

  try {
    for (const p of paths) {
      revalidatePath(p);
    }
    return { success: true };
  } catch (error) {
    console.warn("Failed to revalidate public path:", error);
    return { error: "Failed to revalidate" };
  }
}

