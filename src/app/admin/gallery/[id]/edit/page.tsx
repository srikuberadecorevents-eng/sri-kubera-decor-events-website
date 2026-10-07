import { redirect } from "next/navigation";

export default async function GalleryEditRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/designs/${id}`);
}
