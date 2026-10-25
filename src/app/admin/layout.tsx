import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";
import { RealtimeBadgesProvider } from "@/components/admin/RealtimeBadgesProvider";

export const metadata: Metadata = {
  title: {
    default: "Admin Panel | Sri Kubera Decor & Events",
    template: "%s | Sri Kubera Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const testCookie =
    process.env.NODE_ENV !== "production"
      ? cookieStore.get("test_auth_user")?.value
      : null;
  let user: any = null;
  let adminRole = false;
  let adminName = "Administrator";

  if (testCookie) {
    try {
      user = JSON.parse(decodeURIComponent(testCookie));
      adminRole = user?.user_metadata?.role === "admin";
      adminName = user?.user_metadata?.name || "Administrator";
    } catch {}
  }

  const supabase = await createClient();
  if (!user) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  }

  // If no user or non-admin, render children directly (allows /admin/login and /admin/403 to render cleanly)
  if (!user) {
    return <div className="min-h-screen bg-[#FAF6EC]">{children}</div>;
  }

  if (!adminRole) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, name")
      .eq("id", user.id)
      .single();
    if (profile?.role === "admin") {
      adminRole = true;
      adminName = profile.name || adminName;
    }
  }

  if (!adminRole) {
    return <div className="min-h-screen bg-[#FAF6EC]">{children}</div>;
  }

  // Fetch initial counts server-side for fast first paint
  const [{ count: pendingCount }, { count: newReqCount }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("requirements")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  return (
    <RealtimeBadgesProvider
      initialCounts={{
        pendingEnquiries: pendingCount || 0,
        newRequirements: newReqCount || 0,
      }}
    >
      <AdminLayoutShell adminName={adminName}>
        {children}
      </AdminLayoutShell>
    </RealtimeBadgesProvider>
  );
}
