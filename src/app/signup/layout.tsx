import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account - Sri Kubera Decor & Events",
  description: "Create an account with Sri Kubera Decor & Events to manage your luxury event decoration bookings.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
