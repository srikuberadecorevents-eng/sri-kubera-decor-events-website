"use server";

import { revalidatePath } from "next/cache";

/**
 * Revalidate public cached pages so changes reflect instantly
 */
export async function revalidatePublicPages(paths: string[] = ["/", "/gallery", "/services"]) {
  try {
    for (const p of paths) {
      revalidatePath(p);
    }
  } catch (error) {
    console.warn("Failed to revalidate public path:", error);
  }
}
