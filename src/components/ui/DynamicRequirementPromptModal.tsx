"use client";

import dynamic from "next/dynamic";

const RequirementPromptModal = dynamic(
  () => import("@/components/ui/RequirementPromptModal"),
  { ssr: false }
);

export default function DynamicRequirementPromptModal() {
  return <RequirementPromptModal />;
}
