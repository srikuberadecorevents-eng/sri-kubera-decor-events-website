"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function GalleryEnquireButton({ designId }: { designId: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  if (isLoggedIn) {
    return (
      <Link
        href={`/gallery/${designId}/enquire`}
        className="btn-primary w-full text-center text-sm py-3.5 justify-center"
      >
        <MessageCircle size={17} />
        Raise Portal Booking Request
      </Link>
    );
  }

  return (
    <Link
      href={`/login?redirectTo=/gallery/${designId}`}
      className="btn-primary w-full text-center text-sm py-3.5 justify-center"
    >
      Login to Book / Save Enquiry
    </Link>
  );
}
