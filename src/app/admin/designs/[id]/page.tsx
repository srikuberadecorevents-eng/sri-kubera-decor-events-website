import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import DesignForm from "@/components/admin/DesignForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDesignPage({ params }: PageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: design } = await supabase
    .from("designs")
    .select("*, categories(*), design_images(*, media(*))")
    .eq("id", id)
    .single();

  if (!design) {
    notFound();
  }

  return <DesignForm initialDesign={design} />;
}
