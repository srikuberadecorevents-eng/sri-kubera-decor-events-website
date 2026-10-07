import { redirect } from "next/navigation";

export default function GalleryNewRedirectPage() {
  redirect("/admin/designs/new");
}
