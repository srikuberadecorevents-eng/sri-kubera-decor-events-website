import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";

export const metadata: Metadata = {
  title: "Access Restricted | Sri Kubera Admin",
  robots: { index: false, follow: false },
};

export default function ForbiddenAdminPage() {
  return (
    <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#E8E2D5] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 border border-amber-200">
          <ShieldAlert size={32} />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#17211E] mb-2">
          Access Restricted
        </h1>
        <p className="text-sm text-[#5D6D67] mb-6 leading-relaxed">
          Your account does not have administrator privileges to view the Sri Kubera Decor &amp; Events management panel.
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#0B4A3A] text-white text-sm font-medium hover:bg-[#0E5A47] transition-colors"
          >
            <ArrowLeft size={16} />
            Go to Customer Dashboard
          </Link>
          <Link
            href="/admin/login"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-[#E8E2D5] text-[#17211E] text-sm font-medium hover:bg-[#FAF6EC] transition-colors"
          >
            <LogOut size={16} />
            Sign In with Admin Account
          </Link>
        </div>
      </div>
    </div>
  );
}
