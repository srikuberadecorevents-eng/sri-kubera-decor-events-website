"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface BadgeCounts {
  pendingEnquiries: number;
  newRequirements: number;
}

interface RealtimeBadgesContextValue {
  counts: BadgeCounts;
  refresh: () => Promise<void>;
}

const RealtimeBadgesContext = createContext<RealtimeBadgesContextValue>({
  counts: { pendingEnquiries: 0, newRequirements: 0 },
  refresh: async () => {},
});

export function RealtimeBadgesProvider({
  children,
  initialCounts = { pendingEnquiries: 0, newRequirements: 0 },
}: {
  children: React.ReactNode;
  initialCounts?: BadgeCounts;
}) {
  const [counts, setCounts] = useState<BadgeCounts>(initialCounts);
  const supabase = createClient();

  const fetchCounts = async () => {
    try {
      const [{ count: pendingCount }, { count: newReqCount }] =
        await Promise.all([
          supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("requirements")
            .select("*", { count: "exact", head: true })
            .eq("status", "new"),
        ]);

      setCounts({
        pendingEnquiries: pendingCount || 0,
        newRequirements: newReqCount || 0,
      });
    } catch (err) {
      console.error("Failed to fetch badge counts:", err);
    }
  };

  useEffect(() => {
    fetchCounts();

    // 1. Supabase Realtime channel
    const channel = supabase
      .channel("admin-badge-counts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => fetchCounts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "requirements" },
        () => fetchCounts()
      )
      .subscribe();

    // 2. Polling fallback every 45 seconds
    const interval = setInterval(fetchCounts, 45000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return (
    <RealtimeBadgesContext.Provider value={{ counts, refresh: fetchCounts }}>
      {children}
    </RealtimeBadgesContext.Provider>
  );
}

export function useRealtimeBadges() {
  return useContext(RealtimeBadgesContext);
}
