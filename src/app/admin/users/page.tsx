import type { Metadata } from "next";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Manage Users" };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, bookings(id)")
    .eq("role", "user")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-navy-900">Users</h1>
        <p className="text-navy-500 text-sm mt-1">{profiles?.length || 0} registered users</p>
      </div>

      <div className="card overflow-hidden">
        {!profiles?.length ? (
          <div className="p-10 text-center">
            <Users size={40} className="text-navy-200 mx-auto mb-3" />
            <p className="text-navy-400 text-sm">No registered users yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-100 text-left">
                  <th className="px-5 py-3 font-semibold text-navy-700 text-xs uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3 font-semibold text-navy-700 text-xs uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="px-5 py-3 font-semibold text-navy-700 text-xs uppercase tracking-wide hidden sm:table-cell">Phone</th>
                  <th className="px-5 py-3 font-semibold text-navy-700 text-xs uppercase tracking-wide">Enquiries</th>
                  <th className="px-5 py-3 font-semibold text-navy-700 text-xs uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-gradient flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{p.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-navy-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-navy-600 hidden md:table-cell">{p.email}</td>
                    <td className="px-5 py-3.5 text-navy-600 hidden sm:table-cell">{p.phone}</td>
                    <td className="px-5 py-3.5">
                      <span className="badge bg-navy-100 text-navy-700">
                        {(p.bookings as any[])?.length || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-navy-400 text-xs hidden lg:table-cell">
                      {new Date(p.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/users/${p.id}`} className="btn-ghost text-xs py-1.5 px-2.5">
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
