import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ClipboardList,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Booking } from "@/types";

export const metadata: Metadata = {
  title: "Customer Profile | Sri Kubera Admin",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: customer }, { data: bookings }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase
      .from("bookings")
      .select("*, designs(title, image_url, price, categories(name))")
      .eq("user_id", id)
      .order("booking_date", { ascending: false }),
  ]);

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/customers"
          className="p-2 text-[#5D6D67] hover:text-[#17211E] rounded-xl hover:bg-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-[#E8E2D5]"
          aria-label="Back to customers"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#17211E]">
            {customer.name}
          </h1>
          <p className="text-xs text-[#5D6D67] mt-0.5">
            Customer Account Profile &amp; Booking History
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E8E2D5] pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0B4A3A] text-white flex items-center justify-center text-lg font-bold shrink-0">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-base text-[#17211E]">
                  {customer.name}
                </h2>
                <span className="text-[11px] text-[#5D6D67]">
                  Joined {new Date(customer.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#5D6D67] block text-[11px]">Phone</span>
                <a
                  href={`tel:${customer.phone}`}
                  className="font-semibold text-sm text-[#0B4A3A] hover:underline"
                >
                  {customer.phone || "—"}
                </a>
              </div>

              <div>
                <span className="text-[#5D6D67] block text-[11px]">Email</span>
                <span className="font-medium text-xs text-[#17211E] break-all">
                  {customer.email}
                </span>
              </div>

              {customer.address && (
                <div>
                  <span className="text-[#5D6D67] block text-[11px]">Address</span>
                  <span className="text-xs text-[#17211E]">
                    {customer.address}
                    {customer.pincode ? `, Pincode: ${customer.pincode}` : ""}
                  </span>
                </div>
              )}

              {customer.gender && (
                <div>
                  <span className="text-[#5D6D67] block text-[11px]">Gender</span>
                  <span className="text-xs capitalize text-[#17211E]">
                    {customer.gender}
                  </span>
                </div>
              )}
            </div>

            {customer.phone && (
              <div className="pt-3 border-t border-[#E8E2D5]">
                <a
                  href={`tel:${customer.phone}`}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#0B4A3A] hover:bg-[#0E5A47] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone size={14} />
                  Call Customer
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Bookings History (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8E2D5] p-5 shadow-xs">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#17211E] border-b border-[#E8E2D5] pb-3 mb-4 flex items-center justify-between">
              <span>Booking Enquiries History</span>
              <span className="text-[#0B4A3A] font-bold">
                {bookings?.length || 0} enquiry{bookings?.length !== 1 ? "s" : ""}
              </span>
            </h2>

            {!bookings?.length ? (
              <p className="text-xs text-[#5D6D67] p-4 text-center">
                This customer has not submitted any decoration enquiries yet.
              </p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b: any) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-[#E8E2D5] bg-[#FAF6EC]/40 hover:bg-[#FAF6EC] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {b.designs?.image_url && (
                        <div className="relative w-14 h-12 rounded-lg overflow-hidden bg-[#FAF6EC] shrink-0 border border-[#E8E2D5]">
                          <Image
                            src={b.designs.image_url}
                            alt={b.designs.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0B4A3A]">
                            #{b.enquiry_id}
                          </span>
                          <StatusBadge status={b.status} size="sm" />
                        </div>
                        <p className="text-xs font-medium text-[#17211E] mt-0.5">
                          {b.designs?.title || "Custom Stage Decoration"}
                        </p>
                        <p className="text-[11px] text-[#5D6D67] mt-0.5">
                          Enquired: {new Date(b.booking_date).toLocaleDateString("en-IN")}
                          {b.event_date && (
                            <span className="ml-2 font-medium text-[#0B4A3A]">
                              • Event: {new Date(b.event_date).toLocaleDateString("en-IN")}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/admin/enquiries/${b.id}`}
                      className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-white border border-[#E8E2D5] hover:bg-[#0B4A3A] hover:text-white text-xs font-medium text-[#17211E] flex items-center justify-center gap-1 transition-colors self-end sm:self-center"
                    >
                      <Eye size={13} />
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
