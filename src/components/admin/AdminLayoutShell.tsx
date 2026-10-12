"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Palette,
  Sparkles,
  Calendar,
  Image as ImageIcon,
  Tags,
  Users,
  Briefcase,
  Star,
  FileText,
  Settings,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeBadges } from "./RealtimeBadgesProvider";
import toast from "react-hot-toast";

interface AdminLayoutShellProps {
  adminName: string;
  children: React.ReactNode;
}

const mainNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/enquiries",
    label: "Enquiries",
    icon: ClipboardList,
    badgeKey: "pendingEnquiries" as const,
  },
  { href: "/admin/designs", label: "Designs", icon: Palette },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/calendar", label: "Calendar", icon: Calendar },
  {
    href: "/admin/requirements",
    label: "Requirements",
    icon: Sparkles,
    badgeKey: "newRequirements" as const,
  },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/users", label: "Users & Roles", icon: Shield },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/site-content", label: "Site Content", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/activity", label: "Activity Log", icon: History },
];

export function AdminLayoutShell({
  adminName,
  children,
}: AdminLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { counts } = useRealtimeBadges();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/admin/login");
    router.refresh();
  };

  const isCurrent = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/designs" && pathname.startsWith("/admin/gallery")) return true;
    return pathname.startsWith(href);
  };

  return (
    <div
      className={`h-dvh w-full overflow-hidden bg-[#FAF6EC] grid grid-cols-1 ${
        collapsed ? "lg:grid-cols-[80px_1fr]" : "lg:grid-cols-[260px_1fr]"
      } text-[#17211E] transition-[grid-template-columns] duration-300 ease-in-out`}
    >
      {/* Desktop Sidebar (Real Grid Column, Not Fixed Overlay) */}
      <aside className="hidden lg:flex flex-col h-dvh bg-[#0B4A3A] text-white border-r border-[#08372B] select-none shrink-0 overflow-hidden">
        {/* Brand & Collapse Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#0E5A47] shrink-0 min-h-[64px]">
          <Link
            href="/admin"
            className="flex items-center gap-3 overflow-hidden group min-w-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#08372B] text-[#C9A24B] flex items-center justify-center shrink-0 border border-[#C9A24B]/30 group-hover:scale-105 transition-transform">
              <Shield size={20} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="font-serif font-bold text-sm tracking-wide text-white block truncate">
                  Sri Kubera Admin
                </span>
                <span className="text-[11px] text-[#E8E2D5]/70 block truncate">
                  {adminName}
                </span>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#E8E2D5]/70 hover:text-white p-1 rounded-lg hover:bg-[#0E5A47] transition-colors cursor-pointer shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 overscroll-contain">
          {mainNavItems.map(({ href, label, icon: Icon, badgeKey }) => {
            const active = isCurrent(href);
            const badgeCount = badgeKey ? counts[badgeKey] : 0;

            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group min-h-[40px] ${
                  active
                    ? "bg-[#C9A24B] text-[#05241C] shadow-sm font-semibold"
                    : "text-[#FAF6EC]/85 hover:bg-[#0E5A47] hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <div className="relative shrink-0 flex items-center justify-center">
                  <Icon size={18} />
                  {collapsed && badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{label}</span>
                    {badgeCount > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          active
                            ? "bg-[#0B4A3A] text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions Footer (with padding-bottom >= 16px to prevent dev badge overlap) */}
        <div className="p-3 pb-6 border-t border-[#0E5A47] space-y-1 shrink-0 bg-[#08372B]">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#FAF6EC]/80 hover:bg-[#0E5A47] hover:text-white transition-colors min-h-[40px] ${
              collapsed ? "justify-center" : ""
            }`}
            title="Open Public Website"
          >
            <ExternalLink size={16} />
            {!collapsed && <span>View Public Site</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-medium text-red-300 hover:bg-red-900/40 hover:text-red-200 transition-colors min-h-[40px] cursor-pointer ${
              collapsed ? "justify-center" : ""
            }`}
            title="Sign Out"
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Content Column (Independent Scroll Container) */}
      <div className="flex flex-col h-dvh min-w-0 overflow-y-auto bg-[#FAF6EC]">
        {/* Mobile/Tablet Sticky Top Bar (< lg) */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#0B4A3A] text-white px-4 py-3 flex items-center justify-between border-b border-[#08372B] shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="text-[#FAF6EC]/85 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[#0E5A47] transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#08372B] text-[#C9A24B] flex items-center justify-center border border-[#C9A24B]/30">
                <Shield size={16} />
              </div>
              <span className="font-serif font-bold text-base tracking-wide text-white truncate">
                Sri Kubera Admin
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              target="_blank"
              className="text-[#FAF6EC]/80 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-[#0E5A47] transition-colors"
              aria-label="View public site"
              title="View Public Site"
            >
              <ExternalLink size={18} />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-red-300 hover:text-red-100 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-red-900/30 transition-colors cursor-pointer"
              aria-label="Sign out"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Admin Footer Line inside Content Area */}
        <footer className="mt-auto px-6 py-4 text-center text-xs text-[#5D6D67] border-t border-[#E8E2D5]/70 shrink-0">
          Sri Kubera Admin v1.0 &bull; Sri Kubera Decor &amp; Events
        </footer>
      </div>

      {/* Slide-in Drawer on screens below lg (< 1024px) */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-dvh bg-[#0B4A3A] text-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 border-r border-[#08372B]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#0E5A47] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#08372B] text-[#C9A24B] flex items-center justify-center shrink-0 border border-[#C9A24B]/30">
                  <Shield size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-sm text-white truncate">
                    Sri Kubera Admin
                  </h3>
                  <p className="text-[11px] text-[#E8E2D5]/70 truncate">{adminName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-[#FAF6EC]/70 hover:text-white rounded-lg hover:bg-[#0E5A47] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Nav Items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {mainNavItems.map(({ href, label, icon: Icon, badgeKey }) => {
                const active = isCurrent(href);
                const badgeCount = badgeKey ? counts[badgeKey] : 0;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                      active
                        ? "bg-[#C9A24B] text-[#05241C] font-semibold shadow-sm"
                        : "text-[#FAF6EC]/85 hover:bg-[#0E5A47] hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1 truncate">{label}</span>
                    {badgeCount > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          active
                            ? "bg-[#0B4A3A] text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer Actions */}
            <div className="p-4 pb-8 border-t border-[#0E5A47] space-y-2 shrink-0 bg-[#08372B]">
              <Link
                href="/"
                target="_blank"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#0E5A47] text-xs font-medium text-[#FAF6EC]/90 hover:bg-[#0E5A47] hover:text-white min-h-[44px] transition-colors"
              >
                <ExternalLink size={16} />
                Open Public Website
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-200 text-xs font-medium border border-red-800/60 min-h-[44px] cursor-pointer transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
