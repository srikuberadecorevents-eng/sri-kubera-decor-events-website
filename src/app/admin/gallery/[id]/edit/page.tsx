import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DesignForm from "../../DesignForm";

export const metadata: Metadata = { title: "Edit Design" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditDesignPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: design } = await supabase
    .from("designs")
    .select("*")
    .eq("id", id)
    .single();

  if (!design) notFound();

  return (
    <DesignForm
      initialData={{
        id: design.id,
        title: design.title,
        category_id: design.category_id || undefined,
        description: design.description || undefined,
        price: design.price || undefined,
        inclusions: design.inclusions || undefined,
        image_url: design.image_url,
      }}
    />
  );
}
