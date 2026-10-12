"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { openAuthModal } from "@/lib/authModal";
import { createClient } from "@/lib/supabase/client";

interface GatedGalleryLinkProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  modalTitle?: string;
  modalDescription?: string;
  id?: string;
}

export default function GatedGalleryLink({
  href = "/gallery",
  className = "",
  children,
  modalTitle = "Sign in or sign up to view the full gallery",
  modalDescription = "Create a free account or sign in to browse our complete collection of 35+ royal wedding, birthday, and special celebration stages in high definition.",
  id,
}: GatedGalleryLinkProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoggedIn !== true) {
      e.preventDefault();
      openAuthModal({
        title: modalTitle,
        description: modalDescription,
        redirectUrl: href,
      });
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} id={id}>
      {children}
    </Link>
  );
}
