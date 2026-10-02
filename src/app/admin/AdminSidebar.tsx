"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Images,
  Tags,
  ClipboardList,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/enquiries", label: "Enquiries", icon: ClipboardList },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Business Settings", icon: Settings },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-navy-700">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={18} className="text-gold-400" />
          <span className="text-white font-serif font-bold text-sm">Admin Panel</span>
        </div>
        <p className="text-cream-400 text-xs truncate">{adminName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(href)
                ? "bg-gold-500 text-navy-900"
                : "text-cream-300 hover:bg-navy-700 hover:text-white"
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-navy-700 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-navy-900 flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-navy-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-gold-400" />
          <span className="text-white font-serif font-bold text-sm">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-cream-200 p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside
            className="w-64 bg-navy-900 h-full pt-14"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile top spacing */}
      <div className="md:hidden h-14" />
    </>
  );
}
