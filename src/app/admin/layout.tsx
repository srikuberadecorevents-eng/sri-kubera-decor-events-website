import type { Metadata } from "next";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user or non-admin, render children directly (allows /admin/login and /admin/403 to render cleanly)
  if (!user) {
    return <div className="min-h-screen bg-[#FAF6EC]">{children}</div>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
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
      <AdminLayoutShell adminName={profile.name || "Administrator"}>
        {children}
      </AdminLayoutShell>
    </RealtimeBadgesProvider>
  );
}
