import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EnquiryDetailClient } from "./EnquiryDetailClient";

export const metadata: Metadata = {
  title: "Enquiry Details | Sri Kubera Admin",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEnquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "*, profiles(*), designs(*, categories(*)), booking_private(*), booking_status_history(*, profiles(name))"
    )
    .eq("id", id)
    .single();

  if (!booking) notFound();

  // Order status history newest first
  if (booking.booking_status_history) {
    booking.booking_status_history.sort(
      (a: any, b: any) =>
        new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
    );
  }

  return <EnquiryDetailClient initialBooking={booking} />;
}
