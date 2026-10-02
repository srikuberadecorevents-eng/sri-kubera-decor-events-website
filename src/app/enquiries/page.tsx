import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, ArrowRight, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/ui/StatusBadge";
import type { BookingStatus } from "@/types";

export const metadata: Metadata = { title: "My Enquiries" };

export default async function MyEnquiriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, designs(title, image_url, categories(name))")
    .eq("user_id", user.id)
    .order("booking_date", { ascending: false });

  return (
    <div className="py-12 bg-cream-100 min-h-screen">
      <div className="page-container max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-navy-900">My Enquiries</h1>
            <p className="text-navy-500 text-sm mt-1">
              {bookings?.length || 0} enquir{bookings?.length === 1 ? "y" : "ies"} total
            </p>
          </div>
          <Link href="/gallery" className="btn-primary text-sm px-5 py-2.5">
            Browse More Designs
          </Link>
        </div>

        {!bookings?.length ? (
          <div className="card p-12 text-center">
            <ClipboardList size={48} className="text-navy-200 mx-auto mb-4" />
            <h2 className="font-serif font-semibold text-navy-700 text-xl mb-2">
              No enquiries yet
            </h2>
            <p className="text-navy-400 text-sm mb-6 max-w-sm mx-auto">
              Find a design you love in our gallery and raise a free enquiry to
              get the process started.
            </p>
            <Link href="/gallery" className="btn-primary">Explore Gallery</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const design = booking.designs as any;
              return (
                <Link
                  key={booking.id}
                  href={`/enquiries/${booking.id}`}
                  className="card-hover flex items-center gap-4 p-4 md:p-5 group"
                >
                  {/* Design thumbnail */}
                  {design?.image_url && (
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-cream-200">
                      <img
                        src={design.image_url}
                        alt={design.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-bold text-navy-900 text-lg tracking-wider">
                      {booking.enquiry_id}
                    </p>
                    <p className="text-navy-600 text-sm truncate">
                      {design?.title || "Design"}
                    </p>
                    {design?.categories?.name && (
                      <p className="text-navy-400 text-xs">{design.categories.name}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={booking.status as BookingStatus} />
                    <span className="text-navy-400 text-xs flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(booking.booking_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <ArrowRight
                    size={16}
                    className="text-navy-300 shrink-0 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
