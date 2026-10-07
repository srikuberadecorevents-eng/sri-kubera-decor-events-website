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
  MoreHorizontal,
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
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
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
    // Also match legacy routes like /admin/gallery to /admin/designs
    if (href === "/admin/designs" && pathname.startsWith("/admin/gallery")) return true;
    if (href === "/admin/customers" && pathname.startsWith("/admin/users")) return true;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#FAF6EC] flex flex-col md:flex-row text-[#17211E]">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden md:flex flex-col bg-[#0B4A3A] text-white fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ease-in-out border-r border-[#08372B] ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand & Collapse toggle */}
        <div className="flex items-center justify-between p-4 border-b border-[#0E5A47]">
          <Link
            href="/admin"
            className="flex items-center gap-3 overflow-hidden group"
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
            className="text-[#E8E2D5]/70 hover:text-white p-1 rounded-lg hover:bg-[#0E5A47] transition-colors cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {mainNavItems.map(({ href, label, icon: Icon, badgeKey }) => {
            const active = isCurrent(href);
            const badgeCount = badgeKey ? counts[badgeKey] : 0;

            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group min-h-[44px] ${
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

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#0E5A47] space-y-1">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#FAF6EC]/70 hover:bg-[#0E5A47] hover:text-white transition-colors min-h-[40px] ${
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
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-medium text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors min-h-[40px] cursor-pointer ${
              collapsed ? "justify-center" : ""
            }`}
            title="Sign Out"
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0B4A3A] text-white px-4 py-3 flex items-center justify-between border-b border-[#08372B] shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#08372B] text-[#C9A24B] flex items-center justify-center border border-[#C9A24B]/30">
            <Shield size={16} />
          </div>
          <span className="font-serif font-bold text-base tracking-wide text-white truncate">
            Sri Kubera Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="text-[#FAF6EC]/80 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="View public site"
          >
            <ExternalLink size={18} />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMoreOpen(true)}
            className="text-[#FAF6EC]/80 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main
        className={`flex-1 min-w-0 p-4 sm:p-6 md:p-8 transition-all duration-300 pb-28 md:pb-12 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {children}
      </main>

      {/* ── Mobile Bottom Tab Bar (< 768px) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E2D5] px-2 py-1 shadow-lg flex items-center justify-around">
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-h-[48px] min-w-[56px] text-xs font-medium transition-colors ${
            pathname === "/admin"
              ? "text-[#0B4A3A] font-bold"
              : "text-[#5D6D67] hover:text-[#17211E]"
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        <Link
          href="/admin/enquiries"
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-h-[48px] min-w-[56px] text-xs font-medium transition-colors ${
            pathname.startsWith("/admin/enquiries")
              ? "text-[#0B4A3A] font-bold"
              : "text-[#5D6D67] hover:text-[#17211E]"
          }`}
        >
          <div className="relative">
            <ClipboardList size={20} />
            {counts.pendingEnquiries > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {counts.pendingEnquiries > 9 ? "9+" : counts.pendingEnquiries}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Enquiries</span>
        </Link>

        <Link
          href="/admin/designs"
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-h-[48px] min-w-[56px] text-xs font-medium transition-colors ${
            pathname.startsWith("/admin/designs") || pathname.startsWith("/admin/gallery")
              ? "text-[#0B4A3A] font-bold"
              : "text-[#5D6D67] hover:text-[#17211E]"
          }`}
        >
          <Palette size={20} />
          <span className="text-[10px] mt-0.5">Designs</span>
        </Link>

        <Link
          href="/admin/requirements"
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-h-[48px] min-w-[56px] text-xs font-medium transition-colors ${
            pathname.startsWith("/admin/requirements")
              ? "text-[#0B4A3A] font-bold"
              : "text-[#5D6D67] hover:text-[#17211E]"
          }`}
        >
          <div className="relative">
            <Sparkles size={20} />
            {counts.newRequirements > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {counts.newRequirements > 9 ? "9+" : counts.newRequirements}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Leads</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMoreOpen(true)}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-h-[48px] min-w-[56px] text-xs font-medium text-[#5D6D67] hover:text-[#17211E] cursor-pointer"
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>

      {/* ── Mobile More Slide-Up Sheet ── */}
      {mobileMoreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setMobileMoreOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl max-h-[85dvh] overflow-y-auto p-5 border-t border-[#E8E2D5] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5] mb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#17211E]">
                  Navigation Menu
                </h3>
                <p className="text-xs text-[#5D6D67]">Logged in as {adminName}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                className="p-2 text-[#5D6D67] hover:text-[#17211E] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 py-2">
              {mainNavItems.map(({ href, label, icon: Icon, badgeKey }) => {
                const active = isCurrent(href);
                const badgeCount = badgeKey ? counts[badgeKey] : 0;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMoreOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-medium transition-colors min-h-[44px] ${
                      active
                        ? "bg-[#0B4A3A] text-white"
                        : "bg-[#FAF6EC] text-[#17211E] hover:bg-[#E8E2D5]"
                    }`}
                  >
                    <Icon size={18} className={active ? "text-[#C9A24B]" : "text-[#0B4A3A]"} />
                    <span className="truncate flex-1">{label}</span>
                    {badgeCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 mt-2 border-t border-[#E8E2D5] space-y-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#E8E2D5] text-xs font-medium text-[#17211E] min-h-[44px]"
              >
                <ExternalLink size={16} />
                Open Public Website
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-200 min-h-[44px] cursor-pointer"
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
