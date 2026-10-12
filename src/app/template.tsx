"use client";

import React from "react";
import { usePathname } from "next/navigation";
import PageTransitionProvider from "@/components/providers/PageTransitionProvider";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <PageTransitionProvider key={pathname}>{children}</PageTransitionProvider>;
}
