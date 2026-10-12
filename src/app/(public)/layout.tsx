import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import DynamicRequirementPromptModal from "@/components/ui/DynamicRequirementPromptModal";
import DynamicSignupPromptModal from "@/components/ui/DynamicSignupPromptModal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* pt-16 = 64px = header height */}
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <WhatsAppButton />
      <DynamicRequirementPromptModal />
      <DynamicSignupPromptModal />
    </div>
  );
}
