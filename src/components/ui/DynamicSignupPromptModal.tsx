"use client";

import dynamic from "next/dynamic";

const SignupPromptModal = dynamic(
  () => import("@/components/ui/SignupPromptModal"),
  { ssr: false }
);

export default function DynamicSignupPromptModal() {
  return <SignupPromptModal />;
}
