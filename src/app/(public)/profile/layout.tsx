import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile - Sri Kubera Decor & Events",
  description: "Manage your client account profile and event coordination settings.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
